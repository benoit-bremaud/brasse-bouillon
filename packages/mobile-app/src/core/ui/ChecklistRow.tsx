import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { colors, spacing, typography } from "@/core/theme";

type ChecklistRowProps = Readonly<{
  label: string;
  meta?: string;
  checked: boolean;
  onToggle: () => void;
  testID?: string;
}>;

/**
 * A tappable "have / missing" checklist row. Toggles `checked` on press and
 * exposes the checkbox semantics for accessibility. Visual style mirrors the
 * recipe overview "Matériel requis" rows.
 *
 * Reused across the pre-brew readiness checklists (ingredients in A2,
 * equipment in A3), hence its home in `core/ui`.
 */
export function ChecklistRow({
  label,
  meta,
  checked,
  onToggle,
  testID,
}: ChecklistRowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onToggle}
    >
      <Ionicons
        name={checked ? "checkmark-circle" : "ellipse-outline"}
        size={24}
        color={checked ? colors.semantic.success : colors.neutral.muted}
      />
      <View style={styles.text}>
        <Text style={styles.label}>{label}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  rowPressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
  },
  label: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  meta: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
