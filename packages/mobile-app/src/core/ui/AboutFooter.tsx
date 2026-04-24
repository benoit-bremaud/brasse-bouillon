import { colors, spacing, typography } from "@/core/theme";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import React from "react";
import { appInfo } from "@/core/config/app-info";

export function AboutFooter() {
  return (
    <Card
      variant="subtle"
      accessibilityRole="summary"
      accessibilityLabel="À propos de l'application"
    >
      <Text style={styles.title}>À propos</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Version</Text>
        <Text style={styles.value} testID="about-footer-version">
          {appInfo.version}
        </Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.row}>
        <Text style={styles.label}>Commit</Text>
        <Text style={styles.value} testID="about-footer-commit">
          {appInfo.commit}
        </Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.row}>
        <Text style={styles.label}>Build</Text>
        <Text style={styles.value} testID="about-footer-build-date">
          {appInfo.buildDate}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
  },
  value: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral.border,
  },
});
