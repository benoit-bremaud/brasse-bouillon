import { colors, radius, spacing, typography } from "@/core/theme";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { listBatches } from "@/features/batches/application/batches.use-cases";
import { BatchSummary } from "@/features/batches/domain/batch.types";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { demoEquipments } from "@/mocks/demo-data";
import { useRouter } from "expo-router";

export function DashboardScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [recipeData, batchData] = await Promise.all([
        listRecipes(),
        listBatches(),
      ]);
      setRecipes(recipeData);
      setBatches(batchData);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load dashboard"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const privateRecipes = useMemo(
    () =>
      recipes.filter((recipe) => recipe.visibility === "private").slice(0, 3),
    [recipes],
  );

  const publicFavorites = useMemo(
    () =>
      recipes.filter((recipe) => recipe.visibility === "public").slice(0, 3),
    [recipes],
  );

  const activeBatches = useMemo(
    () => batches.filter((batch) => batch.status === "in_progress").slice(0, 3),
    [batches],
  );

  const displayName =
    session?.user.firstName ||
    session?.user.username ||
    session?.user.email ||
    "Brewer";

  return (
    <Screen isLoading={isLoading} error={error} onRetry={fetchData}>
      <ListHeader title="Dashboard" subtitle={`Welcome back, ${displayName}`} />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Text style={styles.meta}>Email: {session?.user.email ?? "-"}</Text>
          <Text style={styles.meta}>Role: {session?.user.role ?? "user"}</Text>
          <Text style={styles.meta}>
            Account status: {session?.user.isActive ? "Active" : "Inactive"}
          </Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My private recipes</Text>
            <Pressable onPress={() => router.push("/(app)/recipes")}>
              <Text style={styles.link}>See all</Text>
            </Pressable>
          </View>
          {privateRecipes.length === 0 ? (
            <Text style={styles.emptyText}>No private recipes yet.</Text>
          ) : (
            privateRecipes.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={styles.row}
                onPress={() => router.push(`/(app)/recipes/${recipe.id}`)}
              >
                <Text style={styles.rowTitle}>{recipe.name}</Text>
                <Text style={styles.rowMeta}>Open</Text>
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite public recipes</Text>
            <Pressable onPress={() => router.push("/(app)/explore")}>
              <Text style={styles.link}>Explore</Text>
            </Pressable>
          </View>
          {publicFavorites.length === 0 ? (
            <Text style={styles.emptyText}>No public favorites yet.</Text>
          ) : (
            publicFavorites.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={styles.row}
                onPress={() => router.push(`/(app)/recipes/${recipe.id}`)}
              >
                <Text style={styles.rowTitle}>{recipe.name}</Text>
                <Text style={styles.rowMeta}>Public</Text>
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active batches</Text>
            <Pressable onPress={() => router.push("/(app)/batches")}>
              <Text style={styles.link}>See all</Text>
            </Pressable>
          </View>
          {activeBatches.length === 0 ? (
            <Text style={styles.emptyText}>No active batch right now.</Text>
          ) : (
            activeBatches.map((batch) => (
              <Pressable
                key={batch.id}
                style={styles.row}
                onPress={() => router.push(`/(app)/batches/${batch.id}`)}
              >
                <Text style={styles.rowTitle}>
                  Batch {batch.id.slice(0, 8)}
                </Text>
                <Text style={styles.rowMeta}>
                  Step {batch.currentStepOrder ?? "-"}
                </Text>
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Equipment</Text>
            <Pressable onPress={() => router.push("/(app)/equipment")}>
              <Text style={styles.link}>Manage</Text>
            </Pressable>
          </View>
          <Text style={styles.meta}>
            {demoEquipments.length} equipment items available
          </Text>
          <Text style={styles.meta}>
            Ready to brew: {demoEquipments.length}
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.quickActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push("/(app)/recipes")}
            >
              <Text style={styles.actionText}>My recipes</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push("/(app)/batches")}
            >
              <Text style={styles.actionText}>My batches</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push("/(app)/tools")}
            >
              <Text style={styles.actionText}>Calculator</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push("/(app)/ingredients")}
            >
              <Text style={styles.actionText}>Ingredients</Text>
            </Pressable>
          </View>
        </Card>

        <EmptyStateCard
          title="Notifications center (soon)"
          description="For high-priority batch alerts, we will add a dedicated notifications screen with quick auth access in a next iteration."
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  link: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  meta: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  row: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral.border,
    paddingVertical: spacing.xs,
  },
  rowTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  rowMeta: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  actionButton: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
