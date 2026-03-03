import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/core/theme";

import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function ListHeader({ title, subtitle, action }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <View style={styles.actionContainer}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  actionContainer: {
    flexShrink: 0,
  },
  title: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.regular,
  },
});
