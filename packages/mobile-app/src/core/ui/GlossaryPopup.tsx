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
  /** Closes the popup. Called on backdrop press. */
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
 * Sizing strategy (after PR #913 multi-iteration fix) :
 * Android `<Modal transparent>` doesn't propagate `flex: 1` to its
 * content area reliably — the outer View collapses to 0 px and
 * absolute-positioned children (backdrop) end up invisible.
 * Workaround: read the screen width / height from `Dimensions` at
 * render time and apply them as explicit dimensions on the outer
 * container, guaranteeing the backdrop fills the entire visible
 * viewport on every device.
 *
 * Closing affordance : the entire dark overlay IS the dismiss
 * target. Tapping anywhere outside the centered card closes the
 * popup. No dedicated close button — the affordance is unmistakable
 * and the X icon was unreliable to hit-test on small phones.
 */
export function GlossaryPopup({ entry, anchorY, onClose, onReadMore }: Props) {
  if (entry === null) {
    return null;
  }

  // Read at render-time so device rotation / viewport changes pick
  // up the new dimensions on the next mount.
  const { width: screenWidth, height: screenHeight } =
    Dimensions.get("window");

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
      statusBarTranslucent
    >
      {/* Outer fullscreen container with explicit dimensions —
          guarantees the backdrop fills the screen on Android
          (where `flex: 1` inside a transparent Modal can collapse
          to 0 px). */}
      <View
        style={[
          styles.fullScreen,
          { width: screenWidth, height: screenHeight },
        ]}
      >
        {/* Backdrop = absolute-fill Pressable. Taps anywhere on
            the dark area dismiss the popup. */}
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fermer la définition"
          accessibilityHint="Touchez n'importe où en dehors du card pour fermer."
        />
        {/* Card row — absolute, positioned just below the finger.
            pointerEvents=box-none so taps in empty row areas
            (above/below/sides of the card) fall through to the
            backdrop. */}
        <View
          style={[
            styles.cardPositioner,
            { width: screenWidth },
            computeCardOffset(anchorY, screenHeight),
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.cardWrapper}>
            {/* The Card claims taps in its bounds via the responder
                system so they don't bubble to the backdrop. Inner
                Pressables (Académie link) still receive their own
                taps because they are deeper in the responder chain
                and Pressable's onStartShouldSetResponder runs
                before the Card's during bubble phase. */}
            <Card
              style={styles.card}
              onStartShouldSetResponder={() => true}
              onResponderRelease={swallowTap}
            >
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
      </View>
    </Modal>
  );
}

/** No-op handler used by the Card's onResponderRelease to claim
 * touches in the card body so they don't bubble to the backdrop. */
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
 * definition + term + badge + Académie link. Used by the overflow
 * detection. We deliberately don't measure the real height to keep
 * the position stable and avoid re-render churn. */
const ESTIMATED_CARD_HEIGHT = 200;

/**
 * Computes a `top` offset that places the card just below the
 * finger Y, flipping above when the popup would overflow at the
 * bottom. Falls back to vertical centering when no anchor.
 */
function computeCardOffset(
  anchorY: number | undefined,
  screenHeight: number,
): { top: number } {
  if (anchorY === undefined) {
    // Vertical centering — top = (screen - card) / 2
    return {
      top: Math.max(SCREEN_MARGIN, (screenHeight - ESTIMATED_CARD_HEIGHT) / 2),
    };
  }
  const desiredTop = anchorY + ANCHOR_GAP;
  const fitsBelow =
    desiredTop + ESTIMATED_CARD_HEIGHT <= screenHeight - SCREEN_MARGIN;
  if (fitsBelow) {
    return { top: desiredTop };
  }
  // Not enough room below — flip above the finger.
  const desiredTopFlipped =
    anchorY - ANCHOR_GAP - ESTIMATED_CARD_HEIGHT;
  if (desiredTopFlipped >= SCREEN_MARGIN) {
    return { top: desiredTopFlipped };
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
  // Outer container — explicit width/height applied inline at
  // render time from Dimensions so we don't depend on flex: 1
  // propagating through the Modal's content area on Android.
  fullScreen: {
    position: "relative",
  },
  // Full-screen dark overlay. Catches dismiss taps anywhere
  // outside the card.
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  // Card row — absolute child at the computed top offset, full
  // explicit width (set inline from Dimensions), centers the card
  // horizontally via flexDirection + justifyContent.
  cardPositioner: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: SCREEN_MARGIN,
  },
  // Card wrapper — width-based sizing (NOT `flex: 1`). flex: 1 in a
  // row container with auto-height parent stretches the wrapper
  // vertically to fill available space, which made the wrapper
  // claim taps far below the visible card and prevented the
  // backdrop from receiving dismiss taps in most of the screen.
  // With explicit width + maxWidth + flexShrink, the wrapper is
  // exactly card-sized — backdrop receives all surrounding taps.
  cardWrapper: {
    width: "100%",
    maxWidth: 480,
    flexShrink: 1,
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
