import { colors, radius, spacing, typography } from "@/core/theme";
import {
  IngredientCategorySummary,
  IngredientCategory,
  ingredientCategoryLabels,
} from "@/features/ingredients/domain/ingredient.types";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { listIngredientCategoriesSummary } from "@/features/ingredients/application/ingredients.use-cases";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const categoryIcons: Record<
  IngredientCategory,
  keyof typeof Ionicons.glyphMap
> = {
  malt: "nutrition-outline",
  hop: "leaf-outline",
  yeast: "flask-outline",
};

const categoryIconColors: Record<IngredientCategory, string> = {
  malt: colors.brand.primary,
  hop: colors.semantic.success,
  yeast: colors.brand.secondary,
};

export function IngredientsScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<IngredientCategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listIngredientCategoriesSummary();
      setCategories(data);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load categories"));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showEmptyState = hasFetched && !isLoading && categories.length === 0;

  return (
    <Screen
      isLoading={isLoading && categories.length === 0}
      error={error}
      onRetry={fetchCategories}
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
          const iconName = categoryIcons[item.category];
          const iconColor = categoryIconColors[item.category];

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
                      { backgroundColor: iconColor + "25" },
                    ]}
                  >
                    <Ionicons name={iconName} size={24} color={iconColor} />
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardTitle}>
                        {ingredientCategoryLabels[item.category]}
                      </Text>
                      <Badge label={`${item.count}`} variant="info" />
                    </View>
                    <Text style={styles.cardMeta}>
                      Explorer la liste et les filtres
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
