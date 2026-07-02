import {
  Alert,
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
  archiveBatch,
  BatchDetailsViewModel,
  cancelBatch,
  completeCurrentBatchStep,
  deleteBatch,
  getBatchDetailsViewModel,
  startCurrentBatchStep,
} from "@/features/batches/application/batches.use-cases";
import { getTasting } from "@/features/batches/application/bottling.use-cases";
import { computeAbv } from "@/features/batches/application/measurement.calculations";
import { listBatchMeasurements } from "@/features/batches/application/measurement.use-cases";
import { Tasting } from "@/features/batches/domain/bottling.types";
import { Measurement } from "@/features/batches/domain/measurement.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Batch } from "@/features/batches/domain/batch.types";
import { BatchClosureView } from "@/features/batches/presentation/BatchClosureView";
import { BATCH_STATUS_LABELS } from "@/features/batches/presentation/batch-display.constants";
import { BatchTimeline } from "@/features/batches/presentation/BatchTimeline";
import { StepCard } from "@/features/batches/presentation/StepCard";
import { Card } from "@/core/ui/Card";
import { ChecklistRow } from "@/core/ui/ChecklistRow";
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

// Plain-French guide shown from the "Comment mesurer ?" affordance on the
// density card (F3 pedagogy): teaches a novice how to read a hydrometer.
const HOW_TO_MEASURE_TIP =
  "Prélève un peu de moût dans un tube (ou un verre haut), plonge le " +
  "densimètre et laisse-le flotter sans toucher les bords. Lis la valeur à la " +
  "surface du liquide, à hauteur des yeux — par exemple 1.050. Un densimètre " +
  "coûte quelques euros en magasin de brassage ou en ligne. L'OG se lit au " +
  "début de la fermentation, la FG à la fin (quand la densité ne bouge plus " +
  "2-3 jours de suite).";

// Dynamic widths cannot live in `StyleSheet.create()` because they
// depend on the runtime progress percentage. Centralising the
// computed object in a tiny helper keeps the JSX free of inline
// style literals (project rule) while still letting React Native
// merge it with the static `styles.progressFill` baseline.
function progressFillWidth(percent: number) {
  return { width: `${Math.max(0, Math.min(100, percent))}%` } as const;
}

/**
 * Picks the most recent measurement of a given type from a batch's readings.
 *
 * @param measurements - All readings recorded for the batch.
 * @param type - The measurement type to extract (`og` or `fg`).
 * @returns The latest matching reading's value, or `null` when none exists.
 */
