import { colors, radius, spacing, typography } from "@/core/theme";
import React, { useEffect, useState } from "react";
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
import { useRouter } from "expo-router";

export function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listRecipes();
      setRecipes(data);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load recipes"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const showEmptyState = !isLoading && recipes.length === 0;

  return (
    <Screen
      isLoading={isLoading && recipes.length === 0}
      error={error}
      onRetry={fetchRecipes}
    >
      <ListHeader
        title="My Recipes"
        subtitle="Tes recettes de brassage"
        action={
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push("../tools?sourceType=recipe")}
              style={styles.toolsButton}
            >
              <Text style={styles.toolsText}>Calculatrice</Text>
            </Pressable>
            <Pressable onPress={fetchRecipes} style={styles.refreshButton}>
              <Text style={styles.refreshText}>Refresh</Text>
            </Pressable>
          </View>
        }
      />

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucune recette pour le moment"
          description="Ajoute une recette côté API pour démarrer."
          action={
            <PrimaryButton label="Recharger la liste" onPress={fetchRecipes} />
          }
        />
      ) : null}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchRecipes} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(app)/recipes/${item.id}`)}>
            <Card style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Badge label={item.visibility} variant="info" />
              </View>
              {item.description ? (
                <Text style={styles.cardSubtitle}>{item.description}</Text>
              ) : null}
              <Text style={styles.cardMeta}>Voir les étapes →</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  toolsButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.primary,
  },
  toolsText: {
    color: colors.neutral.white,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  refreshButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.secondary,
  },
  refreshText: {
    color: colors.neutral.white,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  list: {
    paddingBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  cardSubtitle: {
    color: colors.neutral.textSecondary,
    marginTop: spacing.xs,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.regular,
  },
  cardMeta: {
    marginTop: spacing.sm,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.regular,
  },
});
