import { colors, radius, spacing, typography } from "@/core/theme";
import {
  RecipeDetailsViewModel,
  getRecipeDetailsViewModel,
} from "@/features/recipes/application/recipes.use-cases";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { startBatch } from "@/features/batches/application/batches.use-cases";
import { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";
import { useRouter } from "expo-router";

type Props = {
  recipeId: string;
};

export function RecipeDetailsScreen({ recipeId }: Props) {
  const router = useRouter();
  const [viewModel, setViewModel] = useState<RecipeDetailsViewModel | null>(
    null,
  );
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipe = async () => {
    if (!recipeId) {
      setError("Missing recipe id.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRecipeDetailsViewModel(recipeId);
      setViewModel(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load recipe"));
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  };

  const handleStartBatch = async () => {
    if (!recipeId) {
      return;
    }
    setIsStarting(true);
    try {
      const batch = await startBatch(recipeId);
      router.push(`/(app)/batches/${batch.id}`);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to start batch"));
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  if (hasFetched && !isLoading && !viewModel && !error) {
    return (
      <Screen>
        <EmptyStateCard
          title="Recipe not found"
          description="This recipe could not be loaded."
        />
      </Screen>
    );
  }

  const recipe = viewModel?.recipe;
  const stats = recipe?.stats;
  const ingredients = viewModel?.ingredients ?? [];
  const equipment = viewModel?.equipment ?? [];
  const steps = viewModel?.steps ?? [];

  const formatQuantity = (amount: number, unit: string) => {
    const normalizedAmount = Number.isInteger(amount)
      ? amount
      : Number(amount.toFixed(2));
    return `${normalizedAmount} ${unit}`;
  };

  const navigateToIngredient = (
    category: IngredientCategory,
    ingredientId: string,
  ) => {
    router.push(`/(app)/ingredients/${category}/${ingredientId}`);
  };

  return (
    <Screen isLoading={isLoading} error={error} onRetry={fetchRecipe}>
      <ScrollView contentContainerStyle={styles.content}>
        {recipe ? (
          <Card style={styles.headerCard}>
            <Text style={styles.title}>{recipe.name}</Text>
            {recipe.description ? (
              <Text style={styles.subtitle}>{recipe.description}</Text>
            ) : null}

            {stats ? (
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>IBU</Text>
                  <Text style={styles.statValue}>{stats.ibu}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>ABV</Text>
                  <Text style={styles.statValue}>{stats.abv}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>OG</Text>
                  <Text style={styles.statValue}>{stats.og}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>FG</Text>
                  <Text style={styles.statValue}>{stats.fg}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Volume</Text>
                  <Text style={styles.statValue}>{stats.volumeLiters} L</Text>
                </View>
              </View>
            ) : null}
          </Card>
        ) : null}

        <Text style={styles.sectionTitle}>Ingredients</Text>
        {ingredients.length === 0 ? (
          <Card style={styles.sectionCard}>
            <Text style={styles.emptyText}>
              No ingredients listed for this recipe.
            </Text>
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            {ingredients.map((item, index) => (
              <Pressable
                key={`${item.ingredientId}-${item.timing ?? "no-timing"}-${item.amount}-${item.unit}-${index}`}
                style={styles.listItem}
                disabled={!item.ingredient}
                onPress={() => {
                  if (item.ingredient) {
                    navigateToIngredient(
                      item.ingredient.category,
                      item.ingredient.id,
                    );
                  }
                }}
              >
                <View style={styles.listItemMain}>
                  <Text style={styles.listItemTitle}>
                    {item.ingredient?.name ?? "Unknown ingredient"}
                  </Text>
                  <Text style={styles.listItemMeta}>
                    {formatQuantity(item.amount, item.unit)}
                    {item.timing ? ` • ${item.timing}` : ""}
                  </Text>
                  {item.notes ? (
                    <Text style={styles.listItemNotes}>{item.notes}</Text>
                  ) : null}
                </View>
                {item.ingredient ? <Text style={styles.chevron}>›</Text> : null}
              </Pressable>
            ))}
          </Card>
        )}

        <Text style={styles.sectionTitle}>Equipment</Text>
        {equipment.length === 0 ? (
          <Card style={styles.sectionCard}>
            <Text style={styles.emptyText}>
              No equipment listed for this recipe.
            </Text>
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            {equipment.map((item) => (
              <View key={item.equipmentId} style={styles.listItem}>
                <View style={styles.listItemMain}>
                  <Text style={styles.listItemTitle}>
                    {item.equipment?.name ?? "Unknown equipment"}
                  </Text>
                  <Text style={styles.listItemMeta}>
                    {item.role ?? item.equipment?.type ?? "General"}
                  </Text>
                  {item.notes ? (
                    <Text style={styles.listItemNotes}>{item.notes}</Text>
                  ) : null}
                </View>
              </View>
            ))}
          </Card>
        )}

        <Text style={styles.sectionTitle}>Steps preview</Text>
        {steps.length === 0 ? (
          <Card style={styles.sectionCard}>
            <Text style={styles.emptyText}>
              No steps are available for this recipe.
            </Text>
          </Card>
        ) : (
          <Card style={styles.sectionCard}>
            {steps.map((item) => (
              <View
                key={`${item.recipeId}-${item.stepOrder}`}
                style={styles.stepRow}
              >
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>
                    {item.stepOrder + 1}. {item.label}
                  </Text>
                  <Text style={styles.stepType}>{item.type}</Text>
                </View>
                {item.description ? (
                  <Text style={styles.stepDescription}>{item.description}</Text>
                ) : null}
              </View>
            ))}
          </Card>
        )}

        <PrimaryButton
          label={isStarting ? "Starting..." : "Start Batch"}
          onPress={handleStartBatch}
          disabled={isStarting || isLoading || !recipe}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  headerCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  statItem: {
    width: "31%",
    minWidth: 90,
    backgroundColor: colors.brand.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textTransform: "uppercase",
    fontWeight: typography.weight.bold,
  },
  statValue: {
    marginTop: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  sectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  sectionCard: {
    marginBottom: spacing.xxs,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  listItemMain: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  listItemTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  listItemMeta: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  listItemNotes: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  chevron: {
    color: colors.neutral.muted,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    marginLeft: spacing.xs,
  },
  stepRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  stepType: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textTransform: "uppercase",
    fontWeight: typography.weight.bold,
    backgroundColor: colors.brand.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  stepDescription: {
    marginTop: spacing.sm,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
