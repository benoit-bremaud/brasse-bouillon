import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { colors, spacing, typography } from "@/core/theme";

/**
 * Tab 4 of the redesigned recipe detail screen (Issue #740).
 *
 * v0.1 scope: placeholder only. Reviews, per-step comments, and
 * 4-axis ratings (Goût / Difficulté / Coût / Fidélité au style)
 * depend on the community feature (Issue #739) and will land in
 * v0.2 once the rating + review API is exposed.
 */
export function NotesReviewsTab() {
  return (
    <View testID="recipe-reviews-tab" style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Notes & Reviews</Text>
        <Text style={styles.body}>
          Les notes par axe (goût, difficulté, coût, fidélité au style) et les
          retours de la communauté arrivent dans une prochaine version.
        </Text>
        <Text style={styles.hint}>
          Bientôt : commentaires par étape, classement par utilité, et compteur
          "Brassée par N brasseurs".
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  card: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.sm,
  },
  hint: {
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
