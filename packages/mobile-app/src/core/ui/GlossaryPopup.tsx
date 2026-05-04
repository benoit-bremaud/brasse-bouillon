import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { colors, spacing, typography } from "@/core/theme";
import type {
  GlossaryCategory,
  GlossaryEntry,
} from "@/features/tools/domain/glossary.types";

interface Props {
  /** When `null`, the modal is hidden. */
  readonly entry: GlossaryEntry | null;
  /** Closes the popup. Called on backdrop press or X icon. */
  readonly onClose: () => void;
  /**
   * Optional callback for the "Académie →" link. The navigation
   * target is decided by the host (typically pushes
   * `/academy/glossaire`). When omitted, the link is hidden.
   */
  readonly onReadMore?: (entry: GlossaryEntry) => void;
}

/**
 * Modal popup that surfaces a glossary entry's definition,
 * triggered by `<GlossaryTerm>` long-press (Issue #783).
 *
 * Layout :
 * - Term displayLabel on the LEFT, category badge on the RIGHT —
 *   single header row so the popup stays compact
 * - Close X icon : absolute top-right corner, 36 px circular
 *   target with hitSlop padding for thumb ergonomics
 * - Definition : short (~1 sentence) body text
 * - Optional "Académie →" link : right-aligned, subtle (the user
 *   inferred meaning from context — no need for a verbose CTA)
 *
 * Centering is achieved with a flex parent (`flex: 1` +
 * `justifyContent: "center"` + `alignItems: "center"`) and a
 * sibling absolutely-positioned backdrop Pressable that catches
 * outside taps. No `marginTop`/`marginBottom` math is needed —
 * the flex container computes the centered position correctly
 * on any device.
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
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer la définition"
          accessibilityHint="Touchez l'arrière-plan pour fermer la définition."
          onPress={onClose}
          style={styles.backdrop}
        />
        <View style={styles.cardWrapper}>
          <Card style={styles.card}>
            <Pressable
              style={styles.closeButton}
              hitSlop={spacing.md}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer la définition"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
            <View style={styles.headerRow}>
              <Text style={styles.term}>{entry.displayLabel}</Text>
              <Badge
                label={CATEGORY_LABEL[entry.category]}
                variant={CATEGORY_BADGE_VARIANT[entry.category]}
                style={styles.badge}
              />
            </View>
            <Text style={styles.definition}>{entry.definition}</Text>
            {onReadMore ? (
              <Pressable
                onPress={() => onReadMore(entry)}
                hitSlop={spacing.xs}
                accessibilityRole="link"
                accessibilityLabel="Ouvrir l'Académie pour en savoir plus"
                style={({ pressed }) => [
                  styles.academyLink,
                  pressed && styles.academyLinkPressed,
                ]}
              >
                <Text style={styles.academyLinkLabel}>Académie →</Text>
              </Pressable>
            ) : null}
          </Card>
        </View>
      </View>
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
// Reserve enough horizontal room for the close button so the term
// + badge row never collides with the icon.
const CLOSE_BUTTON_RESERVE = CLOSE_BUTTON_SIZE + spacing.sm;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30, 30, 30, 0.55)",
  },
  cardWrapper: {
    width: "92%",
    maxWidth: 420,
  },
  card: {
    padding: spacing.md,
  },
  closeButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: CLOSE_BUTTON_SIZE,
    height: CLOSE_BUTTON_SIZE,
    borderRadius: CLOSE_BUTTON_SIZE / 2,
    backgroundColor: colors.state.infoBackground,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  closeIcon: {
    fontSize: typography.size.body,
    lineHeight: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.sm,
    paddingRight: CLOSE_BUTTON_RESERVE,
  },
  term: {
    flex: 1,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
  },
  badge: {
    flexShrink: 0,
  },
  definition: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  academyLink: {
    alignSelf: "flex-end",
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  academyLinkPressed: {
    opacity: 0.6,
  },
  academyLinkLabel: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
    textDecorationLine: "underline",
  },
});
