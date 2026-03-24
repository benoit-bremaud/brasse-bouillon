import { colors, radius, spacing, typography } from "@/core/theme";
import { StyleSheet, Text, TextProps } from "react-native";

import React from "react";

type Variant = "neutral" | "info" | "success";

type Props = TextProps & {
  label: string;
  variant?: Variant;
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
};

export function Badge({ label, variant = "neutral", style, ...rest }: Props) {
  const selected = variantStyles[variant];
  return (
    <Text
      {...rest}
      style={[styles.base, selected.container, selected.text, style]}
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
});
