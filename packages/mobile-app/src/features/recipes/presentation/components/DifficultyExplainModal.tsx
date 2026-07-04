import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import {
  RecipeDifficultyLevel,
  RecipeDifficultyReason,
} from "@/features/recipes/domain/recipe.types";
import { DIFFICULTY_LABELS } from "./difficulty.constants";

export type DifficultyExplainModalProps = Readonly<{
  visible: boolean;
  level: RecipeDifficultyLevel;
  /** The computed level — shown as a hint when the author overrode it. */
  computed?: RecipeDifficultyLevel | null;
  reasons: RecipeDifficultyReason[];
  onClose: () => void;
}>;

/**
 * Read-only tap-to-explain popup for the difficulty badge (ADR-0024 D4). Renders
 * the stored `reasons` as-is — the app TEACHES why a recipe sits at its level —
 * and never recomputes anything (the backend owns the math). Mirrors the branded
 * `ConfirmDialog` look (scrim + white rounded card) with a single close action.
 */
export function DifficultyExplainModal({
  visible,
  level,
  computed,
  reasons,
  onClose,
}: DifficultyExplainModalProps) {
  const showComputedHint = computed != null && computed !== level;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fermer"
      >
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          <Text
            style={styles.title}
          >{`Difficulté : ${DIFFICULTY_LABELS[level]}`}</Text>

          {showComputedHint ? (
            <Text style={styles.hint}>
              {`Niveau choisi par l'auteur — calculé : ${DIFFICULTY_LABELS[computed]}.`}
            </Text>
          ) : null}

          <Text style={styles.subheading}>Pourquoi ce niveau ?</Text>

          {reasons.length > 0 ? (
            <ScrollView style={styles.reasons}>
              {reasons.map((reason, index) => (
                <View
                  key={`${reason.factor}-${index}`}
                  style={styles.reasonRow}
                >
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.reasonText}>{reason.sentence}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>
              Aucune explication disponible pour cette recette.
            </Text>
          )}

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="J'ai compris"
          >
            <Text style={styles.closeText}>J'ai compris</Text>
          </Pressable>
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
  hint: {
    marginTop: spacing.xs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontStyle: "italic",
  },
  subheading: {
    marginTop: spacing.md,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  reasons: {
    marginTop: spacing.xs,
    maxHeight: 260,
  },
  reasonRow: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  bullet: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    marginRight: spacing.xs,
  },
  reasonText: {
    flex: 1,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  closeButton: {
    marginTop: spacing.lg,
    alignSelf: "flex-end",
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  closeText: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
});
