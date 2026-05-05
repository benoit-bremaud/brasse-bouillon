import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "@/core/theme";
import {
  ebcToHex,
  foregroundOnEbc,
} from "@/features/scan/application/lookup-color";

type BeerHeroProps = Readonly<{
  name: string;
  brewery?: string | null;
  style?: string | null;
  colorEbc: number | null;
}>;

/**
 * Hero block at the top of the BeerInfoCardScreen and the recipe
 * detail screen (Issue #740, Round 4 — reused as the canonical hero
 * primitive). Background colour is computed from the beer's actual
 * EBC value so a Punk IPA renders amber-orange, La Chouffe pale
 * amber, and Rochefort 10 deep brown — the same data drives both the
 * visual identity and the "Couleur" word in the at-a-glance row,
 * keeping the user's mental model coherent.
 *
 * Foreground colour adapts (light text on dark backgrounds, dark
 * text on pale backgrounds) so the hero stays readable across the
 * full EBC range.
 *
 * `brewery` and `style` are optional: when absent (e.g. a recipe
 * with no brewery metadata yet), the corresponding row / chip is
 * hidden rather than rendering an empty placeholder.
 */
export function BeerHero({
  name,
  brewery = null,
  style = null,
  colorEbc,
}: BeerHeroProps) {
  const background = ebcToHex(colorEbc);
  const foreground = foregroundOnEbc(colorEbc);
  const breweryLabel = trimToNull(brewery);
  const styleLabel = trimToNull(style);
  const accessibilityLabel = [name, breweryLabel, styleLabel]
    .filter((value): value is string => Boolean(value))
    .join(", ");

  return (
    <View
      style={[styles.hero, { backgroundColor: background }]}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="header"
    >
      <Text style={[styles.name, { color: foreground }]} numberOfLines={2}>
        {name}
      </Text>
      {breweryLabel ? (
        <Text style={[styles.brewery, { color: foreground }]} numberOfLines={1}>
          {breweryLabel}
        </Text>
      ) : null}
      {styleLabel ? (
        <View style={[styles.styleChip, { borderColor: foreground }]}>
          <Text
            style={[styles.styleChipText, { color: foreground }]}
            numberOfLines={1}
          >
            {styleLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function trimToNull(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

const styles = StyleSheet.create({
  hero: {
    height: 280,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderRadius: radius.lg,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  name: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    lineHeight: typography.lineHeight.h1,
    marginBottom: spacing.xs,
  },
  brewery: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    marginBottom: spacing.sm,
    opacity: 0.9,
  },
  styleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  styleChipText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
