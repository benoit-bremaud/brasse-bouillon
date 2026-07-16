import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { colors, shadows, spacing, typography } from "@/core/theme";
import { useFooterVisibility } from "@/core/ui/footer-visibility-context";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { useMarkStickyCtaPresent } from "@/core/ui/sticky-cta-clearance";
import { useNavigationBarFootprint } from "@/core/ui/use-navigation-bar-footprint";

type RecipeStickyCtaProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  helperText?: string | null;
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
}: RecipeStickyCtaProps) {
  // Declare this bar mounted so app-level floating UI (Snackbar) clears it.
  useMarkStickyCtaPresent();
  // Owns its nav clearance rather than taking it as a prop: the caller cannot
  // get it wrong, and the CTA follows the bar like every other follower
  // (ADR-0029 clause 5).
  const footprint = useNavigationBarFootprint();
  const { visible } = useFooterVisibility();
  const prefersReducedMotion = useReducedMotion();
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    // Slide down into the space the bar frees. Without this the reserved
    // footprint stays as a dead white block under the button once the bar is
    // hidden (seen on device).
    const target = visible ? 0 : footprint;
    translateY.value = prefersReducedMotion
      ? target
      : withSpring(target, { mass: 1, damping: 18, stiffness: 140 });
  }, [visible, footprint, prefersReducedMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: translateY.value }] };
  });

  return (
    <Animated.View
      testID="recipe-sticky-cta"
      style={[
        styles.container,
        // Constant across revealed/hidden — the clause-6 invariant: the button
        // always clears the bar at rest, whatever the animation is doing.
        { paddingBottom: spacing.sm + footprint },
        animatedStyle,
      ]}
    >
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
      <PrimaryButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={label}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Absolute, like the Snackbar it sits under. In the layout flow, translating
  // the bar to follow the nav bar dragged its whole box down and opened a gap
  // above it (seen on device); pinned to the bottom edge instead, content
  // scrolls underneath and only the bar moves. Screens reserve its height via
  // `ScreenScrollView`'s `extraBottomClearance`.
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
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
