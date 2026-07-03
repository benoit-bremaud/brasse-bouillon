import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, shadows, spacing, typography } from "@/core/theme";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { useMarkStickyCtaPresent } from "@/core/ui/sticky-cta-clearance";

type RecipeStickyCtaProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  helperText?: string | null;
  bottomOffset?: number;
};

/**
 * Sticky CTA bar pinned at the bottom of the recipe detail screen
 * across all four tabs (Issue #740, Round 4). Wraps `PrimaryButton`
 * so the brand identity stays consistent with the rest of the app
 * and surfaces a helper line for capacity warnings or recipe
 * provenance.
 */
export function RecipeStickyCta({
  label,
  onPress,
  disabled = false,
  helperText = null,
  bottomOffset = 0,
}: RecipeStickyCtaProps) {
  // Declare this bar mounted so app-level floating UI (Snackbar) clears it.
  useMarkStickyCtaPresent();
  return (
    <View
      testID="recipe-sticky-cta"
      style={[styles.container, { paddingBottom: spacing.sm + bottomOffset }]}
    >
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      <PrimaryButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.border,
    ...shadows.sm,
  },
  helper: {
    marginBottom: spacing.xs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textAlign: "center",
  },
});
