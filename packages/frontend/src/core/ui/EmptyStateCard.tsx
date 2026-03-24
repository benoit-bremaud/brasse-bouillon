import { colors, spacing, typography } from "@/core/theme";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import React from "react";

type Props = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyStateCard({ title, description, action }: Props) {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  title: {
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.regular,
  },
  action: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
  },
});
