import React from "react";
import { FlatList, RefreshControl, StyleSheet } from "react-native";

import { ListHeader } from "@/core/ui/ListHeader";
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
import { MyRecipesSectionHeader } from "@/features/recipes/presentation/sections/MyRecipesSection";
import { RecipeCard } from "@/features/recipes/presentation/RecipeCard";
import { getErrorMessage } from "@/core/http/http-error";
import type { Recipe } from "@/features/recipes/domain/recipe.types";

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
 *
 * Implementation note: the hub uses a single FlatList rather than a
 * ScrollView so the virtualization the previous flat list relied on
 * is preserved (Codex P2 review on PR #917). Mes recettes data drives
 * the FlatList rows, the section header sits in `ListHeaderComponent`,
 * and Découvrir (capped at 5 preview cards) sits in
 * `ListFooterComponent`.
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

  // Only show the full-screen spinner when *both* queries are still in
  // their first load and have nothing cached. As soon as either side
  // returns, render the hub so the user sees something immediately
  // instead of staying behind a single shared loader (Copilot review on
  // PR #917).
  const isFirstLoading =
    myRecipesQuery.isLoading &&
    myRecipes.length === 0 &&
    discoverQuery.isLoading &&
    discoverRecipes.length === 0;

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

      <FlatList
        testID="recipes-hub-list"
        data={myRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefetch} />
        }
        ListHeaderComponent={
          <MyRecipesSectionHeader
            isEmpty={myRecipes.length === 0}
            onPressScanCta={handleOpenScan}
          />
        }
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => handleOpenRecipe(item.id)} />
        )}
        ListFooterComponent={
          <DiscoverSection
            recipes={discoverRecipes}
            onPressRecipe={handleOpenRecipe}
            onPressSeeAll={handleOpenCatalog}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
