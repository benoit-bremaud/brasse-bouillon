import { colors, radius, spacing, typography } from "@/core/theme";
import {
  getLabelDraftById,
  removeLabelDraft,
} from "@/features/labels/application/labels.use-cases";
import {
  getIconOptionById,
  getPaletteOptionById,
} from "@/features/labels/presentation/label-palette.constants";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { normalizeRouteParam } from "@/core/navigation/route-params";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { LabelDraft } from "@/features/labels/domain/label.types";
import { useRouter } from "expo-router";

type LabelDetailsScreenProps = {
  draftIdParam?: string | string[];
};

const LABELS_HOME_ROUTE = "/(app)/dashboard/labels" as const;
const LABEL_EDITOR_ROUTE = "/(app)/dashboard/labels/create/editor" as const;

function buildLabelEditorRoute(draftId: string) {
  return {
    pathname: LABEL_EDITOR_ROUTE,
    params: {
      draftId,
    },
  };
}

export function LabelDetailsScreen({ draftIdParam }: LabelDetailsScreenProps) {
  const router = useRouter();
  const normalizedDraftId = normalizeRouteParam(draftIdParam) ?? "";

  const [draft, setDraft] = useState<LabelDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    } catch (loadError) {
      setError(getErrorMessage(loadError, "Unable to load label draft."));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [normalizedDraftId]);

  React.useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

  const palette = useMemo(() => {
    if (!draft) {
      return null;
    }

    return getPaletteOptionById(draft.editableFields.paletteId);
  }, [draft]);

  const icon = useMemo(() => {
    if (!draft) {
      return null;
    }

    return getIconOptionById(draft.editableFields.iconId);
  }, [draft]);

  const handleDelete = async () => {
    if (!draft) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await removeLabelDraft(draft.id);
      router.replace(LABELS_HOME_ROUTE);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Unable to delete label draft."));
    } finally {
      setIsDeleting(false);
    }
  };

  if (hasFetched && !isLoading && !draft && !error) {
    return (
      <Screen>
        <ListHeader
          title="Détails du brouillon"
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
        title="Détails du brouillon"
        subtitle="Vérifie le rendu et les métadonnées"
        action={
          <HeaderBackButton
            label="Étiquettes"
            accessibilityLabel="Retour à mes étiquettes"
            onPress={() => router.replace(LABELS_HOME_ROUTE)}
          />
        }
      />

      {draft && palette && icon ? (
        <>
          <Card
            style={[
              styles.previewCard,
              { backgroundColor: palette.backgroundColor },
            ]}
          >
            <Text
              style={[styles.previewIcon, { color: palette.foregroundColor }]}
            >
              {icon.symbol}
            </Text>
            <Text
              style={[styles.previewTitle, { color: palette.foregroundColor }]}
            >
              {draft.previewSnapshot.title}
            </Text>
            <Text
              style={[
                styles.previewSubtitle,
                { color: palette.foregroundColor },
              ]}
            >
              {draft.previewSnapshot.subtitle}
            </Text>
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <Text style={styles.infoLine}>
              {draft.previewSnapshot.templateLabel}
            </Text>
            <Text style={styles.infoLine}>
              {draft.previewSnapshot.bottleFormatLabel}
            </Text>
            <Text style={styles.infoLine}>
              {draft.previewSnapshot.abvLabel}
            </Text>
            <Text style={styles.infoLine}>
              {draft.previewSnapshot.volumeLabel}
            </Text>
            <Text style={styles.infoLine}>
              {draft.previewSnapshot.brewDateLabel}
            </Text>
            <Text style={styles.infoLine}>
              {draft.previewSnapshot.breweryLabel}
            </Text>
            <Text style={styles.legalText}>
              {draft.previewSnapshot.legalHint}
            </Text>
          </Card>

          <View style={styles.actionsRow}>
            <PrimaryButton
              accessibilityLabel="Modifier le brouillon"
              label="Modifier"
              onPress={() => router.push(buildLabelEditorRoute(draft.id))}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Supprimer le brouillon"
              style={styles.deleteButton}
              disabled={isDeleting}
              onPress={() => {
                void handleDelete();
              }}
            >
              <Text style={styles.deleteText}>
                {isDeleting ? "Suppression..." : "Supprimer"}
              </Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  previewCard: {
    marginBottom: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
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
  infoCard: {
    marginBottom: spacing.sm,
    gap: spacing.xxs,
  },
  sectionTitle: {
    marginBottom: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  infoLine: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  legalText: {
    marginTop: spacing.xs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  actionsRow: {
    gap: spacing.xs,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: colors.semantic.error,
    borderRadius: radius.md,
    alignItems: "center",
    paddingVertical: spacing.sm,
    backgroundColor: colors.state.errorBackground,
  },
  deleteText: {
    color: colors.semantic.error,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
});
