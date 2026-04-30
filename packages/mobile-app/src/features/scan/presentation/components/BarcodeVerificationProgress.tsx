import React from "react";
import { StyleSheet, View } from "react-native";

import { colors, spacing } from "@/core/theme";

/**
 * Progressive 0/5 → 5/5 scan verification dots (#638).
 *
 * The barcode verification flow requires 5 identical scans before
 * confirming the code. Without a visual indicator, the count
 * appeared to jump from 0/5 to 5/5 because scans arrive in rapid
 * bursts. Persona Léa la Curieuse needs to *see* the camera making
 * progress so she keeps it steady on the bottle.
 *
 * Renders a horizontal row of `total` filled-or-empty dots. The
 * first `count` dots use the brand primary fill; the rest stay
 * outlined in the neutral border. Reuses theme tokens — no
 * hardcoded colors.
 */
type Props = Readonly<{
  count: number;
  total: number;
}>;

export function BarcodeVerificationProgress({ count, total }: Props) {
  const safeCount = Math.max(0, Math.min(count, total));
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`Vérification du code-barres : ${safeCount} sur ${total} scans identiques`}
      accessibilityValue={{ min: 0, max: total, now: safeCount }}
      testID="barcode-verification-progress"
    >
      {Array.from({ length: total }, (_, index) => {
        const filled = index < safeCount;
        return (
          <View
            key={index}
            style={[styles.dot, filled ? styles.dotFilled : styles.dotEmpty]}
            testID={`barcode-verification-dot-${filled ? "filled" : "empty"}`}
          />
        );
      })}
    </View>
  );
}

const DOT_SIZE = 14;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
  },
  dotFilled: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  dotEmpty: {
    backgroundColor: "transparent",
    borderColor: colors.neutral.border,
  },
});
