import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/core/theme";

type RecipeProvenanceBadgeProps = Readonly<{
  label: string;
}>;

/**
 * Small badge surfaced on the Overview tab when the recipe was
 * imported from another source — typically the scan flow. Mirrors
 * the visual idiom used elsewhere (chip with icon + caption) and
 * makes the audit trail of "where this recipe came from" explicit
 * for the user, which is one of the v0.1 acceptance criteria of
 * Issue #740 ("Recipe imported from scan lands on this new detail
 * screen with provenance visible").
 */
export function RecipeProvenanceBadge({ label }: RecipeProvenanceBadgeProps) {
  return (
    <View testID="recipe-provenance-badge" style={styles.container}>
      <Ionicons
        name="scan-outline"
        size={14}
        color={colors.brand.secondary}
        style={styles.icon}
      />
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
    marginBottom: spacing.sm,
  },
  icon: {
    marginRight: spacing.xxs,
  },
  label: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
