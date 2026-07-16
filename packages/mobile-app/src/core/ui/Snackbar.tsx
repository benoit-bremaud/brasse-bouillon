import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { useFooterVisibility } from "@/core/ui/footer-visibility-context";
import { useNavigationBarFootprint } from "@/core/ui/use-navigation-bar-footprint";
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
 * `snackbar-provider`). Sits above the nav bar so it never hides the primary
 * navigation, and lets touches through everywhere but the bar.
 *
 * Follows `FooterVisibilityContext` rather than tracking the nav bar by hand:
 * it slides down with the bar and stays anchored just above it (ADR-0029
 * clause 5). One boolean drives both, so they can no longer desync.
 */
export function Snackbar({
  visible,
  message,
  actionLabel,
  onAction,
}: SnackbarProps) {
  const footprint = useNavigationBarFootprint();
  // Float above a sticky CTA when one is mounted, instead of overlapping it.
  const ctaClearance = useStickyCtaClearance();
  const { visible: isFooterVisible } = useFooterVisibility();
  const prefersReducedMotion = useReducedMotion();
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    // When the bar slides away, its footprint is free — follow it down so the
    // snackbar keeps hugging the bar instead of leaving a gap.
    const target = isFooterVisible ? 0 : footprint;
    translateY.value = prefersReducedMotion
      ? target
      : withSpring(target, { mass: 1, damping: 18, stiffness: 140 });
  }, [isFooterVisible, footprint, prefersReducedMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: translateY.value }] };
  });

  if (!visible) {
    return null;
  }
  return (
    <Animated.View
      testID="snackbar-overlay"
      style={[
        styles.overlay,
        { paddingBottom: footprint + ctaClearance },
        animatedStyle,
      ]}
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
    </Animated.View>
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
