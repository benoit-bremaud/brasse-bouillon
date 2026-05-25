import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { BrewStepTimer } from "@/features/batches/presentation/BrewStepTimer";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  BatchDetailsViewModel,
  completeCurrentBatchStep,
  getBatchDetailsViewModel,
} from "@/features/batches/application/batches.use-cases";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Batch } from "@/features/batches/domain/batch.types";
import { BATCH_STATUS_LABELS } from "@/features/batches/presentation/batch-display.constants";
import { BatchTimeline } from "@/features/batches/presentation/BatchTimeline";
import { StepCard } from "@/features/batches/presentation/StepCard";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { dataSource } from "@/core/data/data-source";
import { demoRecipes } from "@/mocks/demo-data";
import { getErrorMessage } from "@/core/http/http-error";
import { useRouter } from "expo-router";

const DEMO_FERMENTATION_TARGET_DAYS = 14;
// Pinned so the demo fermentation always reads exactly "J+5 / J+14" — the
// state the marketing site showcases. Deriving the day count from a fixed
// past `startedAt` would drift with the calendar (and disagree with the
// step's own "jour 5 sur 14" copy).
const DEMO_FERMENTATION_DAYS_ELAPSED = 5;
const DEMO_FERMENTATION_TEMPERATURE_C = 19;

// Dynamic widths cannot live in `StyleSheet.create()` because they
// depend on the runtime progress percentage. Centralising the
// computed object in a tiny helper keeps the JSX free of inline
// style literals (project rule) while still letting React Native
// merge it with the static `styles.progressFill` baseline.
function progressFillWidth(percent: number) {
  return { width: `${Math.max(0, Math.min(100, percent))}%` } as const;
}

function getCompleteButtonLabel(
  isCompleted: boolean,
  isCompleting: boolean,
): string {
  if (isCompleted) {
    return "Brassin terminé";
  }
  return isCompleting ? "Validation…" : "Terminer l'étape en cours";
}

type Props = {
  batchId: string;
};

// Demo-mode-only fermentation tracking card data. Live mode does not
// expose a gravity / temperature feed yet (deferred to the fermenter
// integration epic), so the rich tracker only renders when the
// runtime flag is on AND the current step is fermentation in progress.
function useFermentationTrackerInfo(batch: Batch | null) {
  return React.useMemo(() => {
    if (!batch || !dataSource.useDemoData) {
      return null;
    }
    const currentStep = batch.steps?.find(
      (step) => step.stepOrder === batch.currentStepOrder,
    );
    if (
      !currentStep ||
      currentStep.type !== "fermentation" ||
      currentStep.status !== "in_progress" ||
      !currentStep.startedAt
    ) {
      return null;
    }

    // The day count is pinned (not derived from `startedAt`) so the demo
    // always shows J+5 / J+14; `startedAt` is still required above as the
    // signal that fermentation has actually begun.
    const daysElapsed = DEMO_FERMENTATION_DAYS_ELAPSED;
    const ratio = daysElapsed / DEMO_FERMENTATION_TARGET_DAYS;
    const progressPct = Math.round(ratio * 100);

    // Estimate the current gravity as a linear interpolation between
    // the recipe's OG and FG using the fermentation progress. Real
    // attenuation is non-linear but for a demo tracker the eye sees
    // a believable monotonic descent.
    const recipe = demoRecipes.find((r) => r.id === batch.recipeId);
    const og = recipe?.stats?.og ?? 1.048;
    const fg = recipe?.stats?.fg ?? 1.012;
    const currentSg = og - (og - fg) * ratio;

    return {
      daysElapsed,
      daysTarget: DEMO_FERMENTATION_TARGET_DAYS,
      progressPct,
      currentSg,
      targetFg: fg,
      originalOg: og,
      temperature: DEMO_FERMENTATION_TEMPERATURE_C,
    };
  }, [batch]);
}

