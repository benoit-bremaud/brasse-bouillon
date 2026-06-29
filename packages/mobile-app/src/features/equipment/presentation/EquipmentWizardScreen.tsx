import { colors, radius, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { createEquipmentProfile } from "@/features/equipment/application/equipment.use-cases";
import {
  EQUIPMENT_SYSTEM_OPTIONS,
  EquipmentSystemOption,
} from "@/features/equipment/domain/equipment-system-options";
import {
  EquipmentProfile,
  EquipmentProfileInput,
  EquipmentSystemType,
} from "@/features/equipment/domain/equipment.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

/** Wizard step: 3 questions then a recap/confirm. */
type WizardStep = 1 | 2 | 3 | 4;

const LAST_STEP: WizardStep = 4;

/**
 * Normalise a FR-style comma decimal ("12,5") to a dot before parsing,
 * otherwise parseFloat stops at the comma and silently truncates.
 */
function parseVolume(text: string): number {
  return parseFloat(text.replace(",", "."));
}

function isPositive(value: number): boolean {
  return !Number.isNaN(value) && value > 0;
}

function findOption(
  systemType: EquipmentSystemType | null,
): EquipmentSystemOption | null {
  return (
    EQUIPMENT_SYSTEM_OPTIONS.find((option) => option.value === systemType) ??
    null
  );
}

/**
 * Equipment wizard (E1 — US "créer mon matériel").
 *
 * Asks the novice three questions — system type, fermenter volume, largest
 * kettle volume — then confirms. The technical constants (efficiency, boil-off
 * rate, mash-tun volume) are seeded server-side, never asked here. On success
 * the freshly-created profile appears in the equipment screen.
 */
export function EquipmentWizardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = React.useState<WizardStep>(1);
  const [systemType, setSystemType] =
    React.useState<EquipmentSystemType | null>(null);
  const [fermenterText, setFermenterText] = React.useState("");
  const [kettleText, setKettleText] = React.useState("");
  const [nameText, setNameText] = React.useState("");

  const fermenterVolumeL = parseVolume(fermenterText);
  const kettleVolumeL = parseVolume(kettleText);
  const selectedOption = findOption(systemType);

  const {
    mutate: mutateCreate,
    isPending,
    error: mutationError,
  } = useMutation<EquipmentProfile, Error, EquipmentProfileInput>({
    mutationFn: (input: EquipmentProfileInput) => createEquipmentProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["equipment", "list"] });
      router.replace("/equipment");
    },
  });

  const isStepValid = ((): boolean => {
    switch (step) {
      case 1:
        return systemType !== null;
      case 2:
        return isPositive(fermenterVolumeL);
      case 3:
        return isPositive(kettleVolumeL);
      case 4:
        return nameText.trim() !== "";
      default:
        return false;
    }
  })();

  const handleBack = () => {
    if (step > 1) {
      setStep((current) => (current - 1) as WizardStep);
      return;
    }
    router.back();
  };

  const handleNext = () => {
    if (!isStepValid) {
      return;
    }
    // Entering the recap: pre-fill an editable default name (minimal friction).
    if (step === 3 && nameText.trim() === "" && selectedOption) {
      setNameText(`${selectedOption.shortLabel} ${fermenterVolumeL} L`);
    }
    setStep((current) => (current + 1) as WizardStep);
  };

  const handleCreate = () => {
    if (!isStepValid || systemType === null) {
      return;
    }
    mutateCreate({
      name: nameText.trim(),
      systemType,
      fermenterVolumeL,
      boilKettleVolumeL: kettleVolumeL,
    });
  };

  return (
    <Screen>
      <ListHeader
        title="Mon matériel"
        subtitle={step < LAST_STEP ? `Question ${step} / 3` : "Récapitulatif"}
        action={
          <HeaderBackButton
            label="Retour"
            accessibilityLabel="Étape précédente"
            onPress={handleBack}
          />
        }
      />

      {step === 1 ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Quel type de système ?</Text>
          <Text style={styles.helpText}>
            Choisis ce qui ressemble le plus à ton installation. Pas
            d'inquiétude : tu pourras affiner plus tard.
          </Text>

          <View style={styles.optionList}>
            {EQUIPMENT_SYSTEM_OPTIONS.map((option) => {
              const selected = option.value === systemType;
              return (
                <Pressable
                  key={option.value}
                  testID={`equipment-system-option-${option.value}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => setSystemType(option.value)}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      selected && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionHelp,
                      selected && styles.optionHelpSelected,
                    ]}
                  >
                    {option.help}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Volume de ton fermenteur ?</Text>
          <Text style={styles.helpText}>
            En litres. C'est ce volume qui plafonne la taille de ton brassin.
          </Text>
          <TextInput
            testID="equipment-fermenter-input"
            style={styles.textInput}
            value={fermenterText}
            onChangeText={setFermenterText}
            keyboardType="decimal-pad"
            placeholder="23"
          />
        </Card>
      ) : null}

      {step === 3 ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>
            Volume de ta plus grande marmite ?
          </Text>
          <Text style={styles.helpText}>
            En litres. La marmite d'ébullition la plus grande dont tu disposes.
          </Text>
          <TextInput
            testID="equipment-kettle-input"
            style={styles.textInput}
            value={kettleText}
            onChangeText={setKettleText}
            keyboardType="decimal-pad"
            placeholder="30"
          />
        </Card>
      ) : null}

      {step === 4 ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>On y est presque</Text>
          <Text style={styles.inputLabel}>Nom de ton matériel</Text>
          <TextInput
            testID="equipment-name-input"
            style={styles.textInput}
            value={nameText}
            onChangeText={setNameText}
            placeholder="Mon matériel"
          />

          <View style={styles.summary}>
            <SummaryRow label="Type" value={selectedOption?.label ?? "—"} />
            <SummaryRow label="Fermenteur" value={`${fermenterVolumeL} L`} />
            <SummaryRow label="Marmite" value={`${kettleVolumeL} L`} />
          </View>

          <Text style={styles.helpText}>
            Les réglages techniques (rendement, évaporation…) sont pré-remplis
            automatiquement selon ton type de système. Tu pourras les ajuster
            plus tard.
          </Text>
        </Card>
      ) : null}

      {mutationError ? (
        <Card style={[styles.card, styles.blockCard]}>
          <Text style={styles.blockText}>
            {getErrorMessage(mutationError, "Échec de la création du matériel")}
          </Text>
        </Card>
      ) : null}

      {step < LAST_STEP ? (
        <PrimaryButton
          testID="equipment-wizard-next"
          label="Suivant"
          onPress={handleNext}
          disabled={!isStepValid}
        />
      ) : (
        <PrimaryButton
          testID="equipment-wizard-create"
          label={isPending ? "Création…" : "Créer mon matériel"}
          onPress={handleCreate}
          disabled={isPending || !isStepValid}
        />
      )}
    </Screen>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  helpText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.sm,
  },
  optionList: {
    gap: spacing.xs,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  optionSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  optionLabel: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xxs,
  },
  optionLabelSelected: {
    color: colors.neutral.white,
  },
  optionHelp: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textSecondary,
  },
  optionHelpSelected: {
    color: colors.neutral.white,
  },
  inputLabel: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    color: colors.neutral.textPrimary,
  },
  summary: {
    marginVertical: spacing.sm,
    gap: spacing.xxs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textSecondary,
  },
  summaryValue: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  blockCard: {
    backgroundColor: colors.state.errorBackground,
    borderColor: colors.semantic.error,
  },
  blockText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.semantic.error,
  },
});
