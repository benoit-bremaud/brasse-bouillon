import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { useStickyCtaClearance } from "@/core/ui/sticky-cta-clearance";

export type SnackbarProps = Readonly<{
  visible: boolean;
  message: string;
  /** Optional single inline action (e.g. « Annuler » to undo). */
  actionLabel?: string;
  onAction?: () => void;
}>;

/**
 * Branded transient snackbar — a bottom bar with an optional single action.
 * App-level, one at a time, driven imperatively through `useSnackbar()` (see
 * `snackbar-provider`). Sits above the floating nav footer so it never hides
 * the primary navigation, and lets touches through everywhere but the bar.
 */
export function Snackbar({
  visible,
  message,
  actionLabel,
  onAction,
}: SnackbarProps) {
  const footerOffset = useNavigationFooterOffset();
  // Float above a sticky CTA when one is mounted, instead of overlapping it.
  const ctaClearance = useStickyCtaClearance();
  if (!visible) {
    return null;
  }
  return (
    <View
      testID="snackbar-overlay"
      style={[styles.overlay, { paddingBottom: footerOffset + ctaClearance }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar} accessibilityRole="alert">
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {actionLabel ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            style={styles.action}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.md,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.neutral.textPrimary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.sm,
  },
  message: {
    flex: 1,
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  action: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  actionText: {
    color: colors.brand.background,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
});
