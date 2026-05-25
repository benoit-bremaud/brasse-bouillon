import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import React from "react";

import { colors, spacing, typography } from "@/core/theme";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { BatchStep } from "@/features/batches/domain/batch.types";
import {
  BATCH_STEP_STATUS_LABELS,
  BATCH_STEP_TYPE_LABELS,
} from "@/features/batches/presentation/batch-display.constants";

type Props = {
  step: BatchStep;
  onOpenTip: (tip: { label: string; tip: string }) => void;
};

function statusVariant(
  status: BatchStep["status"],
): "success" | "info" | "neutral" {
  if (status === "completed") {
    return "success";
  }
  return status === "in_progress" ? "info" : "neutral";
}

/** One row of the batch step list, with an optional pedagogical-tip ⓘ (#781). */
export function StepCard({ step, onOpenTip }: Readonly<Props>) {
  return (
    <Card style={styles.stepCard}>
      <Badge
        label={BATCH_STEP_STATUS_LABELS[step.status]}
        variant={statusVariant(step.status)}
        placement="corner"
      />
      <View style={styles.titleRow}>
        <Text style={styles.stepTitle} numberOfLines={1}>
          {step.stepOrder + 1}. {step.label}
        </Text>
        {step.pedagogicalTip ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Astuce pour l'étape ${step.label}`}
            hitSlop={8}
            onPress={() =>
              onOpenTip({ label: step.label, tip: step.pedagogicalTip ?? "" })
            }
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.brand.secondary}
            />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.stepMeta}>{BATCH_STEP_TYPE_LABELS[step.type]}</Text>
      {step.description ? (
        <Text style={styles.stepDescription}>{step.description}</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  stepCard: {
    marginBottom: spacing.xs,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  stepTitle: {
    flex: 1,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
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
