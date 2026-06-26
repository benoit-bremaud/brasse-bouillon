import { colors, radius, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import {
  computeAbv,
  validateFinalGravity,
} from "@/features/batches/application/measurement.calculations";
import { recordBatchMeasurement } from "@/features/batches/application/measurement.use-cases";
import { Measurement } from "@/features/batches/domain/measurement.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  /** Identifier of the batch the reading is recorded against. */
  batchId: string;
  /**
   * Original gravity already recorded for the batch, if any. Used to validate
   * a final gravity client-side and to compute/explain ABV once both readings
   * exist. `null` when no OG has been recorded yet.
   */
  recordedOg?: number | null;
};

/** Reading the brewer is currently entering (OG or FG only — B2 scope). */
type GravityKind = "og" | "fg";

/**
 * Plain-French note teaching the "fermentation is done" rule. The app does
 * NOT auto-detect stability nor auto-write completion — the brewer judges.
 */
const FERMENTATION_END_NOTE =
  "Comment savoir si c'est fini ? Mesure la densité 2 à 3 jours de suite : " +
  "si elle ne bouge plus, la fermentation est terminée. C'est à toi de juger " +
  "et de saisir la densité finale (FG).";

/** Buy-advice shown via the no-hydrometer escape (never a dead-end). */
const NO_HYDROMETER_ADVICE =
  "Pas de densimètre ? Pas de blocage : ton brassin peut continuer. Un " +
  "densimètre coûte quelques euros et se trouve en magasin de brassage ou en " +
  "ligne — il te permettra de mesurer l'alcool. En attendant, l'alcool (ABV) " +
  "reste « indisponible » : on ne l'invente pas.";

function getKindLabel(kind: GravityKind): string {
  return kind === "og"
    ? "Valeur de la densité initiale"
    : "Valeur de la densité finale";
}

/**
 * Form to record a fermentation gravity measurement (B2 — US-0404).
 *
 * The brewer picks OG (densité initiale, at fermentation start) or FG
 * (densité finale, at the end), enters a specific gravity (e.g. `1.050`), and
 * saves it. The screen:
 * - blocks an implausible FG (>= OG) client-side with a plain explanation;
 * - computes and explains ABV = (OG - FG) * 131.25 once both readings exist;
 * - offers a "Je n'ai pas de densimètre" escape that shows buy-advice and lets
 *   the brew proceed without fabricating an estimate;
 * - teaches the "densité stable 2-3 jours = terminé" rule (no auto-detection).
 *
 * @param props - The batch id and the OG already recorded, if any.
 */
