import { colors, radius, spacing, typography } from "@/core/theme";
import { StyleSheet, Text, View } from "react-native";

import { BatchStep } from "@/features/batches/domain/batch.types";

type Props = {
  steps: BatchStep[];
};

export function getProgressPercent(sortedSteps: BatchStep[]): number {
  if (sortedSteps.length === 0) {
    return 0;
  }

  if (sortedSteps.length === 1) {
    return sortedSteps[0].status === "completed" ? 100 : 0;
  }

  const currentIndex = sortedSteps.findIndex(
    (step) => step.status === "in_progress",
  );
  if (currentIndex >= 0) {
    return (currentIndex / (sortedSteps.length - 1)) * 100;
  }

  let lastCompletedIndex = -1;
  for (let i = sortedSteps.length - 1; i >= 0; i -= 1) {
    if (sortedSteps[i].status === "completed") {
      lastCompletedIndex = i;
      break;
    }
  }

  if (lastCompletedIndex >= 0) {
    return (lastCompletedIndex / (sortedSteps.length - 1)) * 100;
  }

  return 0;
}

export function BatchTimeline({ steps }: Props) {
  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);
  const progressPercent = getProgressPercent(sortedSteps);

  if (sortedSteps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progression du brassin</Text>

      <View style={styles.trackContainer}>
        <View style={styles.track} />
        <View style={[styles.trackFilled, { width: `${progressPercent}%` }]} />
        <View style={styles.markersRow}>
          {sortedSteps.map((step) => {
            const isDone = step.status === "completed";
            const isCurrent = step.status === "in_progress";

            return (
              <View
                key={`${step.batchId}-${step.stepOrder}`}
                style={styles.markerWrap}
              >
                <View
                  style={[
                    styles.marker,
                    isDone && styles.markerDone,
                    isCurrent && styles.markerCurrent,
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.labelsRow}>
        {sortedSteps.map((step) => (
          <Text
            key={`${step.batchId}-${step.stepOrder}-label`}
            numberOfLines={1}
            style={styles.label}
          >
            {step.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  title: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  trackContainer: {
    height: 20,
    justifyContent: "center",
  },
  track: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.neutral.border,
  },
  trackFilled: {
    position: "absolute",
    left: 0,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary,
  },
  markersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  markerWrap: {
    width: 16,
    alignItems: "center",
  },
  marker: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral.muted,
    backgroundColor: colors.neutral.white,
  },
  markerDone: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  markerCurrent: {
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
  },
  labelsRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
  },
  label: {
    flex: 1,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.textSecondary,
    textAlign: "center",
  },
});
