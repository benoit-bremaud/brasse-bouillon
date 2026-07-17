import React, { useMemo } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { radius, shadows, spacing, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";

type Props = ViewProps & {
  variant?: "default" | "subtle";
};

export function Card({ style, variant = "default", ...rest }: Props) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <View
      {...rest}
      style={[styles.base, variant === "subtle" && styles.subtle, style]}
    />
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    base: {
      backgroundColor: themeColors.neutral.white,
      borderRadius: radius.lg,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: themeColors.neutral.border,
      ...shadows.md,
    },
    subtle: {
      backgroundColor: themeColors.semantic.info,
      borderColor: themeColors.neutral.border,
    },
  });
}
