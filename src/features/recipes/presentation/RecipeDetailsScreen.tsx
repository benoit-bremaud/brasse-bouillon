import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Screen } from '@/core/ui/Screen';
import { listSteps, getMineById } from '@/features/recipes/data/recipes.api';
import { Recipe, RecipeStep } from '@/features/recipes/domain/recipe.types';
import { startBatch } from '@/features/batches/data/batches.api';

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
      setError('Missing recipe id.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [recipeData, stepData] = await Promise.all([
        getMineById(recipeId),
        listSteps(recipeId),
      ]);
      setRecipe(recipeData);
      setSteps(stepData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe');
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
      setError(err instanceof Error ? err.message : 'Failed to start batch');
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [recipeId]);

  return (
    <Screen>
      {isLoading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {recipe ? (
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.name}</Text>
          {recipe.description ? (
            <Text style={styles.subtitle}>{recipe.description}</Text>
          ) : null}
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          pressed && styles.primaryButtonPressed,
        ]}
        onPress={handleStartBatch}
        disabled={isStarting || isLoading}>
        <Text style={styles.primaryButtonText}>
          {isStarting ? 'Starting...' : 'Start batch'}
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Steps</Text>
      <FlatList
        data={steps}
        keyExtractor={(item) => `${item.recipeId}-${item.stepOrder}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>
              {item.stepOrder + 1}. {item.label}
            </Text>
            <Text style={styles.stepType}>{item.type}</Text>
            {item.description ? (
              <Text style={styles.stepDescription}>{item.description}</Text>
            ) : null}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 24,
  },
  stepCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  stepTitle: {
    fontWeight: '600',
  },
  stepType: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  stepDescription: {
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    marginBottom: 8,
  },
});
