import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { RecipeCard } from "@/features/recipes/presentation/RecipeCard";
import { colors, spacing, typography } from "@/core/theme";
import type { Recipe } from "@/features/recipes/domain/recipe.types";

type MyRecipesSectionProps = Readonly<{
  recipes: Recipe[];
  onPressRecipe: (recipeId: string) => void;
  onPressScanCta: () => void;
}>;

/**
 * Hub section #1 of the Mes Recettes screen (Issue #740 Round 2).
 *
 * Lists the user's own recipes (private + scan-imported). When the
 * carnet is empty, surfaces the "Scanner ta 1ère bière" CTA wired to
 * the scan flow — Pattern A landing per the issue: a new user lands
 * on Mes recettes, sees an empty state, and the only forward action
 * is to scan a bottle to bootstrap their first recipe.
 */
export function MyRecipesSection({
  recipes,
  onPressRecipe,
  onPressScanCta,
}: MyRecipesSectionProps) {
  return (
    <View testID="hub-my-recipes-section" style={styles.container}>
      <Text style={styles.sectionTitle}>Mes recettes</Text>
      <Text style={styles.sectionSubtitle}>
        Ton carnet personnel — recettes brassées et imports scan.
      </Text>

      {recipes.length === 0 ? (
        <EmptyStateCard
          title="Aucune recette pour l'instant"
          description="Scanne ta 1ère bière pour démarrer ton carnet de brasseur."
          action={
            <PrimaryButton
              accessibilityLabel="Scanner ta 1ère bière"
              label="Scanner ta 1ère bière"
              onPress={onPressScanCta}
            />
          }
        />
      ) : (
        recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
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
    paddingBottom: spacing.sm,
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
    marginBottom: spacing.sm,
  },
});
