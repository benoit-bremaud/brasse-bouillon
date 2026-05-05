import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { RecipeCard } from "@/features/recipes/presentation/RecipeCard";
import { colors, radius, spacing, typography } from "@/core/theme";
import type { Recipe } from "@/features/recipes/domain/recipe.types";

type DiscoverSectionProps = Readonly<{
  recipes: Recipe[];
  onPressRecipe: (recipeId: string) => void;
  onPressSeeAll: () => void;
  previewLimit?: number;
}>;

const DEFAULT_PREVIEW_LIMIT = 5;

/**
 * Hub section #2 of the Mes Recettes screen (Issue #740 Round 2).
 *
 * Static curated discovery surface — the top N public recipes
 * (`listPublicRecipes`, capped at `previewLimit`) shown directly in
 * the hub so a new user (Léa, Nicolas) sees brewable recipes
 * immediately, without leaving Mes Recettes. The "Voir tout" pill
 * links to the existing CatalogScreen for the full list.
 */
export function DiscoverSection({
  recipes,
  onPressRecipe,
  onPressSeeAll,
  previewLimit = DEFAULT_PREVIEW_LIMIT,
}: DiscoverSectionProps) {
  const preview = recipes.slice(0, previewLimit);

  return (
    <View testID="hub-discover-section" style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.sectionTitle}>Découvrir</Text>
          <Text style={styles.sectionSubtitle}>
            Recettes publiques sélectionnées par Brasse-Bouillon.
          </Text>
        </View>

        <Pressable
          testID="hub-discover-see-all"
          accessibilityRole="button"
          accessibilityLabel="Voir tout le catalogue de recettes"
          style={styles.seeAllPill}
          onPress={onPressSeeAll}
        >
          <Text style={styles.seeAllPillText}>Voir tout</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={colors.brand.secondary}
          />
        </Pressable>
      </View>

      {preview.length === 0 ? (
        <Text style={styles.emptyText}>Le catalogue arrive bientôt.</Text>
      ) : (
        preview.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            badgeLabel="Publique"
            onPress={() => onPressRecipe(recipe.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
  },
  sectionSubtitle: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: spacing.xxs,
  },
  seeAllPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  seeAllPillText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
