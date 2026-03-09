import { colors, radius, spacing, typography } from "@/core/theme";
import {
  listLabelDrafts,
  removeLabelDraft,
} from "@/features/labels/application/labels.use-cases";
import {
  LabelDraft,
  LabelIconId,
  LabelPaletteId,
} from "@/features/labels/domain/label.types";
import {
  getIconOptionById,
  getPaletteOptionById,
} from "@/features/labels/presentation/label-palette.constants";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";

interface LabelInspirationExample {
  id: string;
  title: string;
  subtitle: string;
  paletteId: LabelPaletteId;
  iconId: LabelIconId;
  bottleFormatLabel: string;
  templateLabel: string;
  abvLabel: string;
}

const LABEL_EXAMPLES: LabelInspirationExample[] = [
  {
    id: "example-1",
    title: "Hoppy Dawn",
    subtitle: "Session IPA",
    paletteId: "sunset_amber",
    iconId: "hop",
    bottleFormatLabel: "33cl Long Neck",
    templateLabel: "Template Héritage",
    abvLabel: "ABV 5.2%",
  },
  {
    id: "example-2",
    title: "Velvet Night",
    subtitle: "Imperial Stout",
    paletteId: "midnight_stout",
    iconId: "barley",
    bottleFormatLabel: "44cl Canette",
    templateLabel: "Template Brut",
    abvLabel: "ABV 8.5%",
  },
  {
    id: "example-3",
    title: "Golden Whisper",
    subtitle: "Belgian Tripel",
    paletteId: "sunset_amber",
    iconId: "flask",
    bottleFormatLabel: "75cl Champenoise",
    templateLabel: "Template Moderne",
    abvLabel: "ABV 8.0%",
  },
  {
    id: "example-4",
    title: "Citrus Bloom",
    subtitle: "New England IPA",
    paletteId: "hop_garden",
    iconId: "hop",
    bottleFormatLabel: "44cl Canette",
    templateLabel: "Template Moderne",
    abvLabel: "ABV 6.4%",
  },
  {
    id: "example-5",
    title: "Alpine Spark",
    subtitle: "German Pils",
    paletteId: "hop_garden",
    iconId: "barley",
    bottleFormatLabel: "33cl Long Neck",
    templateLabel: "Template Héritage",
    abvLabel: "ABV 4.8%",
  },
];

const LABEL_SELECT_BATCH_ROUTE =
  "/(app)/dashboard/labels/create/select-batch" as const;

function buildLabelDraftRoute(draftId: string): Href {
  return `/(app)/dashboard/labels/${draftId}` as Href;
}

