import { FlatList, StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/core/theme";
import {
  completeCurrentBatchStep,
  getBatchDetails,
} from "@/features/batches/application/batches.use-cases";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/core/ui/Badge";
import { Batch } from "@/features/batches/domain/batch.types";
import { BatchTimeline } from "@/features/batches/presentation/BatchTimeline";
import { Card } from "@/core/ui/Card";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { useRouter } from "expo-router";

type Props = {
  batchId: string;
};

export function BatchDetailsScreen({ batchId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = React.useState<string | null>(null);
  const missingBatchId = !batchId;

  const {
    data: batch = null,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery<Batch | null>({
    queryKey: ["batches", "details", batchId],
    queryFn: () => getBatchDetails(batchId),
    enabled: !missingBatchId,
  });

  const {
    mutate: mutateCompleteCurrentStep,
    isPending: isCompleting,
    reset: resetCompletionState,
  } = useMutation<Batch | null, Error>({
    mutationFn: () => completeCurrentBatchStep(batchId),
    onSuccess: (nextBatch) => {
      setMutationError(null);
      queryClient.setQueryData<Batch | null>(
        ["batches", "details", batchId],
        nextBatch,
      );
      void queryClient.invalidateQueries({ queryKey: ["batches", "list"] });
    },
    onError: (error) => {
      setMutationError(getErrorMessage(error, "Failed to complete step"));
    },
  });

  const error = missingBatchId
    ? "Missing batch id."
    : (mutationError ??
      (queryError
        ? isFetching
          ? null
          : getErrorMessage(queryError, "Failed to load batch")
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

  return (
    <Screen
      isLoading={(isLoading && !missingBatchId) || isRetryingWithError}
      error={error}
      onRetry={handleRetry}
    >
      <ListHeader
        title="Détails du brassin"
        subtitle={`ID : ${batchId.slice(0, 8)}`}
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
          <Text style={styles.title}>Batch {batch.id.slice(0, 8)}</Text>
          <BatchTimeline steps={batch.steps} />
          <Text style={styles.meta}>Status: {batch.status}</Text>
          <Text style={styles.meta}>
            Current step: {batch.currentStepOrder ?? "-"}
          </Text>
        </Card>
      ) : null}

      <PrimaryButton
        label={
          isCompleted
            ? "Batch completed"
            : isCompleting
              ? "Completing..."
              : "Complete current step"
        }
        onPress={handleComplete}
        disabled={isCompleting || isCompleted || isLoading}
      />

      <Text style={styles.sectionTitle}>Steps</Text>
      <FlatList
        data={batch?.steps ?? []}
        keyExtractor={(item) => `${item.batchId}-${item.stepOrder}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>
                {item.stepOrder + 1}. {item.label}
              </Text>
              <Badge
                label={item.status}
                variant={
                  item.status === "completed"
                    ? "success"
                    : item.status === "in_progress"
                      ? "info"
                      : "neutral"
                }
              />
            </View>
            <Text style={styles.stepMeta}>{item.type}</Text>
            {item.description ? (
              <Text style={styles.stepDescription}>{item.description}</Text>
            ) : null}
          </Card>
        )}
      />
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
  list: {
    paddingBottom: spacing.lg,
  },
  stepCard: {
    marginBottom: spacing.xs,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTitle: {
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  stepMeta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: spacing.xs,
    textTransform: "uppercase",
  },
  stepDescription: {
    marginTop: spacing.sm,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
