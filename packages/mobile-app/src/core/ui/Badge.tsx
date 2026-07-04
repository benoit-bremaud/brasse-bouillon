import { colors, radius, spacing, typography } from "@/core/theme";
import { StyleSheet, Text, TextProps } from "react-native";

import React from "react";

type Variant = "neutral" | "info" | "success" | "warning" | "error";
type Placement = "inline" | "corner";

type Props = TextProps & {
  label: string;
  variant?: Variant;
  /**
   * `inline` (default) keeps the badge in the parent's normal flow, sized
   * for body text. `corner` pins the badge as an absolute marker in the
   * top-right of its parent (e.g. status indicator on a list card) and
   * shrinks the pill so it never competes with the parent's title for
   * horizontal space. Pair it with a parent View — the absolute
   * positioning anchors to the immediate parent in React Native.
   */
  placement?: Placement;
};

const variantStyles: Record<Variant, { container: object; text: object }> = {
  neutral: {
    container: {
      backgroundColor: colors.semantic.info,
      borderColor: colors.neutral.border,
    },
    text: { color: colors.neutral.textSecondary },
  },
  info: {
    container: {
      backgroundColor: colors.state.infoBackground,
      borderColor: colors.brand.secondary,
    },
    text: { color: colors.brand.secondary },
  },
  success: {
    container: {
      backgroundColor: colors.state.successBackground,
      borderColor: colors.semantic.success,
    },
    text: { color: colors.semantic.success },
  },
  warning: {
    container: {
      backgroundColor: colors.state.warningBackground,
      borderColor: colors.semantic.warning,
    },
    text: { color: colors.semantic.warning },
  },
  error: {
    container: {
      backgroundColor: colors.state.errorBackground,
      borderColor: colors.semantic.error,
    },
    text: { color: colors.semantic.error },
  },
};

export function Badge({
  label,
  variant = "neutral",
  placement = "inline",
  style,
  ...rest
}: Props) {
  const selected = variantStyles[variant];
  const placementStyle = placement === "corner" ? styles.corner : null;
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        selected.container,
        selected.text,
        placementStyle,
        style,
      ]}
    >
      {label.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
    textTransform: "uppercase",
  },
  corner: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    fontSize: typography.size.micro,
    lineHeight: typography.lineHeight.micro,
  },
});
