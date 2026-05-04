import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { colors, radius, spacing, typography } from "@/core/theme";
import type {
  GlossaryCategory,
  GlossaryEntry,
} from "@/features/tools/domain/glossary.types";

interface Props {
  /** When `null`, the modal is hidden. */
  readonly entry: GlossaryEntry | null;
  /**
   * The literal word the user pressed in the source text. Shown as
   * the popup title so the user always sees the exact word they
   * pressed instead of the canonical displayLabel.
   */
  readonly surface?: string;
  /** Closes the popup. */
  readonly onClose: () => void;
  /** Optional Académie navigation callback. */
  readonly onReadMore?: (entry: GlossaryEntry) => void;
}

/**
 * Glossary entry popup (Issue #783) — built on RN core `Modal`
 * with an explicit OK button as the primary close affordance.
 *
 * After many iterations debugging Android Modal + Pressable + the
 * gesture-responder API for an anchored popover, the layout simply
 * doesn't work reliably across devices. Dropped the popover idea:
 * the popup is now a centered modal with a bordered card and an
 * unmistakable OK button at the bottom. No more click-zones, no
 * more responder hacks.
 */
export function GlossaryPopup({
  entry,
  surface,
  onClose,
  onReadMore,
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  if (entry === null) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      hardwareAccelerated
    >
      <View
        style={[
          styles.backdrop,
          { width: screenWidth, height: screenHeight },
        ]}
      >
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerLabels}>
              <Text style={styles.surfaceLabel}>
                {surface ?? entry.displayLabel}
              </Text>
              {surface !== undefined &&
              normalize(surface) !== normalize(entry.displayLabel) ? (
                <Text style={styles.canonicalLabel}>{entry.displayLabel}</Text>
              ) : null}
            </View>
            <Badge
              label={CATEGORY_LABEL[entry.category]}
              variant={CATEGORY_BADGE_VARIANT[entry.category]}
              style={styles.badge}
            />
          </View>
          <Text style={styles.definition}>{entry.definition}</Text>
          <View style={styles.actionsRow}>
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
            ) : (
              <View />
            )}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fermer la définition"
              style={({ pressed }) => [
                styles.okButton,
                pressed && styles.okButtonPressed,
              ]}
            >
              <Text style={styles.okButtonLabel}>OK</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </Modal>
  );
}

/** Lowercase + drop punctuation for the "is the surface different
 * from the canonical label" comparison. */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[\s_-]+/g, "").trim();
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
  // Full-screen dark overlay that vertically + horizontally centers
  // the card. Explicit width/height from useWindowDimensions because
  // `flex: 1` is unreliable inside a transparent Modal on Android.
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerLabels: {
    flex: 1,
  },
  surfaceLabel: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
  },
  canonicalLabel: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
  badge: {
    flexShrink: 0,
  },
  definition: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  academyLink: {
    paddingVertical: spacing.xs,
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
  okButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
  },
  okButtonPressed: {
    backgroundColor: colors.brand.secondary,
  },
  okButtonLabel: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
});
