import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Modal from "react-native-modal";

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
   * Optional surface text — the literal word the user pressed in
   * the source text (e.g. "dry-hop", "MASH", "empâtage"). When
   * provided, it is shown as the popup title so the user always
   * sees the exact word they pressed instead of the canonical
   * displayLabel ("Houblonnage à cru" etc.).
   */
  readonly surface?: string;
  /** Closes the popup. Called when OK is pressed or backdrop tapped. */
  readonly onClose: () => void;
  /** Optional Académie navigation callback. */
  readonly onReadMore?: (entry: GlossaryEntry) => void;
}

/**
 * Glossary entry popup (Issue #783) — built on `react-native-modal`
 * after a long debug session against RN core Modal + Pressable
 * which had unreliable touch propagation on Android.
 *
 * UX :
 * - Centered modal with darkened backdrop (handled by react-native-
 *   modal: `backdropOpacity` + `onBackdropPress`)
 * - Title = the surface text (the actual word the user pressed),
 *   which keeps it consistent with the source paragraph
 * - Subtitle = the canonical FR `displayLabel` so the user still
 *   sees the "official" term name when they pressed an alias
 * - Bottom row : "OK" button (primary) on the right; optional
 *   "Académie →" link on the left when `onReadMore` is provided
 * - No more click-zone gymnastics — only explicit buttons close
 *   the popup, plus a backdrop tap that the lib handles internally
 */
export function GlossaryPopup({
  entry,
  surface,
  onClose,
  onReadMore,
}: Props) {
  return (
    <Modal
      isVisible={entry !== null}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0.7}
      backdropColor="black"
      statusBarTranslucent
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modalContainer}
    >
      {entry !== null ? (
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
      ) : null}
    </Modal>
  );
}

/** Lowercase + collapse whitespace + drop punctuation for the
 * "is the surface different from the canonical label" check. */
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
  // react-native-modal centers vertically by default; we let the
  // card be 90% wide capped at 480 px, padded for tablets.
  modalContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    margin: 0,
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
