import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { formatFrDate } from "@/core/utils/format";
import { Batch } from "@/features/batches/domain/batch.types";
import { Tasting } from "@/features/batches/domain/bottling.types";

type Props = {
  /** The completed batch driving the celebration (real dates, real volume). */
  batch: Batch;
  /** Resolved recipe name, or `null` to fall back to a "Brassin <id>" title. */
  recipeName: string | null;
  /** Recipe batch volume in litres, or `null` when unknown. */
  volumeL: number | null;
  /** The recorded tasting, or `null` when not noted yet. */
  tasting: Tasting | null;
  /** Fired by the "Noter ma dégustation" CTA. */
  onRateTasting: () => void;
};

/**
 * Live closure / celebration view for a COMPLETED batch (B3).
 *
 * Replaces the hardcoded {@link import("./BatchFinishedScreen")} demo mock on
 * the live path: it is driven entirely by the actual batch (real recipe name,
 * real volume, real bottling date) and the recorded tasting if any. KISS —
 * rich stats (ABV/IBU/EBC grid, full timeline) are deferred; this shows the
 * essentials plus a "Noter ma dégustation" CTA.
 *
 * @param props - The completed batch, recipe name, volume, tasting and CTA.
 */
export function BatchClosureView({
  batch,
  recipeName,
  volumeL,
  tasting,
  onRateTasting,
}: Props) {
  const title = recipeName ?? `Brassin ${batch.id.slice(0, 8)}`;
  const bottledOn =
    formatFrDate(batch.bottledAt) ?? formatFrDate(batch.completedAt);

  return (
    <View testID="batch-closure-view">
      <Card style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Ionicons name="beer" size={28} color={colors.neutral.white} />
          <Text style={styles.heroOverline}>Brassin terminé</Text>
        </View>
        <Text style={styles.heroTitle}>{title}</Text>
        {bottledOn ? (
          <Text style={styles.heroMeta}>Mis en bouteille le {bottledOn}</Text>
        ) : null}
        {volumeL != null ? (
          <Text style={styles.heroMeta}>Volume : {volumeL} L</Text>
        ) : null}
      </Card>

      <Card style={styles.tastingCard}>
        <Text style={styles.sectionTitle}>Ta dégustation</Text>
        {tasting ? (
          <>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Ionicons
                  key={value}
                  name={value <= tasting.rating ? "star" : "star-outline"}
                  size={20}
                  color={colors.semantic.warning}
                />
              ))}
            </View>
            {tasting.note ? (
              <Text testID="closure-tasting-note" style={styles.tastingNote}>
                “{tasting.note}”
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.tastingHint}>
            Pas encore noté. Quand tu auras goûté, note ce brassin pour t'en
            souvenir et progresser.
          </Text>
        )}
        {tasting ? null : (
          <PrimaryButton
            label="Noter ma dégustation"
            onPress={onRateTasting}
            style={styles.tastingCta}
          />
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  heroOverline: {
    color: colors.neutral.white,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    letterSpacing: 2,
    textTransform: "uppercase",
    opacity: 0.85,
  },
  heroTitle: {
    color: colors.neutral.white,
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.weight.bold,
  },
  heroMeta: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginTop: spacing.xxs,
    opacity: 0.92,
  },
  tastingCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  starRow: {
    flexDirection: "row",
    gap: spacing.xxs,
    marginBottom: spacing.xs,
  },
  tastingNote: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontStyle: "italic",
  },
  tastingHint: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  tastingCta: {
    marginTop: spacing.md,
  },
});
