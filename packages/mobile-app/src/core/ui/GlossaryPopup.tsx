import React, { useState } from "react";
import {
  Dimensions,
  LayoutChangeEvent,
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
 * Positioning : the card is anchored just below the finger Y, like
 * a contextual tooltip. If the touch was near the bottom of the
 * screen, the popup flips above the finger so it never overflows
 * out of the visible viewport. Falls back to vertically-centered
 * if no `anchorY` is provided.
 *
 * Layout :
 * - Term displayLabel on the LEFT, category badge on the RIGHT —
 *   single header row so the popup stays compact
 * - Close X icon : absolute top-right, 36 px circular target with
 *   hitSlop padding for thumb ergonomics
 * - Definition : short (~1 sentence) body text
 * - Optional "Académie →" link : right-aligned, subtle (the user
 *   inferred meaning from context)
 */
export function GlossaryPopup({ entry, anchorY, onClose, onReadMore }: Props) {
  const [cardHeight, setCardHeight] = useState<number | null>(null);

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
        accessibilityRole="button"
        accessibilityLabel="Fermer la définition"
        accessibilityHint="Touchez l'arrière-plan pour fermer la définition."
        onPress={onClose}
        style={styles.backdrop}
      />
      <View
        style={[styles.cardContainer, computeCardOffset(anchorY, cardHeight)]}
        pointerEvents="box-none"
        onLayout={(event: LayoutChangeEvent) => {
          setCardHeight(event.nativeEvent.layout.height);
        }}
      >
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
/** Vertical gap between the finger and the popup edge. */
const ANCHOR_GAP = spacing.sm;
/** Minimum margin from the screen edge so the popup never bleeds. */
const SCREEN_MARGIN = spacing.md;

/**
 * Computes a `top` offset that places the card just below the
 * finger Y, flipping above when the popup would overflow at the
 * bottom of the screen. Returns no offset (card centers) when no
 * anchor is provided.
 *
 * `cardHeight` is `null` on the first render (before onLayout has
 * fired). On that frame we use a conservative estimate so the
 * card doesn't flash off-screen — the second render uses the real
 * measured height.
 */
function computeCardOffset(
  anchorY: number | undefined,
  cardHeight: number | null,
): { top?: number; bottom?: number; justifyContent?: "center" } {
  if (anchorY === undefined) {
    return { justifyContent: "center" };
  }
  const screenHeight = Dimensions.get("window").height;
  // Conservative pre-layout estimate — first frame only.
  const estimatedHeight = cardHeight ?? 180;
  const desiredTop = anchorY + ANCHOR_GAP;
  const fitsBelow =
    desiredTop + estimatedHeight <= screenHeight - SCREEN_MARGIN;
  if (fitsBelow) {
    return { top: desiredTop };
  }
  // Not enough room below — flip above the finger.
  const desiredBottom = screenHeight - anchorY + ANCHOR_GAP;
  const fitsAbove =
    desiredBottom + estimatedHeight <= screenHeight - SCREEN_MARGIN;
  if (fitsAbove) {
    return { bottom: desiredBottom };
  }
  // Last resort — anchor near the bottom safely inside the screen.
  return {
    top: Math.max(
      SCREEN_MARGIN,
      screenHeight - estimatedHeight - SCREEN_MARGIN,
    ),
  };
}

const styles = StyleSheet.create({
  // Half-opaque dark overlay that darkens whatever is behind the
  // popup so the card stands out clearly. Disappears together with
  // the card when the user closes the modal (entry === null short-
  // circuits the whole component to `return null`).
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  cardContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  // Width is 90% of the screen capped at 420 px on tablets, applied
  // directly on the card so `alignItems: "center"` on the container
  // truly centers it horizontally (with width: "100%" the card
  // would fill the row edge-to-edge and the alignment would be a
  // no-op).
  card: {
    width: "90%",
    maxWidth: 420,
    alignSelf: "center",
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
    paddingRight: CLOSE_BUTTON_SIZE + spacing.sm,
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
