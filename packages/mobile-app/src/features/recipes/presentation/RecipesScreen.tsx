import React from "react";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";

import { ListHeader } from "@/core/ui/ListHeader";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { Screen } from "@/core/ui/Screen";
import { spacing } from "@/core/theme";
import {
  listPublicRecipes,
  listRecipes,
} from "@/features/recipes/application/recipes.use-cases";
import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

import { DiscoverSection } from "@/features/recipes/presentation/sections/DiscoverSection";
import { MyRecipesSection } from "@/features/recipes/presentation/sections/MyRecipesSection";
import { getErrorMessage } from "@/core/http/http-error";

/**
 * Mes Recettes Hub — Issue #740 Round 2 (v0.1 demo scope).
 *
 * Replaces the previous flat "My Recipes" list with a 2-section hub:
 *
 * - Mes recettes (the user's carnet — perso + scan-imported); when
 *   empty, surfaces the "Scanner ta 1ère bière" CTA wired to the
 *   scan flow (Pattern A landing per the issue).
 * - Découvrir (top 5 of `listPublicRecipes`); a "Voir tout" pill
 *   links to the full CatalogScreen.
 *
 * Stats / Brouillons / Favoris / Tutoriels sections are explicitly
 * deferred to v0.2 per the issue's section tier table.
 */
export function RecipesScreen() {
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();

  const myRecipesQuery = useQuery<Recipe[]>({
    queryKey: ["recipes", "list"],
    queryFn: listRecipes,
  });

  const discoverQuery = useQuery<Recipe[]>({
    queryKey: ["recipes", "catalog"],
    queryFn: listPublicRecipes,
  });

  const myRecipes = myRecipesQuery.data ?? [];
  const discoverRecipes = discoverQuery.data ?? [];

  const isFirstLoading =
    (myRecipesQuery.isLoading && myRecipes.length === 0) ||
    (discoverQuery.isLoading && discoverRecipes.length === 0);

  const queryError = myRecipesQuery.error ?? discoverQuery.error;
  const isFetching = myRecipesQuery.isFetching || discoverQuery.isFetching;

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Impossible de charger les recettes")
    : null;

  const handleRefetch = () => {
    void myRecipesQuery.refetch();
    void discoverQuery.refetch();
  };

  const handleOpenRecipe = (recipeId: string) => {
    router.push(`/(app)/recipes/${recipeId}`);
  };

  const handleOpenScan = () => {
    router.push("/(app)/dashboard/scan");
  };

  const handleOpenCatalog = () => {
    router.push("/(app)/recipes/catalog");
  };

  return (
    <Screen isLoading={isFirstLoading} error={error} onRetry={handleRefetch}>
      <ListHeader
        title="Mes Recettes"
        subtitle="Ton hub de recettes de brassage"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefetch} />
        }
      >
        <MyRecipesSection
          recipes={myRecipes}
          onPressRecipe={handleOpenRecipe}
          onPressScanCta={handleOpenScan}
        />

        <DiscoverSection
          recipes={discoverRecipes}
          onPressRecipe={handleOpenRecipe}
          onPressSeeAll={handleOpenCatalog}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.xs,
  },
});
