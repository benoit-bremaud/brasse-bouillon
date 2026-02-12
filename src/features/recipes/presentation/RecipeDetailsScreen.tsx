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
            {ingredients.map((item) => (
              <Pressable
                key={item.ingredientId}
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
    paddingBottom: 24,
  },
  headerCard: {
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  statItem: {
    width: "31%",
    minWidth: 90,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  statLabel: {
    color: "#6b7280",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  statValue: {
    marginTop: 4,
    color: "#111827",
    fontWeight: "700",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "700",
    color: "#111827",
  },
  sectionCard: {
    marginBottom: 4,
  },
  emptyText: {
    color: "#6b7280",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  listItemMain: {
    flex: 1,
    paddingRight: 8,
  },
  listItemTitle: {
    fontWeight: "600",
    color: "#111827",
  },
  listItemMeta: {
    marginTop: 2,
    color: "#4b5563",
    fontSize: 12,
  },
  listItemNotes: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 12,
  },
  chevron: {
    color: "#9ca3af",
    fontSize: 20,
    lineHeight: 20,
    marginLeft: 8,
  },
  stepRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTitle: {
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  stepType: {
    color: "#4b5563",
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "700",
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepDescription: {
    marginTop: 10,
    color: "#4b5563",
  },
});
