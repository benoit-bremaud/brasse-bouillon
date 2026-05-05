import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import { FlatList, RefreshControl, StyleSheet } from "react-native";
import { spacing } from "@/core/theme";

import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import React from "react";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { RecipeCard } from "@/features/recipes/presentation/RecipeCard";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { listPublicRecipes } from "@/features/recipes/application/recipes.use-cases";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

/**
 * Issue #779 — Recipe Catalog mini, KISS scope.
 *
 * Lists every PUBLIC recipe regardless of owner so a new user
 * (Léa, Nicolas) lands on a populated discovery surface instead of
 * an empty Mon Carnet. The full scope (filters BJCP, search by
 * sensory tags, difficulty enum, Featured + Surprise me, lineage
 * UI) is deferred to a follow-up issue — this PR ships only the
 * list view + tap-to-detail. The existing import flow (modal +
 * `importFromCommunity` use-case) remains the entry point on
 * RecipeDetailsScreen.
 */
export function CatalogScreen() {
  const bottomPadding = useNavigationFooterOffset();
  const router = useRouter();
  const {
    data: recipes = [],
    isLoading,
    isFetching,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<Recipe[]>({
    queryKey: ["recipes", "catalog"],
    queryFn: listPublicRecipes,
  });

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Failed to load the catalog")
    : null;
  const showEmptyState = isFetched && !isLoading && recipes.length === 0;
  const isRetryingWithError = isFetching && Boolean(queryError);

  const handleRefetch = () => {
    void refetch();
  };

  return (
    <Screen
      isLoading={(isLoading && recipes.length === 0) || isRetryingWithError}
      error={error}
      onRetry={handleRefetch}
    >
      <ListHeader
        title="Catalogue de recettes"
        subtitle="Découvre les recettes partagées par la communauté Brasse-Bouillon"
      />

      {showEmptyState ? (
        <EmptyStateCard
          title="Catalogue vide pour le moment"
          description="Les premières recettes publiques arriveront bientôt."
          action={<PrimaryButton label="Recharger" onPress={handleRefetch} />}
        />
      ) : null}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding }]}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefetch} />
        }
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            badgeLabel="Publique"
            onPress={() => router.push(`/(app)/recipes/${item.id}`)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.sm,
  },
});
