import { colors, radius, spacing, typography } from "@/core/theme";
import {
  getLabelDraftById,
  updateLabelDraft,
} from "@/features/labels/application/labels.use-cases";
import {
  LabelBottleFormat,
  LabelDraft,
  LabelIconId,
  LabelPaletteId,
  LabelTemplateId,
} from "@/features/labels/domain/label.types";
import {
  LABEL_ICON_OPTIONS,
  LABEL_PALETTE_OPTIONS,
  getIconOptionById,
  getPaletteOptionById,
} from "@/features/labels/presentation/label-palette.constants";
import {
  LABEL_BOTTLE_FORMAT_OPTIONS,
  LABEL_TEMPLATE_OPTIONS,
} from "@/features/labels/presentation/label-template.constants";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { normalizeRouteParam } from "@/core/navigation/route-params";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";

type LabelEditorScreenProps = {
  draftIdParam?: string | string[];
};

const LABELS_HOME_ROUTE = "/(app)/dashboard/labels" as const;

function buildLabelDetailsRoute(draftId: string): Href {
  return `/(app)/dashboard/labels/${draftId}` as Href;
}

function toButtonLabel(isSaving: boolean): string {
  return isSaving ? "Enregistrement..." : "Enregistrer";
}

export function LabelEditorScreen({ draftIdParam }: LabelEditorScreenProps) {
  const router = useRouter();
  const normalizedDraftId = normalizeRouteParam(draftIdParam) ?? "";

  const [draft, setDraft] = useState<LabelDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [selectedBottleFormat, setSelectedBottleFormat] =
    useState<LabelBottleFormat>(LABEL_BOTTLE_FORMAT_OPTIONS[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState<LabelTemplateId>(
    LABEL_TEMPLATE_OPTIONS[0].id,
  );
  const [selectedPaletteId, setSelectedPaletteId] = useState<LabelPaletteId>(
    LABEL_PALETTE_OPTIONS[0].id,
  );
  const [selectedIconId, setSelectedIconId] = useState<LabelIconId>(
    LABEL_ICON_OPTIONS[0].id,
  );

  const applyDraftToForm = useCallback((loadedDraft: LabelDraft) => {
    setName(loadedDraft.editableFields.name);
    setSubtitle(loadedDraft.editableFields.subtitle);
    setSelectedBottleFormat(loadedDraft.bottleFormat);
    setSelectedTemplateId(loadedDraft.templateId);
    setSelectedPaletteId(loadedDraft.editableFields.paletteId);
    setSelectedIconId(loadedDraft.editableFields.iconId);
  }, []);

  const loadDraft = useCallback(async () => {
    if (!normalizedDraftId) {
      setError("Missing label draft id.");
      setHasFetched(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedDraft = await getLabelDraftById(normalizedDraftId);
      setDraft(loadedDraft);
      if (loadedDraft) {
        applyDraftToForm(loadedDraft);
      }
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Unable to load label draft."));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [applyDraftToForm, normalizedDraftId]);

  React.useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

  const selectedPalette = getPaletteOptionById(selectedPaletteId);
  const selectedIcon = getIconOptionById(selectedIconId);

  const previewTitle = useMemo(() => {
    const normalizedName = name.trim();
    if (normalizedName) {
      return normalizedName;
    }

    return draft?.autofillFields.beerName ?? "Nom de la bière";
  }, [draft?.autofillFields.beerName, name]);

  const previewSubtitle = useMemo(() => {
    const normalizedSubtitle = subtitle.trim();
    if (normalizedSubtitle) {
      return normalizedSubtitle;
    }

    return draft?.autofillFields.style ?? "Style";
  }, [draft?.autofillFields.style, subtitle]);

  const handleSave = async () => {
    if (!draft) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const updatedDraft = await updateLabelDraft({
        draftId: draft.id,
        bottleFormat: selectedBottleFormat,
        templateId: selectedTemplateId,
        paletteId: selectedPaletteId,
        iconId: selectedIconId,
        customName: name,
        customSubtitle: subtitle,
      });

      if (!updatedDraft) {
        setError("Label draft not found.");
        return;
      }

      setDraft(updatedDraft);
      applyDraftToForm(updatedDraft);
      setStatusMessage("Brouillon enregistré.");
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Unable to update label draft."));
    } finally {
      setIsSaving(false);
    }
  };

  if (hasFetched && !isLoading && !draft && !error) {
    return (
      <Screen>
        <ListHeader
          title="Édition"
          subtitle="Le brouillon demandé est introuvable"
          action={
            <HeaderBackButton
              label="Étiquettes"
              accessibilityLabel="Retour à mes étiquettes"
              onPress={() => router.replace(LABELS_HOME_ROUTE)}
            />
          }
        />
        <EmptyStateCard
          title="Brouillon introuvable"
          description="Ce brouillon n’est plus disponible dans le stockage local."
        />
      </Screen>
    );
  }

  return (
    <Screen
      isLoading={isLoading}
      error={error}
      onRetry={() => void loadDraft()}
    >
      <ListHeader
        title="Éditeur d’étiquette"
        subtitle="Personnalise ton brouillon avant impression"
        action={
          <HeaderBackButton
            label="Étiquettes"
            accessibilityLabel="Retour à mes étiquettes"
            onPress={() => router.replace(LABELS_HOME_ROUTE)}
          />
        }
      />

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Texte</Text>

        <Text style={styles.fieldLabel}>Nom</Text>
        <TextInput
          accessibilityLabel="Modifier le nom de l’étiquette"
          value={name}
          onChangeText={setName}
          placeholder="Nom de la bière"
          placeholderTextColor={colors.neutral.muted}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
        />

        <Text style={styles.fieldLabel}>Sous-titre</Text>
        <TextInput
          accessibilityLabel="Modifier le sous-titre de l’étiquette"
          value={subtitle}
          onChangeText={setSubtitle}
          placeholder="Style / variante"
          placeholderTextColor={colors.neutral.muted}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Palette</Text>
        <View style={styles.chipsWrap}>
          {LABEL_PALETTE_OPTIONS.map((option) => {
            const isSelected = option.id === selectedPaletteId;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`Sélectionner la palette ${option.label}`}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedPaletteId(option.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Icône</Text>
        <View style={styles.chipsWrap}>
          {LABEL_ICON_OPTIONS.map((option) => {
            const isSelected = option.id === selectedIconId;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`Sélectionner l’icône ${option.label}`}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedIconId(option.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {option.symbol} {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Modèle</Text>

        <View style={styles.chipsWrap}>
          {LABEL_BOTTLE_FORMAT_OPTIONS.map((option) => {
            const isSelected = option.id === selectedBottleFormat;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`Sélectionner le format ${option.label}`}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedBottleFormat(option.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.chipsWrap}>
          {LABEL_TEMPLATE_OPTIONS.map((option) => {
            const isSelected = option.id === selectedTemplateId;

            return (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`Sélectionner le template ${option.label}`}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedTemplateId(option.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card
        style={[
          styles.previewCard,
          { backgroundColor: selectedPalette.backgroundColor },
        ]}
      >
        <Text
          style={[
            styles.previewIcon,
            { color: selectedPalette.foregroundColor },
          ]}
        >
          {selectedIcon.symbol}
        </Text>
        <Text
          style={[
            styles.previewTitle,
            { color: selectedPalette.foregroundColor },
          ]}
        >
          {previewTitle}
        </Text>
        <Text
          style={[
            styles.previewSubtitle,
            { color: selectedPalette.foregroundColor },
          ]}
        >
          {previewSubtitle}
        </Text>
      </Card>

      {statusMessage ? (
        <Text style={styles.statusMessage}>{statusMessage}</Text>
      ) : null}

      <View style={styles.actionsRow}>
        <PrimaryButton
          accessibilityLabel="Enregistrer le brouillon"
          label={toButtonLabel(isSaving)}
          disabled={!draft || isSaving}
          style={styles.actionButton}
          onPress={() => {
            void handleSave();
          }}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir la fiche du brouillon"
          style={styles.secondaryButton}
          disabled={!draft || isSaving}
          onPress={() => {
            if (!draft) {
              return;
            }

            router.push(buildLabelDetailsRoute(draft.id));
          }}
        >
          <Text style={styles.secondaryButtonText}>Voir la fiche</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  sectionTitle: {
    marginTop: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  fieldLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    backgroundColor: colors.neutral.white,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.neutral.white,
  },
  chipSelected: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  chipText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  chipTextSelected: {
    color: colors.brand.secondary,
  },
  previewCard: {
    marginBottom: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
    borderRadius: radius.lg,
  },
  previewIcon: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
  },
  previewTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  previewSubtitle: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  statusMessage: {
    marginBottom: spacing.sm,
    color: colors.semantic.success,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  actionsRow: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  actionButton: {
    width: "100%",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    borderRadius: radius.md,
    alignItems: "center",
    paddingVertical: spacing.sm,
    backgroundColor: colors.brand.background,
  },
  secondaryButtonText: {
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
});
