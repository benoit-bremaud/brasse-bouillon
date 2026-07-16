import React from "react";
import { RefreshControl, StyleSheet } from "react-native";

import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { spacing } from "@/core/theme";
import {
  listPublicRecipes,
  listRecipes,
} from "@/features/recipes/application/recipes.use-cases";
import { ScreenFlatList } from "@/core/ui/ScreenFlatList";
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

  // Per-query error suppression: each query only suppresses its own
  // error while it's actively refetching. A failed `listRecipes` is
  // surfaced even if `listPublicRecipes` is still in flight, and vice
  // versa (Copilot review on PR #917 — the previous combined
  // `isFetching` check could mask one query's failure behind the
  // other's loading state).
  const error = pickQueryError([myRecipesQuery, discoverQuery]);

  const isFetching = myRecipesQuery.isFetching || discoverQuery.isFetching;

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
        title="Recettes"
        subtitle="Mon carnet et les recettes de la communauté"
      />

      <ScreenFlatList
        testID="recipes-hub-list"
        data={myRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefetch} />
        }
        ListHeaderComponent={
          <MyRecipesSectionHeader
            isEmpty={myRecipes.length === 0}
            isLoading={myRecipesQuery.isLoading}
            onPressScanCta={handleOpenScan}
          />
        }
        renderItem={({ item }) => (
          <RecipeCard recipe={item} onPress={() => handleOpenRecipe(item.id)} />
        )}
        ListFooterComponent={
          <DiscoverSection
            recipes={discoverRecipes}
            isLoading={discoverQuery.isLoading}
            onPressRecipe={handleOpenRecipe}
            onPressSeeAll={handleOpenCatalog}
          />
        }
      />
    </Screen>
  );
}

type QueryWithError = Readonly<{
  error: Error | null;
  isFetching: boolean;
}>;

/**
 * Returns the human-readable message of the first query in the list
 * that has a settled error (i.e. not currently re-fetching). Returns
 * `null` if no query has a surfaced error. Encodes the per-query
 * error-suppression rule called out in the Copilot review on
 * PR #917.
 */
function pickQueryError(queries: ReadonlyArray<QueryWithError>): string | null {
  for (const query of queries) {
    if (query.error && !query.isFetching) {
      return getErrorMessage(query.error, "Impossible de charger les recettes");
    }
  }
  return null;
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});
