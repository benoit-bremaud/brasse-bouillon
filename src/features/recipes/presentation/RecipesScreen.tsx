import { colors, radius, spacing, typography } from "@/core/theme";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { getSrmColor } from "@/features/tools/data/catalogs/srm";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";

const ebcToSrm = (ebc: number): number => ebc * 0.508;

const getVisibilityLabel = (visibility: Recipe["visibility"]): string => {
  const labels: Record<Recipe["visibility"], string> = {
    public: "Public",
    private: "Private",
    unlisted: "Unlisted",
  };
  return labels[visibility];
};

const getVisibilityVariant = (
  visibility: Recipe["visibility"],
): "success" | "info" => {
  if (visibility === "public") return "success";
  return "info";
};

export function RecipesScreen() {
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
      <View style={styles.header}>
        <ListHeader title="My Recipes" subtitle="Tes recettes de brassage" />
        <Pressable
          onPress={() => router.push("/(app)/academy")}
          style={styles.academyButton}
        >
          <Ionicons
            name="school-outline"
            size={18}
            color={colors.brand.secondary}
          />
          <Text style={styles.academyText}>Academy</Text>
        </Pressable>
      </View>

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucune recette"
          description="Ajoute une recette pour démarrer."
          action={<PrimaryButton label="Recharger" onPress={handleRefetch} />}
        />
      ) : null}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={handleRefetch} />
        }
        renderItem={({ item }) => {
          const stats = item.stats;
          const ebc = stats?.colorEbc ?? 10;
          const srm = ebcToSrm(ebc);
          const beerColor = getSrmColor(srm);

          return (
            <Pressable onPress={() => router.push(`/(app)/recipes/${item.id}`)}>
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
                      <Badge
                        label={getVisibilityLabel(item.visibility)}
                        variant={getVisibilityVariant(item.visibility)}
                      />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  academyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.brand.background,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
  },
  academyText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  list: {
    paddingBottom: spacing.md,
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
