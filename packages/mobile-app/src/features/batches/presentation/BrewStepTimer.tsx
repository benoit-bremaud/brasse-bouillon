import { StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { colors, radius, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { BatchStep } from "@/features/batches/domain/batch.types";
import {
  formatCountdown,
  useStepCountdown,
} from "@/features/batches/presentation/use-step-countdown";

type Props = {
  step: BatchStep;
  useDemoData: boolean;
};

// Dynamic width can't live in StyleSheet.create() (runtime percentage); keeping
// it in a tiny helper keeps the JSX free of inline style literals (project rule).
function progressFillWidth(percent: number) {
  return { width: `${Math.max(0, Math.min(100, percent))}%` } as const;
}

/**
 * Countdown timer card for the active brewing step (brewing assistant, #781).
 * Renders nothing when the step declares no planned duration (e.g. fermentation,
 * which has its own day-based tracker).
 */
export function BrewStepTimer({ step, useDemoData }: Readonly<Props>) {
  const countdown = useStepCountdown(step, useDemoData);
  if (!countdown) {
    return null;
  }

  const elapsedMin = Math.round(
    (countdown.totalSec - countdown.remainingSec) / 60,
  );
  const totalMin = Math.round(countdown.totalSec / 60);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons
          name="timer-outline"
          size={18}
          color={colors.brand.secondary}
        />
        <Text style={styles.title}>Minuterie d'étape</Text>
        <Text style={styles.stepLabel} numberOfLines={1}>
          {step.label}
        </Text>
      </View>

      <Text style={styles.countdown}>
        {formatCountdown(countdown.remainingSec)}
      </Text>
      <Text style={styles.remainingHint}>restantes</Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            progressFillWidth(countdown.progressPct),
          ]}
        />
      </View>
      <Text style={styles.scaleHint}>
        {elapsedMin} / {totalMin} min
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  stepLabel: {
    flex: 1,
    textAlign: "right",
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  countdown: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  remainingHint: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: spacing.xs,
    backgroundColor: colors.neutral.border,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.brand.secondary,
    borderRadius: radius.full,
  },
  scaleHint: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
});
