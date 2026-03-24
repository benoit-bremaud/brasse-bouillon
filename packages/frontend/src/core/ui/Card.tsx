import { colors, radius, shadows, spacing } from "@/core/theme";
import { StyleSheet, View, ViewProps } from "react-native";

import React from "react";

type Props = ViewProps & {
  variant?: "default" | "subtle";
};

export function Card({ style, variant = "default", ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[styles.base, variant === "subtle" && styles.subtle, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    ...shadows.md,
  },
  subtle: {
    backgroundColor: colors.semantic.info,
    borderColor: colors.neutral.border,
  },
});
