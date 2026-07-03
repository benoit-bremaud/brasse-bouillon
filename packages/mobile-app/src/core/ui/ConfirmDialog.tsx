import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/core/theme";

export type ConfirmDialogProps = Readonly<{
  visible: boolean;
  title: string;
  message?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button for irreversible/destructive actions (delete, cancel a brew…). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

/**
 * Branded, in-app confirmation dialog — the house replacement for the OS-native
 * `Alert.alert()` (which is unstylable and ignores the app's charte). Mirrors the
 * existing tip-modal look (scrim + white rounded card). Driven declaratively;
 * screens reach it imperatively through `useConfirm()` (see `confirm-provider`).
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Fermer"
      >
        {/* Capture touches so a tap inside the card doesn't bubble to the
            backdrop and dismiss the dialog (same guard as the tip modal). */}
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.confirmButton,
                destructive && styles.confirmButtonDestructive,
              ]}
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay.scrim,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.md,
    width: "100%",
    maxWidth: 420,
    ...shadows.sm,
  },
  title: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
  },
  message: {
    marginTop: spacing.xs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.sm,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  cancelText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  confirmButton: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  confirmButtonDestructive: {
    backgroundColor: colors.semantic.error,
  },
  confirmText: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
});
