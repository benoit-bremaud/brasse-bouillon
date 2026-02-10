import { colors, spacing, typography } from "@/core/theme";
import {
  completeCurrentBatchStep,
  getBatchDetails,
} from "@/features/batches/application/batches.use-cases";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { Batch } from "@/features/batches/domain/batch.types";
import { BatchTimeline } from "@/features/batches/presentation/BatchTimeline";

type Props = {
  batchId: string;
};

export function BatchDetailsScreen({ batchId }: Props) {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = async () => {
    if (!batchId) {
      setError("Missing batch id.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBatchDetails(batchId);
      setBatch(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load batch"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!batchId) {
      return;
    }
    setIsCompleting(true);
    try {
      const data = await completeCurrentBatchStep(batchId);
      if (data) {
        setBatch(data);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to complete step"));
    } finally {
      setIsCompleting(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [batchId]);

  const isCompleted = batch?.status === "completed";

  return (
    <Screen isLoading={isLoading} error={error} onRetry={fetchBatch}>
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
