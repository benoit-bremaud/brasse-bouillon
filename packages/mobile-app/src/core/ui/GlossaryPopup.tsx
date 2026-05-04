import React from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  /**
   * Vertical position (window coordinates) of the touch that opened
   * the popup. The card is anchored just below this Y, falling
   * back to centered if the value is missing.
   */
  readonly anchorY?: number;
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
 * Structure (after PR #913 visual debug iterations) :
 * - The OUTER full-screen Pressable IS the backdrop. It carries the
 *   dark overlay colour AND the dismiss behaviour. No separate
 *   absolute-positioned overlay — that pattern collapsed to a thin
 *   band on Android because the parent had no flex context.
 * - The card-positioner is an absolute child with `flexDirection:
 *   row` + `justifyContent: center` so the card is genuinely
 *   centered horizontally within the available width.
 * - An inner Pressable wraps the card with a `noop` onPress so
 *   taps inside the card don't bubble to the backdrop and dismiss.
 *
 * Vertical positioning :
 * - When `anchorY` is provided, the card sits just below the
 *   finger (with a small ANCHOR_GAP), flipping above when the
 *   popup would overflow at the bottom of the screen.
 * - Falls back to vertical centering when `anchorY` is missing.
 */
export function GlossaryPopup({ entry, anchorY, onClose, onReadMore }: Props) {
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
        accessibilityRole="button"
        accessibilityLabel="Fermer la définition"
        accessibilityHint="Touchez l'arrière-plan pour fermer la définition."
      >
        <View
          style={[styles.cardPositioner, computeCardOffset(anchorY)]}
          pointerEvents="box-none"
        >
          <Pressable
            style={styles.cardWrapper}
            onPress={swallowTap}
            accessibilityRole="none"
          >
            <Card style={styles.card}>
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
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

/** No-op callback used by the inner card Pressable so taps inside
 * the card don't bubble up to the backdrop and dismiss the popup. */
function swallowTap(): void {
  // intentional no-op
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

/** Vertical gap between the finger and the popup edge. */
const ANCHOR_GAP = spacing.sm;
/** Minimum margin from the screen edge so the popup never bleeds. */
const SCREEN_MARGIN = spacing.md;

/** Conservative estimate of the card height — covers a 1-sentence
 * definition + term + badge + close button + Académie link. Stable
 * for all 35 seeded entries. We deliberately do NOT measure the
 * real height at runtime to avoid the re-render churn that broke
 * close-button taps. */
const ESTIMATED_CARD_HEIGHT = 200;

/**
 * Computes a `top` offset that places the card just below the
 * finger Y, flipping above when the popup would overflow at the
 * bottom of the screen. Returns no offset (card centers) when no
 * anchor is provided.
 */
function computeCardOffset(anchorY: number | undefined): {
  top?: number;
  bottom?: number;
  justifyContent?: "center";
} {
  if (anchorY === undefined) {
    return { justifyContent: "center" };
  }
  const screenHeight = Dimensions.get("window").height;
  const desiredTop = anchorY + ANCHOR_GAP;
  const fitsBelow =
    desiredTop + ESTIMATED_CARD_HEIGHT <= screenHeight - SCREEN_MARGIN;
  if (fitsBelow) {
    return { top: desiredTop };
  }
  // Not enough room below — flip above the finger.
  const desiredBottom = screenHeight - anchorY + ANCHOR_GAP;
  const fitsAbove =
    desiredBottom + ESTIMATED_CARD_HEIGHT <= screenHeight - SCREEN_MARGIN;
  if (fitsAbove) {
    return { bottom: desiredBottom };
  }
  // Last resort — anchor near the bottom safely inside the screen.
  return {
    top: Math.max(
      SCREEN_MARGIN,
      screenHeight - ESTIMATED_CARD_HEIGHT - SCREEN_MARGIN,
    ),
  };
}

const styles = StyleSheet.create({
  // Full-screen Pressable that IS the backdrop — flex: 1 fills the
  // Modal's content area (which itself fills the screen). The dark
  // colour is applied directly so we don't depend on a separate
  // absoluteFillObject Pressable that might collapse on Android.
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  // Absolute child of the backdrop, positions the card row at the
  // computed Y offset. Spans the full width with a horizontal
  // padding so the card is genuinely centered within the visible
  // viewport.
  cardPositioner: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: SCREEN_MARGIN,
  },
  // The card wrapper takes available row width with `flex: 1`, then
  // `maxWidth` caps it on tablets — this is the canonical RN idiom
  // for "fill, capped, centered". `pointerEvents` stays default so
  // the inner close button + Académie link Pressables receive taps.
  cardWrapper: {
    flex: 1,
    maxWidth: 420,
  },
  card: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.sm,
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
