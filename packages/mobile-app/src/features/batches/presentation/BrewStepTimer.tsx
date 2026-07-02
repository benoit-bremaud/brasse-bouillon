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
  // Next step in the workflow, for the T-minus pre-announce (F9a,
  // brew-day/06). Null/omitted on the last step: nothing to announce.
  nextStep?: BatchStep | null;
};

// T-minus threshold for announcing the next step's PRÉP (F9a). Fixed 5 min:
// enough to heat/sanitize ahead, short enough to stay relevant.
const T_MINUS_ANNOUNCE_SEC = 5 * 60;

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
export function BrewStepTimer({
  step,
  useDemoData,
  nextStep = null,
}: Readonly<Props>) {
  const countdown = useStepCountdown(step, useDemoData);
  if (!countdown) {
    return null;
  }

  const elapsedMin = Math.round(
    (countdown.totalSec - countdown.remainingSec) / 60,
  );
  const totalMin = Math.round(countdown.totalSec / 60);

  // Derived anticipation cues (F9a, brew-day/06) — nothing persisted:
  // elapsed timer = calm hand-off to the F5 end condition (never an alarm,
  // overrunning is NORMAL in brewing); T-minus window = announce the next
  // step's PRÉP so the brewer anticipates instead of enduring.
  const isElapsed = countdown.remainingSec <= 0;
  const announcedNext =
    !isElapsed && countdown.remainingSec <= T_MINUS_ANNOUNCE_SEC
      ? nextStep
      : null;

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

      {isElapsed ? (
        <View style={styles.elapsedBlock}>
          <Text style={styles.elapsedTitle}>Temps écoulé</Text>
          {/* Point at the F5 doneWhen card only when the step carries one —
              legacy steps have none, so the pointer would mislead. */}
          <Text style={styles.elapsedHint}>
            {step.doneWhen
              ? "Vérifie la condition de fin ci-dessous, puis termine l'étape quand c'est bon."
              : "Termine l'étape quand c'est bon — le chrono est une aide, pas un ordre."}
          </Text>
        </View>
      ) : (
        <>
          <Text style={styles.countdown}>
            {formatCountdown(countdown.remainingSec)}
          </Text>
          <Text style={styles.remainingHint}>restantes</Text>
        </>
      )}

      {announcedNext ? (
        <View style={styles.announceBlock} testID="next-step-announce">
          <Text style={styles.announceTitle}>
            Bientôt : {announcedNext.label}
          </Text>
          {announcedNext.prepActions?.length ? (
            <Text style={styles.announceHint}>
              Profites-en pour préparer : «{" "}
              {announcedNext.prepActions[0].action} »
            </Text>
          ) : null}
        </View>
      ) : null}

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
  elapsedBlock: {
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.xxs,
  },
  elapsedTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    textAlign: "center",
  },
  elapsedHint: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    textAlign: "center",
  },
  announceBlock: {
    borderRadius: radius.md,
    backgroundColor: colors.state.infoBackground,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xxs,
  },
  announceTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  announceHint: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