export function LabelsScreen() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<LabelDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftBeingDeletedId, setDraftBeingDeletedId] = useState<string | null>(
    null,
  );
  const [selectedExampleId, setSelectedExampleId] = useState(
    LABEL_EXAMPLES[0].id,
  );

  const loadDrafts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const storedDrafts = await listLabelDrafts();
      setDrafts(storedDrafts);
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Unable to load label drafts."));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, []);

  React.useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  const hasDrafts = drafts.length > 0;

  const summaryText = useMemo(() => {
    if (!hasDrafts) {
      return "Aucun brouillon pour le moment.";
    }

    return `${drafts.length} brouillon${drafts.length > 1 ? "s" : ""} local${
      drafts.length > 1 ? "aux" : ""
    } disponible${drafts.length > 1 ? "s" : ""}.`;
  }, [drafts.length, hasDrafts]);

  const selectedExample = useMemo(
    () =>
      LABEL_EXAMPLES.find((example) => example.id === selectedExampleId) ??
      LABEL_EXAMPLES[0],
    [selectedExampleId],
  );

  const selectedExampleIcon = getIconOptionById(selectedExample.iconId);
  const selectedExamplePalette = getPaletteOptionById(
    selectedExample.paletteId,
  );

  const handleOpenDraft = (draftId: string) => {
    router.push(buildLabelDraftRoute(draftId));
  };

  const handleCreateLabel = () => {
    router.push(LABEL_SELECT_BATCH_ROUTE);
  };

  const handleDeleteDraft = async (draftId: string) => {
    setDraftBeingDeletedId(draftId);

    try {
      await removeLabelDraft(draftId);
      const refreshedDrafts = await listLabelDrafts();
      setDrafts(refreshedDrafts);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete label draft."));
    } finally {
      setDraftBeingDeletedId(null);
    }
  };

  return (
    <Screen
      isLoading={isLoading}
      error={error}
      onRetry={() => void loadDrafts()}
    >
      <ListHeader
        title="Atelier d’étiquettes"
        subtitle="Conçois et sauvegarde tes étiquettes avant impression"
      />

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Mes étiquettes</Text>
        <Text style={styles.summaryText}>{summaryText}</Text>
        <PrimaryButton
          accessibilityLabel="Créer une étiquette"
          label="Créer une étiquette"
          onPress={handleCreateLabel}
        />
      </Card>

      {hasFetched && !hasDrafts ? (
        <>
          <EmptyStateCard
            title="Aucune étiquette enregistrée"
            description="Démarre un brouillon depuis un brassin puis personnalise le rendu."
          />

          <Card>
            <Text style={styles.examplesTitle}>Exemples d’inspiration</Text>

            <View style={styles.examplesList}>
              {LABEL_EXAMPLES.map((example) => {
                const isSelected = selectedExample.id === example.id;

                return (
                  <Pressable
                    key={example.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Sélectionner le modèle ${example.title}`}
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.exampleItem,
                      isSelected ? styles.exampleItemSelected : null,
                    ]}
                    onPress={() => {
                      setSelectedExampleId(example.id);
                    }}
                  >
                    <Text style={styles.exampleTitle}>{example.title}</Text>
                    <Text style={styles.exampleSubtitle}>
                      {example.subtitle}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Aperçu de l’étiquette</Text>
              <Text style={styles.previewSelectedModel}>
                Modèle sélectionné : {selectedExample.title}
              </Text>

              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewIcon}>
                    {selectedExampleIcon.symbol}
                  </Text>

                  <View style={styles.previewHeaderText}>
                    <Text style={styles.previewName}>
                      {selectedExample.title}
                    </Text>
                    <Text style={styles.previewSubtitle}>
                      {selectedExample.subtitle}
                    </Text>
                  </View>
                </View>

                <Text style={styles.previewMeta}>
                  {selectedExample.bottleFormatLabel} •{" "}
                  {selectedExample.templateLabel}
                </Text>
                <Text style={styles.previewMeta}>
                  Palette : {selectedExamplePalette.label}
                </Text>
                <Text style={styles.previewMeta}>
                  {selectedExample.abvLabel}
                </Text>
              </View>
            </View>
          </Card>
        </>
      ) : null}

      {hasDrafts ? (
        <FlatList
          data={drafts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const icon = getIconOptionById(item.editableFields.iconId);
            const isDeleting = draftBeingDeletedId === item.id;

            return (
              <Card style={styles.draftCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Ouvrir le brouillon ${item.previewSnapshot.title}`}
                  style={styles.openArea}
                  onPress={() => handleOpenDraft(item.id)}
                >
                  <View style={styles.draftHeader}>
                    <Text style={styles.draftIcon}>{icon.symbol}</Text>
                    <View style={styles.draftHeaderText}>
                      <Text style={styles.draftTitle}>
                        {item.previewSnapshot.title}
                      </Text>
                      <Text style={styles.draftSubtitle}>
                        {item.previewSnapshot.subtitle}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.draftMeta}>
                    {item.previewSnapshot.bottleFormatLabel} •{" "}
                    {item.previewSnapshot.templateLabel}
                  </Text>
                  <Text style={styles.draftMeta}>
                    {item.previewSnapshot.abvLabel}
                  </Text>
                  <Text style={styles.draftUpdatedAt}>
                    Mise à jour : {item.updatedAt.slice(0, 10)}
                  </Text>
                </Pressable>

                <View style={styles.draftActionsRow}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ouvrir ${item.previewSnapshot.title}`}
                    style={styles.draftActionButton}
                    onPress={() => handleOpenDraft(item.id)}
                  >
                    <Text style={styles.draftActionButtonText}>Ouvrir</Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Supprimer ${item.previewSnapshot.title}`}
                    style={[styles.draftActionButton, styles.deleteButton]}
                    disabled={isDeleting}
                    onPress={() => {
                      void handleDeleteDraft(item.id);
                    }}
                  >
                    <Text
                      style={[styles.draftActionButtonText, styles.deleteText]}
                    >
                      {isDeleting ? "Suppression..." : "Supprimer"}
                    </Text>
                  </Pressable>
                </View>
              </Card>
            );
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  summaryText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  examplesTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  examplesList: {
    gap: spacing.sm,
  },
  exampleItem: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.brand.background,
  },
  exampleItemSelected: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.state.infoBackground,
  },
  exampleTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  exampleSubtitle: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  previewSection: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  previewTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  previewSelectedModel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  previewCard: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    backgroundColor: colors.neutral.white,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  previewIcon: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
  },
  previewHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  previewName: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  previewSubtitle: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  previewMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  list: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  draftCard: {
    gap: spacing.sm,
  },
  openArea: {
    gap: spacing.xs,
  },
  draftHeader: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  draftIcon: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
  },
  draftHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  draftTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  draftSubtitle: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  draftMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  draftUpdatedAt: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  draftActionsRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  draftActionButton: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    paddingVertical: spacing.xs,
    alignItems: "center",
    backgroundColor: colors.brand.background,
  },
  draftActionButtonText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  deleteButton: {
    borderColor: colors.semantic.error,
    backgroundColor: colors.state.errorBackground,
  },
  deleteText: {
    color: colors.semantic.error,
  },
});
