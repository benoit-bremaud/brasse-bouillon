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
 * Visual contract — pedagogical card layout, design-tokens only:
 * - Backdrop: half-opaque charcoal, taps anywhere outside the card
 *   dismiss the popup
 * - Card: 92 % of the viewport width (capped at 420 px on tablets),
 *   centered vertically, generous internal padding
 * - Close button: prominent circular target on the top-right with a
 *   large hitSlop so it's easy to dismiss with the thumb
 * - Definition: body-size text, comfortable line-height, the term
 *   stands out via brand-secondary heading
 * - CTA: full-width brand-primary affordance to navigate to the
 *   full Académie glossary entry
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
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <Text style={styles.term}>{entry.displayLabel}</Text>
                <Badge
                  label={CATEGORY_LABEL[entry.category]}
                  variant={CATEGORY_BADGE_VARIANT[entry.category]}
                  style={styles.badge}
                />
              </View>
              <Pressable
                style={styles.closeButton}
                hitSlop={spacing.md}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fermer la définition"
              >
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.definition}>{entry.definition}</Text>
            {onReadMore ? (
              <Pressable
                onPress={() => onReadMore(entry)}
                accessibilityRole="button"
                accessibilityLabel="Lire plus dans Académie"
                style={({ pressed }) => [
                  styles.readMore,
                  pressed && styles.readMorePressed,
                ]}
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

const CLOSE_BUTTON_SIZE = 36;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(30, 30, 30, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  cardWrapper: {
    width: "92%",
    maxWidth: 420,
  },
  card: {
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  term: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
    marginBottom: spacing.xs,
  },
  badge: {
    alignSelf: "flex-start",
  },
  closeButton: {
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    backgroundColor: colors.state.infoBackground,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    justifyContent: "center",
    alignItems: "center",
  },
  closeIcon: {
    fontSize: typography.size.body,
    lineHeight: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  definition: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.md,
  },
  readMore: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.state.infoBackground,
    borderWidth: 1,
    borderColor: colors.brand.primary,
    alignItems: "center",
  },
  readMorePressed: {
    backgroundColor: colors.brand.background,
  },
  readMoreLabel: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
});
