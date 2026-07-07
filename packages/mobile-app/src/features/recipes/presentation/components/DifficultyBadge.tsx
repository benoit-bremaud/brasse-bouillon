import React, { useState } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { Badge } from "@/core/ui/Badge";
import {
  RecipeDifficultyLevel,
  RecipeDifficultyReason,
} from "@/features/recipes/domain/recipe.types";
import { DIFFICULTY_LABELS, DIFFICULTY_VARIANTS } from "./difficulty.constants";
import { DifficultyExplainModal } from "./DifficultyExplainModal";

export type DifficultyBadgeProps = Readonly<{
  level: RecipeDifficultyLevel;
  /** Computed level — surfaced as the « calculé : … » hint when overridden. */
  computed?: RecipeDifficultyLevel | null;
  reasons?: RecipeDifficultyReason[];
  /** When true, the badge is tappable and opens the tap-to-explain modal. */
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * Brewing-difficulty badge (green / amber / red) — a pure consumer of the
 * backend-computed level (ADR-0024, the mobile never computes it). On the recipe
 * detail it is `interactive`: tapping it opens the stored tap-to-explain. On list
 * cards it is display-only (the card itself is the touch target, so the badge
 * must not nest a second touchable).
 */
export function DifficultyBadge({
  level,
  computed,
  reasons,
  interactive = false,
  style,
}: DifficultyBadgeProps) {
  const [explaining, setExplaining] = useState(false);
  const label = DIFFICULTY_LABELS[level];
  const badge = <Badge label={label} variant={DIFFICULTY_VARIANTS[level]} />;

  if (!interactive) {
    return <View style={[styles.wrap, style]}>{badge}</View>;
  }

  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        onPress={() => setExplaining(true)}
        accessibilityRole="button"
        accessibilityLabel={`Difficulté : ${label}`}
        accessibilityHint="Appuie pour comprendre pourquoi"
      >
        {badge}
      </Pressable>
      <DifficultyExplainModal
        visible={explaining}
        level={level}
        computed={computed}
        reasons={reasons ?? []}
        onClose={() => setExplaining(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
  },
});
