import { useNavigationFooterOffset } from "@/core/ui/NavigationFooter";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import React from "react";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { getSrmColor } from "@/features/tools/data/catalogs/srm";
import { listPublicRecipes } from "@/features/recipes/application/recipes.use-cases";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

const ebcToSrm = (ebc: number): number => ebc * 0.508;

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
        renderItem={({ item }) => {
          const stats = item.stats;
          const ebc = stats?.colorEbc ?? 10;
          const srm = ebcToSrm(ebc);
          const beerColor = getSrmColor(srm);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir la recette ${item.name}`}
              onPress={() => router.push(`/(app)/recipes/${item.id}`)}
            >
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <View
                    style={[styles.recipeIcon, { backgroundColor: beerColor }]}
                  >
                    <Ionicons
                      name="document-text"
                      size={24}
                      color={colors.neutral.white}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Badge label="Public" variant="success" />
                    </View>
                    {stats && (
                      <View style={styles.statsRow}>
                        <Text style={styles.statItem}>{stats.ibu} IBU</Text>
                        <Text style={styles.statDivider}>•</Text>
                        <Text style={styles.statItem}>{stats.abv}% ABV</Text>
                        <Text style={styles.statDivider}>•</Text>
                        <Text style={styles.statItem}>
                          {stats.volumeLiters}L
                        </Text>
                      </View>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.neutral.muted}
                  />
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  recipeIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxs,
  },
  statItem: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
  },
  statDivider: {
    marginHorizontal: spacing.xs,
    color: colors.neutral.muted,
  },
});
