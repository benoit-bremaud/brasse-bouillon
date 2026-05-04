import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { colors, radius, spacing, typography } from "@/core/theme";
import type {
  GlossaryCategory,
  GlossaryEntry,
} from "@/features/tools/domain/glossary.types";

interface Props {
  /** When `null`, the modal is hidden. */
  entry: GlossaryEntry | null;
  /** Closes the popup. Called on backdrop press, X button, or CTA. */
  onClose: () => void;
  /**
   * Optional callback for the "Lire plus dans Académie" CTA. The
   * navigation target is decided by the host (typically pushes
   * `/academy/glossaire`). When omitted, the CTA is hidden.
   */
  onReadMore?: (entry: GlossaryEntry) => void;
}

/**
 * Modal popup that surfaces a glossary entry's full definition,
 * triggered by `<GlossaryTerm>` long-press (Issue #783).
 *
 * Visual contract — pedagogical card layout following the project
 * design tokens: white surface, brand-secondary accent on the term
 * label, category badge variant matching the entry's category.
 */
export function GlossaryPopup({ entry, onClose, onReadMore }: Props) {
  if (entry === null) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Fermer la définition"
      >
        {/* Inner Pressable swallows taps so a tap inside the card
            does not bubble up to the backdrop and dismiss. */}
        <Pressable onPress={() => {}} style={styles.cardWrapper}>
          <Card>
            <View style={styles.headerRow}>
              <Text style={styles.term}>{entry.displayLabel}</Text>
              <Pressable
                hitSlop={spacing.sm}
                onPress={onClose}
                accessibilityLabel="Fermer la définition"
              >
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
            <Badge
              label={CATEGORY_LABEL[entry.category]}
              variant={CATEGORY_BADGE_VARIANT[entry.category]}
              style={styles.badge}
            />
            <Text style={styles.definition}>{entry.definition}</Text>
            {onReadMore ? (
              <Pressable
                onPress={() => onReadMore(entry)}
                accessibilityLabel="Lire plus dans Académie"
                style={styles.readMore}
              >
                <Text style={styles.readMoreLabel}>
                  Lire plus dans Académie →
                </Text>
              </Pressable>
            ) : null}
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const CATEGORY_LABEL: Record<GlossaryCategory, string> = {
  "brewing-process": "Processus",
  measurement: "Mesure",
  equipment: "Équipement",
  ingredient: "Ingrédient",
  style: "Style",
};

const CATEGORY_BADGE_VARIANT: Record<
  GlossaryCategory,
  "neutral" | "info" | "success"
> = {
  "brewing-process": "info",
  measurement: "neutral",
  equipment: "neutral",
  ingredient: "success",
  style: "info",
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(30, 30, 30, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  term: {
    flex: 1,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
  },
  closeIcon: {
    fontSize: typography.size.body,
    color: colors.neutral.textSecondary,
    paddingLeft: spacing.sm,
  },
  badge: {
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  definition: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.sm,
  },
  readMore: {
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  readMoreLabel: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
});
