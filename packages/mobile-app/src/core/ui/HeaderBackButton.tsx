import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { Ionicons } from "@expo/vector-icons";
import React from "react";

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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      onPress={onPress}
    >
      <Ionicons name="chevron-back" size={18} color={colors.brand.secondary} />
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.background,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  text: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
