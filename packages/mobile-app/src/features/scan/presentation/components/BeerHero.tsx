import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { radius, spacing, typography } from "@/core/theme";
import {
  ebcToHex,
  foregroundOnEbc,
} from "@/features/scan/application/lookup-color";

type BeerHeroProps = {
  name: string;
  brewery: string;
  style: string;
  colorEbc: number | null;
};

/**
 * Hero block at the top of the BeerInfoCardScreen. The background
 * colour is computed from the beer's actual EBC value so a Punk IPA
 * shows up amber-orange, La Chouffe pale amber, and Rochefort 10
 * deep brown — the same data drives both the visual identity and
 * the "Couleur" word in the at-a-glance row, keeping the user's
 * mental model coherent.
 *
 * Foreground colour adapts (light text on dark backgrounds, dark
 * text on pale backgrounds) so the hero stays readable across the
 * full EBC range.
 *
 * Height is fixed-aspect: ~40% of a typical phone screen at
 * default font sizes (per #698 acceptance criteria), without using
 * `Dimensions` so the layout stays predictable in tests.
 */
export function BeerHero({ name, brewery, style, colorEbc }: BeerHeroProps) {
  const background = ebcToHex(colorEbc);
  const foreground = foregroundOnEbc(colorEbc);

  return (
    <View
      style={[styles.hero, { backgroundColor: background }]}
      accessible
      accessibilityLabel={`${name}, ${brewery}, ${style}`}
      accessibilityRole="header"
    >
      <Text style={[styles.name, { color: foreground }]} numberOfLines={2}>
        {name}
      </Text>
      <Text style={[styles.brewery, { color: foreground }]} numberOfLines={1}>
        {brewery}
      </Text>
      <View style={[styles.styleChip, { borderColor: foreground }]}>
        <Text
          style={[styles.styleChipText, { color: foreground }]}
          numberOfLines={1}
        >
          {style}
        </Text>
      </View>
    </View>
  );
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