export function BatchDetailsScreen({ batchId }: Props) {
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = React.useState<string | null>(null);
  const missingBatchId = !batchId;

  const {
    data: viewModel = null,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery<BatchDetailsViewModel | null>({
    queryKey: ["batches", "details", batchId],
    queryFn: () => getBatchDetailsViewModel(batchId),
    enabled: !missingBatchId,
  });

  const batch = viewModel?.batch ?? null;
  const recipeName = viewModel?.recipeName ?? null;

  const {
    mutate: mutateCompleteCurrentStep,
    isPending: isCompleting,
    reset: resetCompletionState,
  } = useMutation<Batch | null, Error>({
    mutationFn: () => completeCurrentBatchStep(batchId),
    onSuccess: (nextBatch) => {
      setMutationError(null);
      queryClient.setQueryData<BatchDetailsViewModel | null>(
        ["batches", "details", batchId],
        nextBatch ? { batch: nextBatch, recipeName } : null,
      );
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
    },
    onError: (error) => {
      setMutationError(
        getErrorMessage(error, "Échec de la validation de l'étape"),
      );
    },
  });

  const error = missingBatchId
    ? "Identifiant de brassin manquant."
    : (mutationError ??
      (queryError
        ? isFetching
          ? null
          : getErrorMessage(queryError, "Impossible de charger le brassin")
        : null));

  const isRetryingWithError = isFetching && Boolean(queryError);
  const handleRetry = () => {
    setMutationError(null);
    resetCompletionState();
    if (!missingBatchId) {
      void refetch();
    }
  };

  const handleComplete = () => {
    if (missingBatchId) {
      return;
    }
    setMutationError(null);
    mutateCompleteCurrentStep();
  };

  const handleGoBack = () => {
    router.replace("/batches");
  };

  const isCompleted = batch?.status === "completed";
  const fermentationInfo = useFermentationTrackerInfo(batch);
  const activeStep =
    batch?.steps?.find((step) => step.status === "in_progress") ?? null;
  const [openTip, setOpenTip] = React.useState<{
    label: string;
    tip: string;
  } | null>(null);

  const completeButtonLabel = getCompleteButtonLabel(isCompleted, isCompleting);

  return (
    <Screen
      isLoading={(isLoading && !missingBatchId) || isRetryingWithError}
      error={error}
      onRetry={handleRetry}
    >
      <ListHeader
        title="Détails du brassin"
        action={
          <HeaderBackButton
            label="Mes brassins"
            accessibilityLabel="Retour à la liste des brassins"
            onPress={handleGoBack}
          />
        }
      />
      {batch ? (
        <Card style={styles.headerCard}>
          <Text style={styles.title}>
            {recipeName ?? `Brassin ${batch.id.slice(0, 8)}`}
          </Text>
          <BatchTimeline steps={batch.steps} />
          <Text style={styles.meta}>
            Statut : {BATCH_STATUS_LABELS[batch.status]}
          </Text>
          <Text style={styles.meta}>
            Étape en cours :{" "}
            {batch.currentStepOrder != null ? batch.currentStepOrder + 1 : "—"}
          </Text>
        </Card>
      ) : null}

      {fermentationInfo ? (
        <Card style={styles.fermentationCard}>
          <View style={styles.fermentationHeader}>
            <Ionicons name="flask" size={18} color={colors.brand.secondary} />
            <Text style={styles.fermentationTitle}>Fermentation</Text>
            <Text style={styles.fermentationDays}>
              J+{fermentationInfo.daysElapsed} / J+{fermentationInfo.daysTarget}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                progressFillWidth(fermentationInfo.progressPct),
              ]}
            />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Densité actuelle</Text>
              <Text style={styles.metricValue}>
                {fermentationInfo.currentSg.toFixed(3)}
              </Text>
              <Text style={styles.metricHint}>
                cible {fermentationInfo.targetFg.toFixed(3)} · départ{" "}
                {fermentationInfo.originalOg.toFixed(3)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Température</Text>
              <Text style={styles.metricValue}>
                {fermentationInfo.temperature} °C
              </Text>
              <Text style={styles.metricHint}>idéal 18–20 °C</Text>
            </View>
          </View>
        </Card>
      ) : null}

      {activeStep ? (
        <BrewStepTimer step={activeStep} useDemoData={dataSource.useDemoData} />
      ) : null}

      <PrimaryButton
        label={completeButtonLabel}
        onPress={handleComplete}
        disabled={isCompleting || isCompleted || isLoading}
      />

      <Text style={styles.sectionTitle}>Étapes</Text>
      <FlatList
        data={batch?.steps ?? []}
        keyExtractor={(item) => `${item.batchId}-${item.stepOrder}`}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
        renderItem={({ item }) => (
          <StepCard step={item} onOpenTip={setOpenTip} />
        )}
      />

      <Modal
        visible={openTip !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenTip(null)}
      >
        <Pressable style={styles.tipBackdrop} onPress={() => setOpenTip(null)}>
          <Pressable style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.brand.secondary}
              />
              <Text style={styles.tipTitle}>{openTip?.label}</Text>
            </View>
            <Text style={styles.tipBody}>{openTip?.tip}</Text>
            <Pressable style={styles.tipClose} onPress={() => setOpenTip(null)}>
              <Text style={styles.tipCloseText}>Compris</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  meta: {
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  list: {},
  fermentationCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  fermentationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  fermentationTitle: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  fermentationDays: {
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  progressTrack: {
    height: spacing.xs,
    backgroundColor: colors.neutral.border,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.semantic.success,
    borderRadius: radius.full,
  },
  metricsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textTransform: "uppercase",
  },
  metricValue: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    marginTop: spacing.xxs,
  },
  metricHint: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: spacing.xxs,
  },
  tipBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  tipCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.md,
    width: "100%",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tipTitle: {
    flex: 1,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  tipBody: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  tipClose: {
    marginTop: spacing.md,
    alignSelf: "flex-end",
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  tipCloseText: {
    color: colors.neutral.white,
    fontWeight: typography.weight.medium,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
