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

import { useAuth } from '@/core/auth/auth-context';
import { Screen } from '@/core/ui/Screen';
import { listMine } from '@/features/recipes/data/recipes.api';
import { Recipe } from '@/features/recipes/domain/recipe.types';

export function RecipesScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listMine();
      setRecipes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchRecipes();
    }
  }, [session]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <Pressable onPress={fetchRecipes} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </Pressable>
      </View>

      {isLoading ? <ActivityIndicator /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLoading && recipes.length === 0 ? (
        <Text style={styles.empty}>No recipes yet.</Text>
      ) : null}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/(app)/recipes/${item.id}`)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.cardSubtitle}>{item.description}</Text>
            ) : null}
            <Text style={styles.cardMeta}>Visibility: {item.visibility}</Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  refreshText: {
    color: '#fff',
    fontSize: 12,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  cardMeta: {
    marginTop: 6,
    color: '#9ca3af',
    fontSize: 12,
  },
  empty: {
    color: '#6b7280',
    marginTop: 12,
  },
  error: {
    color: '#dc2626',
    marginBottom: 8,
  },
});
