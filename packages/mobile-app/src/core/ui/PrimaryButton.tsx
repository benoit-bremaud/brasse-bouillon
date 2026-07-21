import React, { useMemo } from "react";
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

import { radius, shadows, spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";

type Props = PressableProps & {
  label: string;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export function PrimaryButton({ label, style, disabled, ...rest }: Props) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    base: {
      backgroundColor: themeColors.brand.primary,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      alignItems: "center",
      ...shadows.sm,
    },
    pressed: {
      opacity: 0.9,
    },
    disabled: {
      backgroundColor: themeColors.neutral.muted,
    },
    text: {
      color: themeColors.neutral.white,
      fontWeight: typography.weight.medium,
      fontSize: typography.size.label,
      lineHeight: typography.lineHeight.label,
    },
  });
}
