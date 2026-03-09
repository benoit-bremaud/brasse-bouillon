import { colors, radius, spacing, typography } from "@/core/theme";
import {
  createLabelDraftFromBatch,
  listLabelBatchCandidates,
} from "@/features/labels/application/labels.use-cases";
import {
  LabelBatchCandidate,
  LabelBottleFormat,
  LabelTemplateId,
} from "@/features/labels/domain/label.types";
import {
  LABEL_BOTTLE_FORMAT_OPTIONS,
  LABEL_TEMPLATE_OPTIONS,
} from "@/features/labels/presentation/label-template.constants";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";

const LABELS_HOME_ROUTE = "/(app)/dashboard/labels" as const;
const LABEL_EDITOR_ROUTE = "/(app)/dashboard/labels/create/editor" as const;

function getBatchStatusLabel(status: LabelBatchCandidate["status"]): string {
  return status === "completed" ? "Terminé" : "En cours";
}

export function LabelSelectBatchScreen() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<LabelBatchCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBottleFormat, setSelectedBottleFormat] =
    useState<LabelBottleFormat>(LABEL_BOTTLE_FORMAT_OPTIONS[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState<LabelTemplateId>(
    LABEL_TEMPLATE_OPTIONS[0].id,
  );
  const [isCreating, setIsCreating] = useState(false);

  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextCandidates = await listLabelBatchCandidates();
      setCandidates(nextCandidates);
      setSelectedBatchId((currentSelection) => {
        if (currentSelection) {
          return currentSelection;
        }

        return nextCandidates[0]?.batchId ?? null;
      });
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Unable to load available batches."));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, []);

  React.useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  const handleCreateDraft = async () => {
    if (!selectedBatchId) {
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const draft = await createLabelDraftFromBatch({
        batchId: selectedBatchId,
        bottleFormat: selectedBottleFormat,
        templateId: selectedTemplateId,
      });

      router.replace({
        pathname: LABEL_EDITOR_ROUTE,
        params: {
          draftId: draft.id,
        },
      });
    } catch (createError) {
      setError(getErrorMessage(createError, "Unable to create label draft."));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Screen
      isLoading={isLoading}
      error={error}
      onRetry={() => void loadCandidates()}
    >
      <ListHeader
        title="Sélection du brassin"
        subtitle="Choisis un brassin puis la base du modèle"
        action={
          <HeaderBackButton
            label="Étiquettes"
            accessibilityLabel="Retour à mes étiquettes"
            onPress={() => router.replace(LABELS_HOME_ROUTE)}
          />
        }
      />

      <Card style={styles.optionsCard}>
        <Text style={styles.sectionTitle}>Format de bouteille</Text>
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
                    styles.chipLabel,
                    isSelected && styles.chipLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Template</Text>
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
                    styles.chipLabel,
                    isSelected && styles.chipLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {hasFetched && candidates.length === 0 ? (
        <EmptyStateCard
          title="Aucun brassin disponible"
          description="Crée ou synchronise un brassin avant de préparer une étiquette."
        />
      ) : (
        <FlatList
          data={candidates}
          keyExtractor={(item) => item.batchId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = item.batchId === selectedBatchId;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Sélectionner le brassin ${item.recipeName}`}
                onPress={() => setSelectedBatchId(item.batchId)}
              >
                <Card
                  style={[
                    styles.batchCard,
                    isSelected && styles.batchCardSelected,
                  ]}
                >
                  <View style={styles.batchHeaderRow}>
                    <Text style={styles.batchTitle}>{item.recipeName}</Text>
                    <Text style={styles.batchStatus}>
                      {getBatchStatusLabel(item.status)}
                    </Text>
                  </View>

                  <Text style={styles.batchMeta}>{item.style}</Text>
                  <Text style={styles.batchMeta}>
                    ABV: {item.abv !== null ? `${item.abv.toFixed(1)}%` : "N/A"}
                  </Text>
                  <Text style={styles.batchMeta}>
                    Brassé le {item.brewedAtIso.slice(0, 10)}
                  </Text>
                </Card>
              </Pressable>
            );
          }}
        />
      )}

      <PrimaryButton
        accessibilityLabel="Créer un brouillon d’étiquette"
        label={isCreating ? "Création..." : "Créer le brouillon"}
        disabled={!selectedBatchId || isCreating}
        onPress={() => {
          void handleCreateDraft();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  optionsCard: {
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
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
  chipLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  chipLabelSelected: {
    color: colors.brand.secondary,
  },
  list: {
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  batchCard: {
    gap: spacing.xxs,
  },
  batchCardSelected: {
    borderColor: colors.brand.secondary,
    borderWidth: 1,
  },
  batchHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  batchTitle: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  batchStatus: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
  },
  batchMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
