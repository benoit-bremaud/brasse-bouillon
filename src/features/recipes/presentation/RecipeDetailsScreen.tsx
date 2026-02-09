import {
  getRecipeDetails,
  listRecipeSteps,
} from "@/features/recipes/application/recipes.use-cases";
import { Recipe, RecipeStep } from "@/features/recipes/domain/recipe.types";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { startBatch } from "@/features/batches/application/batches.use-cases";
import { useRouter } from "expo-router";

type Props = {
  recipeId: string;
};

export function RecipeDetailsScreen({ recipeId }: Props) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [steps, setSteps] = useState<RecipeStep[]>([]);
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
      const [recipeData, stepData] = await Promise.all([
        getRecipeDetails(recipeId),
        listRecipeSteps(recipeId),
      ]);
      setRecipe(recipeData);
      setSteps(stepData);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load recipe"));
    } finally {
      setIsLoading(false);
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

  return (
    <Screen isLoading={isLoading} error={error} onRetry={fetchRecipe}>
      {recipe ? (
        <Card style={styles.headerCard}>
          <Text style={styles.title}>{recipe.name}</Text>
          {recipe.description ? (
            <Text style={styles.subtitle}>{recipe.description}</Text>
          ) : null}
        </Card>
      ) : null}

      <PrimaryButton
        label={isStarting ? "Starting..." : "Start batch"}
        onPress={handleStartBatch}
        disabled={isStarting || isLoading}
      />

      <Text style={styles.sectionTitle}>Steps</Text>
      <FlatList
        data={steps}
        keyExtractor={(item) => `${item.recipeId}-${item.stepOrder}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>
                {item.stepOrder + 1}. {item.label}
              </Text>
              <Text style={styles.stepType}>{item.type}</Text>
            </View>
            {item.description ? (
              <Text style={styles.stepDescription}>{item.description}</Text>
            ) : null}
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "700",
    color: "#111827",
  },
  list: {
    paddingBottom: 24,
  },
  stepCard: {
    marginBottom: 10,
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