function latestMeasurementValue(
  measurements: Measurement[],
  type: "og" | "fg",
): number | null {
  const matching = measurements.filter((item) => item.type === type);
  if (matching.length === 0) {
    return null;
  }
  const latest = matching.reduce((acc, item) =>
    item.takenAt > acc.takenAt ? item : acc,
  );
  return latest.value;
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
  const recipeVolumeL = viewModel?.recipeVolumeL ?? null;
  const recipeOg = viewModel?.recipeOg ?? null;
  const recipeFg = viewModel?.recipeFg ?? null;
  const isCompletedLive =
    batch?.status === "completed" && !dataSource.useDemoData;

  const {
    data: tasting = null,
    error: tastingError,
    isError: isTastingError,
  } = useQuery<Tasting | null>({
    queryKey: ["batches", "tasting", batchId],
    queryFn: () => getTasting(batchId),
    enabled: !missingBatchId && isCompletedLive,
  });

  const { data: measurements = [] } = useQuery<Measurement[]>({
    queryKey: ["batches", "measurements", batchId],
    queryFn: () => listBatchMeasurements(batchId),
    enabled: !missingBatchId,
  });

  const recordedOg = latestMeasurementValue(measurements, "og");
  const recordedFg = latestMeasurementValue(measurements, "fg");
  const abv =
    recordedOg != null && recordedFg != null && recordedFg < recordedOg
      ? computeAbv(recordedOg, recordedFg)
      : null;

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
        nextBatch
          ? { batch: nextBatch, recipeName, recipeVolumeL, recipeOg, recipeFg }
          : null,
      );
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
    },
    onError: (error) => {
      setMutationError(
        getErrorMessage(error, "Échec de la validation de l'étape"),
      );
    },
  });

  const { mutate: mutateStartCurrentStep, isPending: isStarting } = useMutation<
    Batch | null,
    Error
  >({
    mutationFn: () => startCurrentBatchStep(batchId),
    onSuccess: (nextBatch) => {
      setMutationError(null);
      queryClient.setQueryData<BatchDetailsViewModel | null>(
        ["batches", "details", batchId],
        nextBatch
          ? { batch: nextBatch, recipeName, recipeVolumeL, recipeOg, recipeFg }
          : null,
      );
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Échec du démarrage de l'étape"));
    },
  });

  const { mutate: mutateDeleteBatch, isPending: isDeleting } = useMutation<
    void,
    Error
  >({
    mutationFn: () => deleteBatch(batchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
      router.replace("/batches");
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Échec de la suppression"));
    },
  });

  const { mutate: mutateCancelBatch, isPending: isCancelling } = useMutation<
    void,
    Error
  >({
    mutationFn: () => cancelBatch(batchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
      router.replace("/batches");
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Échec de l'annulation"));
    },
  });

  const { mutate: mutateArchiveBatch, isPending: isArchiving } = useMutation<
    void,
    Error
  >({
    mutationFn: () => archiveBatch(batchId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
      router.replace("/batches");
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Échec de l'archivage"));
    },
  });

  const error = missingBatchId
    ? "Identifiant de brassin manquant."
    : (mutationError ??
      (queryError
        ? isFetching
          ? null
          : getErrorMessage(queryError, "Impossible de charger le brassin")
        : isTastingError
          ? getErrorMessage(
              tastingError,
              "Impossible de charger la dégustation",
            )
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
    // F6 — confirm before completing a step. Completing advances the brew to
    // the next step and is not undoable, so gate it behind an acknowledgment
    // (the ✋ pattern already used on the bottling step) instead of firing on
    // a single tap.
    Alert.alert(
      "Terminer cette étape ?",
      "Tu confirmes avoir terminé l'étape en cours ? L'étape suivante démarrera.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Terminer",
          style: "default",
          onPress: () => {
            setMutationError(null);
            mutateCompleteCurrentStep();
          },
        },
      ],
    );
  };

  const handleStart = () => {
    if (missingBatchId) {
      return;
    }
    // F1 — the current step opens in PRÉP (no timer). Tapping « Démarrer »
    // activates it (ACTIF): the countdown only starts here, once the brewer has
    // done the physical prep. No confirm — starting is low-stakes.
    setMutationError(null);
    mutateStartCurrentStep();
  };

  const handleGoBack = () => {
    router.replace("/batches");
  };

  const handleDelete = () => {
    if (missingBatchId) {
      return;
    }
    // F25 — destructive + irreversible, so gate it behind a confirm (recovers
    // an accidental/phantom batch). Cancel (F16) and archive (F25) are the soft
    // alternatives that keep the journal (see handleCancel / handleArchive).
    Alert.alert(
      "Supprimer ce brassin ?",
      "Il sera définitivement retiré de tes brassins. Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            setMutationError(null);
            mutateDeleteBatch();
          },
        },
      ],
    );
  };

  const handleCancel = () => {
    if (missingBatchId) {
      return;
    }
    // F16 — stop a launched brew. Soft (keeps the journal), so a confirm is
    // enough; it is not the irreversible delete.
    Alert.alert(
      "Annuler ce brassin ?",
      "Le brassin sera arrêté et retiré de tes brassins actifs, mais son journal est conservé.",
      [
        { text: "Retour", style: "cancel" },
        {
          text: "Annuler le brassin",
          style: "destructive",
          onPress: () => {
            setMutationError(null);
            mutateCancelBatch();
          },
        },
      ],
    );
  };

  const handleArchive = () => {
    if (missingBatchId) {
      return;
    }
    // F25 — declutter: soft-hide a finished brew; its journal is kept.
    Alert.alert(
      "Archiver ce brassin ?",
      "Il sera retiré de tes brassins actifs mais conservé dans ton historique.",
      [
        { text: "Retour", style: "cancel" },
        {
          text: "Archiver",
          style: "default",
          onPress: () => {
            setMutationError(null);
            mutateArchiveBatch();
          },
        },
      ],
    );
  };

  const handleRecordMeasurement = () => {
    if (missingBatchId) {
      return;
    }
    router.push({
      pathname: "/batches/[id]/measurement",
      params: {
        id: batchId,
        ...(recordedOg != null ? { og: String(recordedOg) } : {}),
      },
    });
  };

  const handleGoToBottling = () => {
    if (missingBatchId) {
      return;
    }
    router.push({
      pathname: "/batches/[id]/bottling",
      params: { id: batchId },
    });
  };

  const handleRateTasting = () => {
    if (missingBatchId) {
      return;
    }
    router.push({
      pathname: "/batches/[id]/tasting",
      params: { id: batchId },
    });
  };

  const isCompleted = batch?.status === "completed";
  // In LIVE mode the current step being PACKAGING routes the brewer to the
  // dedicated bottling/closure screen instead of the dead-end "Terminer
  // l'étape" button. Demo mode keeps its original single-button behaviour.
  const currentStep =
    batch?.steps?.find((step) => step.stepOrder === batch.currentStepOrder) ??
    null;
  const showBottlingCta =
    !dataSource.useDemoData &&
    !isCompleted &&
    currentStep?.type === "packaging";
  const fermentationInfo = useFermentationTrackerInfo(batch);
  const activeStep =
    batch?.steps?.find((step) => step.status === "in_progress") ?? null;
  // PRÉP: the current step is in progress but not yet activated (no startedAt),
  // so the timer is idle and the CTA is « Démarrer » rather than « Terminer »
  // (F1; see brew-day/06). Demo steps carry a startedAt, so they read as ACTIF.
  const isPrepPhase = activeStep != null && activeStep.startedAt == null;
  // PRÉP physical gestures (F4, brew-day/01+06): local ticks only, namespaced
  // by step order so each step starts unticked. The record is bounded by the
  // batch's own gestures (~20 booleans) and lives only for this screen mount —
  // no reset needed. « Démarrer » is never hard-gated on the ticks (guidance +
  // escape hatch, unlike the F14 ingredient launch gate).
  const [prepDoneByKey, setPrepDoneByKey] = React.useState<
    Record<string, boolean>
  >({});
  const [openTip, setOpenTip] = React.useState<{
    label: string;
    tip: string;
  } | null>(null);

  // JIT density gating (F3): the density card belongs to the fermentation
  // phase, not the mash. Show it only when fermentation is ACTIF (yeast pitched
  // → startedAt set) or at the Packaging step (FG before bottling). See
  // brew-day/08. The gate applies in demo mode too, so the demo journey shows
  // the same JIT behaviour (no out-of-context mash card).
  const isFermentationActive =
    currentStep?.type === "fermentation" &&
    currentStep.status === "in_progress" &&
    currentStep.startedAt != null;
  const isPackagingStep = currentStep?.type === "packaging";
  const showDensityCard =
    !isCompletedLive &&
    batch != null &&
    (isFermentationActive || isPackagingStep);

  // Novice escape (F3): a display-only ABV estimated from the recipe targets,
  // revealed on demand when the brewer cannot measure. Never persisted; a real
  // reading (recordedOg/Fg) always takes precedence.
  const [showDensityEstimate, setShowDensityEstimate] = React.useState(false);
  const estimatedAbv =
    recipeOg != null && recipeFg != null && recipeFg < recipeOg
      ? computeAbv(recipeOg, recipeFg)
      : null;
  const handleExplainMeasurement = () => {
    setOpenTip({
      label: "Comment mesurer une densité ?",
      tip: HOW_TO_MEASURE_TIP,
    });
  };

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
          <View style={styles.headerActions}>
            <HeaderBackButton
              label="Mes brassins"
              accessibilityLabel="Retour à la liste des brassins"
              onPress={handleGoBack}
            />
            {batch ? (
              <Pressable
                onPress={handleDelete}
                disabled={isDeleting}
                accessibilityRole="button"
                accessibilityLabel="Supprimer ce brassin"
                hitSlop={8}
                style={styles.deleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={colors.semantic.error}
                />
              </Pressable>
            ) : null}
          </View>
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

      {isCompletedLive && batch ? (
        <BatchClosureView
          batch={batch}
          recipeName={recipeName}
          volumeL={recipeVolumeL}
          tasting={tasting}
          onRateTasting={handleRateTasting}
        />
      ) : null}

      {!isCompletedLive && fermentationInfo ? (
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

      {showDensityCard ? (
        <Card style={styles.measurementCard}>
          <View style={styles.fermentationHeader}>
            <Ionicons
              name="speedometer"
              size={18}
              color={colors.brand.secondary}
            />
            <Text style={styles.fermentationTitle}>Densités & alcool</Text>
          </View>

          {abv != null ? (
            <>
              <Text style={styles.metricValue}>{abv.toFixed(1)} % vol</Text>
              <Text style={styles.metricHint}>
                Calcul : (OG − FG) × 131,25 = ({recordedOg?.toFixed(3)} −{" "}
                {recordedFg?.toFixed(3)}) × 131,25. La levure a transformé le
                sucre (chute de densité) en alcool.
              </Text>
            </>
          ) : recordedOg != null ? (
            <Text style={styles.metricHint}>
              ABV calculée à la fin de la fermentation : saisis la densité
              finale (FG) quand la fermentation sera terminée.
            </Text>
          ) : (
            <Text style={styles.metricHint}>
              Aucune densité saisie. Note la densité initiale (OG) au début de
              la fermentation, la finale (FG) à la fin.
            </Text>
          )}

          {abv == null && showDensityEstimate ? (
            estimatedAbv != null ? (
              <View style={styles.estimateBox}>
                <Text
                  style={styles.estimateValue}
                  testID="density-estimated-abv"
                >
                  ≈ {estimatedAbv.toFixed(1)} % vol
                </Text>
                <Text style={styles.estimateLabel}>
                  {"estimé d'après la recette · non mesuré"}
                </Text>
                <Text style={styles.estimateHint}>
                  {
                    "Approximatif : l'alcool réel dépend de ton rendement d'empâtage. Mesure la densité pour la vraie valeur."
                  }
                </Text>
              </View>
            ) : (
              <Text style={styles.metricHint}>
                {
                  "Estimation indisponible : la recette n'indique pas de densités cibles."
                }
              </Text>
            )
          ) : null}

          {/* OG-then-FG assumption: OG is prompted during fermentation ACTIF,
              so by the Packaging gate an OG normally already exists and the CTA
              reads « … finale (FG) ». */}
          <PrimaryButton
            label={
              recordedOg == null
                ? "Noter la densité initiale (OG)"
                : "Noter la densité finale (FG)"
            }
            onPress={handleRecordMeasurement}
            style={styles.measurementCta}
          />

          <Pressable
            accessibilityRole="link"
            onPress={handleExplainMeasurement}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Comment mesurer ?</Text>
          </Pressable>

          {abv == null && !showDensityEstimate ? (
            <Pressable
              accessibilityRole="link"
              onPress={() => setShowDensityEstimate(true)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                Je ne peux pas mesurer maintenant
              </Text>
            </Pressable>
          ) : null}
        </Card>
      ) : null}

      {!isCompletedLive && activeStep ? (
        <BrewStepTimer step={activeStep} useDemoData={dataSource.useDemoData} />
      ) : null}

      {isPrepPhase && activeStep?.prepActions?.length ? (
        <Card>
          <Text style={styles.sectionTitle}>Avant de démarrer</Text>
          {activeStep.prepActions.map((prep, index) => {
            const key = `${activeStep.stepOrder}:${index}`;
            return (
              <ChecklistRow
                key={key}
                testID={`prep-action-${activeStep.stepOrder}-${index}`}
                label={prep.action}
                meta={prep.why}
                checked={prepDoneByKey[key] ?? false}
                onToggle={() =>
                  setPrepDoneByKey((current) => ({
                    ...current,
                    [key]: !current[key],
                  }))
                }
              />
            );
          })}
        </Card>
      ) : null}

      {showBottlingCta ? (
        <PrimaryButton
          label="Mettre en bouteille"
          onPress={handleGoToBottling}
          disabled={isLoading}
        />
      ) : isPrepPhase ? (
        <PrimaryButton
          label={isStarting ? "Démarrage…" : "Démarrer l'étape"}
          onPress={handleStart}
          disabled={isStarting || isLoading}
        />
      ) : !isCompletedLive ? (
        <PrimaryButton
          label={completeButtonLabel}
          onPress={handleComplete}
          disabled={isCompleting || isCompleted || isLoading}
        />
      ) : null}

      {!isCompletedLive ? (
        <>
          <Text style={styles.sectionTitle}>Étapes</Text>
          <FlatList
            data={batch?.steps ?? []}
            keyExtractor={(item) => `${item.batchId}-${item.stepOrder}`}
            style={styles.stepsList}
            contentContainerStyle={[
              styles.list,
              { paddingBottom: bottomPadding },
            ]}
            renderItem={({ item }) => (
              <StepCard step={item} onOpenTip={setOpenTip} />
            )}
          />
        </>
      ) : null}

      {batch?.status === "in_progress" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Annuler ce brassin"
          onPress={handleCancel}
          disabled={isCancelling}
          style={styles.softAction}
        >
          <Text style={styles.softActionDanger}>
            {isCancelling ? "Annulation…" : "Annuler ce brassin"}
          </Text>
        </Pressable>
      ) : null}

      {isCompleted ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Archiver ce brassin"
          onPress={handleArchive}
          disabled={isArchiving}
          style={styles.softAction}
        >
          <Text style={styles.softActionText}>
            {isArchiving ? "Archivage…" : "Archiver ce brassin"}
          </Text>
        </Pressable>
      ) : null}

      <Modal
        visible={openTip !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenTip(null)}
      >
        <Pressable style={styles.tipBackdrop} onPress={() => setOpenTip(null)}>
          {/* Capture touches so taps inside the card don't bubble to the
              backdrop and close the modal (#781 review). */}
          <View style={styles.tipCard} onStartShouldSetResponder={() => true}>
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
          </View>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
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
  stepsList: {
    // F8 — give the steps list its own bounded, scrollable region so the last
    // steps stay reachable above the floating nav footer. Without flex, the
    // list grew with its content inside a non-scrolling container and the
    // bottom steps were clipped behind the footer (the paddingBottom offset
    // alone could not rescue content that overflowed the screen).
    flex: 1,
  },
  // Secondary soft-lifecycle actions (F16 cancel / F25 archive) — quiet text
  // links, distinct from the primary CTA.
  softAction: {
    marginTop: spacing.sm,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  softActionText: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.brand.secondary,
    textDecorationLine: "underline",
  },
  softActionDanger: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    color: colors.semantic.error,
    textDecorationLine: "underline",
  },
  fermentationCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  measurementCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  measurementCta: {
    marginTop: spacing.md,
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
  // Estimated (not measured) value: visually distinct from the bold, primary
  // measured ABV — italic + muted tone + « ≈ » prefix so it never reads as real.
  estimateBox: {
    marginTop: spacing.sm,
  },
  estimateValue: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.medium,
    fontStyle: "italic",
    marginTop: spacing.xxs,
  },
  estimateLabel: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
    fontStyle: "italic",
  },
  estimateHint: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontStyle: "italic",
    marginTop: spacing.xxs,
  },
  linkButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },
  linkText: {
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    textDecorationLine: "underline",
  },
  tipBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay.scrim,
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