export function MeasurementEntryScreen({ batchId, recordedOg = null }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [kind, setKind] = React.useState<GravityKind>(
    recordedOg == null ? "og" : "fg",
  );
  const [valueText, setValueText] = React.useState("");
  const [blockMessage, setBlockMessage] = React.useState<string | null>(null);
  const [showBuyAdvice, setShowBuyAdvice] = React.useState(false);

  const {
    mutate: mutateRecord,
    isPending,
    error: mutationError,
  } = useMutation<
    Measurement | null,
    Error,
    { type: GravityKind; value: number }
  >({
    mutationFn: (input: { type: GravityKind; value: number }) =>
      recordBatchMeasurement(batchId, {
        type: input.type,
        value: input.value,
      }),
    onSuccess: () => {
      setValueText("");
      void queryClient.invalidateQueries({
        queryKey: ["batches", "details", batchId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["batches", "measurements", batchId],
      });
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
      router.back();
    },
  });

  // Normalise a FR-style comma decimal ("1,050") to a dot before parsing,
  // otherwise parseFloat stops at the comma and silently records "1".
  const parsedValue = parseFloat(valueText.replace(",", "."));
  const hasValue = valueText.trim() !== "" && !Number.isNaN(parsedValue);

  // ABV preview: only when both OG and the freshly-entered FG are valid.
  const abvPreview =
    kind === "fg" && recordedOg != null && hasValue && parsedValue < recordedOg
      ? computeAbv(recordedOg, parsedValue)
      : null;

  const handleSelectKind = (next: GravityKind) => {
    setKind(next);
    setBlockMessage(null);
  };

  const handleSubmit = () => {
    setBlockMessage(null);
    if (!batchId || !hasValue) {
      return;
    }
    if (kind === "fg" && recordedOg != null) {
      const validation = validateFinalGravity(recordedOg, parsedValue);
      if (!validation.valid) {
        setBlockMessage(validation.message);
        return;
      }
    }
    mutateRecord({ type: kind, value: parsedValue });
  };

  const handleNoHydrometer = () => {
    setBlockMessage(null);
    setShowBuyAdvice(true);
  };

  return (
    <Screen>
      <ListHeader
        title="Saisir une densité"
        action={
          <HeaderBackButton
            label="Retour"
            accessibilityLabel="Retour au brassin"
            onPress={() => router.back()}
          />
        }
      />

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Quelle mesure ?</Text>
        <Text style={styles.helpText}>
          La densité initiale (OG) se mesure au début de la fermentation, la
          densité finale (FG) à la fin. Saisis-la en densité spécifique, par
          exemple 1.050.
        </Text>

        <View style={styles.kindRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: kind === "og" }}
            style={[styles.kindTab, kind === "og" && styles.kindTabActive]}
            onPress={() => handleSelectKind("og")}
          >
            <Text
              style={[
                styles.kindTabText,
                kind === "og" && styles.kindTabTextActive,
              ]}
            >
              Densité initiale (OG)
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: kind === "fg" }}
            style={[styles.kindTab, kind === "fg" && styles.kindTabActive]}
            onPress={() => handleSelectKind("fg")}
          >
            <Text
              style={[
                styles.kindTabText,
                kind === "fg" && styles.kindTabTextActive,
              ]}
            >
              Densité finale (FG)
            </Text>
          </Pressable>
        </View>

        <Text style={styles.inputLabel}>{getKindLabel(kind)}</Text>
        <TextInput
          testID="measurement-value-input"
          style={styles.textInput}
          value={valueText}
          onChangeText={setValueText}
          keyboardType="decimal-pad"
          placeholder="1.050"
        />
      </Card>

      {kind === "fg" ? (
        <Card variant="subtle" style={styles.card}>
          <Text style={styles.noteText}>{FERMENTATION_END_NOTE}</Text>
        </Card>
      ) : null}

      {abvPreview != null ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Taux d'alcool estimé</Text>
          <Text style={styles.abvValue}>{abvPreview.toFixed(1)} % vol</Text>
          <Text style={styles.helpText}>
            Calcul : (OG − FG) × 131,25 = ({recordedOg?.toFixed(3)} −{" "}
            {parsedValue.toFixed(3)}) × 131,25. La levure a transformé le sucre
            (différence de densité) en alcool.
          </Text>
        </Card>
      ) : null}

      {blockMessage ? (
        <Card style={[styles.card, styles.blockCard]}>
          <Text testID="measurement-block-message" style={styles.blockText}>
            {blockMessage}
          </Text>
        </Card>
      ) : null}

      {mutationError ? (
        <Card style={[styles.card, styles.blockCard]}>
          <Text style={styles.blockText}>
            {getErrorMessage(
              mutationError,
              "Échec de l'enregistrement de la densité",
            )}
          </Text>
        </Card>
      ) : null}

      <PrimaryButton
        label={isPending ? "Enregistrement…" : "Enregistrer la densité"}
        onPress={handleSubmit}
        disabled={isPending || !hasValue}
      />

      <Pressable
        accessibilityRole="button"
        style={styles.escapeButton}
        onPress={handleNoHydrometer}
      >
        <Text style={styles.escapeText}>Je n'ai pas de densimètre</Text>
      </Pressable>

      {showBuyAdvice ? (
        <Card variant="subtle" style={styles.card}>
          <Text testID="measurement-buy-advice" style={styles.noteText}>
            {NO_HYDROMETER_ADVICE}
          </Text>
        </Card>
      ) : null}
    </Screen>
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
  noteText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textPrimary,
  },
  kindRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  kindTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  kindTabActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  kindTabText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textSecondary,
  },
  kindTabTextActive: {
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
  abvValue: {
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
    marginBottom: spacing.xs,
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
  escapeButton: {
    marginTop: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  escapeText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.brand.secondary,
    textDecorationLine: "underline",
  },
});
