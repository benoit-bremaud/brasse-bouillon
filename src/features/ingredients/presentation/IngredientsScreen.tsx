import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import {
  IngredientCategorySummary,
  ingredientCategoryLabels,
} from "@/features/ingredients/domain/ingredient.types";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  getIngredientCategoryPageTitle,
  ingredientCategoryPresentationById,
} from "@/features/ingredients/presentation/ingredient-category.presentation";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { Ionicons } from "@expo/vector-icons";
import { ListHeader } from "@/core/ui/ListHeader";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { listIngredientCategoriesSummary } from "@/features/ingredients/application/ingredients.use-cases";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";

export function IngredientsScreen() {
  const router = useRouter();
  const {
    data: categories = [],
    isLoading,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<IngredientCategorySummary[]>({
    queryKey: ["ingredients", "categories-summary"],
    queryFn: listIngredientCategoriesSummary,
  });

  const error = queryError
    ? getErrorMessage(queryError, "Unable to load categories")
    : null;
  const showEmptyState = isFetched && !isLoading && categories.length === 0;

  return (
    <Screen
      isLoading={isLoading && categories.length === 0}
      error={error}
      onRetry={() => {
        void refetch();
      }}
    >
      <ListHeader title="Ingrédients" subtitle="Catalogue par catégorie" />

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucune catégorie disponible"
          description="Vérifiez la source de données et réessayez."
        />
      ) : null}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const presentation =
            ingredientCategoryPresentationById[item.category];
          const cardTitle = getIngredientCategoryPageTitle(item.category);

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir la catégorie ${ingredientCategoryLabels[item.category]}`}
              onPress={() =>
                router.push({
                  pathname: "/(app)/ingredients/[category]",
                  params: { category: item.category },
                })
              }
            >
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <View
                    style={[
                      styles.itemIcon,
                      { backgroundColor: presentation.iconColor + "25" },
                    ]}
                  >
                    <Ionicons
                      name={presentation.iconName}
                      size={24}
                      color={presentation.iconColor}
                    />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>{cardTitle}</Text>
                      <Badge label={`${item.count}`} variant="info" />
                    </View>
                    <Text style={styles.cardMeta}>
                      Explorer {ingredientCategoryLabels[item.category]}
                    </Text>
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
  itemIcon: {
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
  cardMeta: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
