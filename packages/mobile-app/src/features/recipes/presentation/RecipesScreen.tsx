import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import React from "react";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { RecipeCard } from "@/features/recipes/presentation/RecipeCard";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export function RecipesScreen() {
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
    queryKey: ["recipes", "list"],
    queryFn: listRecipes,
  });

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Failed to load recipes")
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
        title="My Recipes"
        subtitle="Tes recettes de brassage"
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir le catalogue de recettes"
            style={styles.catalogLink}
            onPress={() => router.push("/(app)/recipes/catalog")}
          >
            <Ionicons
              name="library-outline"
              size={16}
              color={colors.brand.secondary}
            />
            <Text style={styles.catalogLinkText}>Catalogue</Text>
          </Pressable>
        }
      />

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucune recette"
          description="Découvre les recettes partagées par la communauté pour démarrer ton carnet."
          action={
            <PrimaryButton
              accessibilityLabel="Découvrir le catalogue de recettes"
              label="Découvrir le catalogue"
              onPress={() => router.push("/(app)/recipes/catalog")}
            />
          }
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
            onPress={() => router.push(`/(app)/recipes/${item.id}`)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  catalogLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  catalogLinkText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  list: {
    paddingHorizontal: spacing.sm,
  },
});
