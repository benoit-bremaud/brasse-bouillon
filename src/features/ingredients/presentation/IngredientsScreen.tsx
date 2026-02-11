import { colors, typography } from "@/core/theme";
import {
  IngredientCategorySummary,
  ingredientCategoryLabels,
} from "@/features/ingredients/domain/ingredient.types";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { listIngredientCategoriesSummary } from "@/features/ingredients/application/ingredients.use-cases";
import { useRouter } from "expo-router";

export function IngredientsScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<IngredientCategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listIngredientCategoriesSummary();
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de charger les catégories"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showEmptyState = !isLoading && categories.length === 0;

  return (
    <Screen
      isLoading={isLoading && categories.length === 0}
      error={error}
      onRetry={fetchCategories}
    >
      <ListHeader
        title="Ingredients"
        subtitle="Choose a category to explore the catalog"
      />

      {showEmptyState ? (
        <EmptyStateCard
          title="No categories available"
          description="Check the data source and try again."
        />
      ) : null}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.category}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/ingredients/[category]",
                params: { category: item.category },
              })
            }
          >
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {ingredientCategoryLabels[item.category]}
                </Text>
                <Text style={styles.count}>{item.count}</Text>
              </View>
              <Text style={styles.meta}>Open list and filters →</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  count: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.medium,
  },
  meta: {
    marginTop: 8,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
