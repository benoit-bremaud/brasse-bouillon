import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import type { ThemeColors } from "@/core/theme";

type HeaderBackButtonProps = {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
};

export function HeaderBackButton({
  label,
  accessibilityLabel,
  onPress,
}: HeaderBackButtonProps) {
  const { colors: themeColors } = useTheme();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <Ionicons
        name="chevron-back"
        size={18}
        color={themeColors.brand.secondary}
      />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

function createStyles(themeColors: ThemeColors) {
  return StyleSheet.create({
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xxs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.lg,
      backgroundColor: themeColors.brand.background,
      borderWidth: 1,
      borderColor: themeColors.brand.secondary,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    text: {
      color: themeColors.brand.secondary,
      fontSize: typography.size.caption,
      lineHeight: typography.lineHeight.caption,
      fontWeight: typography.weight.medium,
    },
  });
}
