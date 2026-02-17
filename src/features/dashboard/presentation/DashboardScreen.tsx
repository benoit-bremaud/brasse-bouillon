import { colors, radius, spacing, typography } from "@/core/theme";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { listBatches } from "@/features/batches/application/batches.use-cases";
import { BatchSummary } from "@/features/batches/domain/batch.types";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { demoEquipments } from "@/mocks/demo-data";
import { useRouter } from "expo-router";

const dashboardNavigationLinks = [
  { label: "Ingrédients", href: "/(app)/ingredients" },
  { label: "Académie", href: "/(app)/tools" },
] as const;

export function DashboardScreen() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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
      setError(getErrorMessage(err, "Impossible de charger le dashboard"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/(auth)/login");
  }, [logout, router]);

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

  const privateRecipesCount = useMemo(
    () => recipes.filter((recipe) => recipe.visibility === "private").length,
    [recipes],
  );

  const publicRecipesCount = useMemo(
    () => recipes.filter((recipe) => recipe.visibility === "public").length,
    [recipes],
  );

  const activeBatchesCount = useMemo(
    () => batches.filter((batch) => batch.status === "in_progress").length,
    [batches],
  );

  const displayName =
    session?.user.firstName ||
    session?.user.username ||
    session?.user.email ||
    "Brasseur";

  return (
    <Screen isLoading={isLoading} error={error} onRetry={fetchData}>
      <ListHeader
        title="Tableau de bord"
        subtitle={`Bon retour, ${displayName}`}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.brandCard}>
          <Text style={styles.brandTitle}>Brasse Bouillon</Text>
          <Text style={styles.brandSubtitle}>Ton cockpit de brassage</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{privateRecipesCount}</Text>
              <Text style={styles.metricLabel}>Recettes privées</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{publicRecipesCount}</Text>
              <Text style={styles.metricLabel}>Recettes publiques</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{activeBatchesCount}</Text>
              <Text style={styles.metricLabel}>Brassins en cours</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{demoEquipments.length}</Text>
              <Text style={styles.metricLabel}>Équipements</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brassins en cours</Text>
            <Pressable
              onPress={() => router.push("/(app)/batches")}
              accessibilityRole="button"
              accessibilityLabel="Voir tous les brassins"
            >
              <Text style={styles.link}>Voir tout</Text>
            </Pressable>
          </View>
          {activeBatches.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucun brassin actif actuellement.
            </Text>
          ) : (
            activeBatches.map((batch) => (
              <Pressable
                key={batch.id}
                style={styles.row}
                onPress={() => router.push(`/(app)/batches/${batch.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir le brassin ${batch.id.slice(0, 6)}`}
              >
                <Text style={styles.rowTitle}>
                  Brassin #{batch.id.slice(0, 6)}
                </Text>
                <Text style={styles.rowMeta}>
                  Étape active : {batch.currentStepOrder ?? "à venir"}
                </Text>
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mes recettes privées</Text>
            <Pressable
              onPress={() => router.push("/(app)/recipes")}
              accessibilityRole="button"
              accessibilityLabel="Voir toutes mes recettes privées"
            >
              <Text style={styles.link}>Voir tout</Text>
            </Pressable>
          </View>
          {privateRecipes.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucune recette privée pour le moment.
            </Text>
          ) : (
            privateRecipes.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={styles.row}
                onPress={() => router.push(`/(app)/recipes/${recipe.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir la recette ${recipe.name}`}
              >
                <Text style={styles.rowTitle}>{recipe.name}</Text>
                <Text style={styles.rowMeta}>Ouvrir</Text>
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Recettes publiques favorites
            </Text>
            <Pressable
              onPress={() => router.push("/(app)/explore")}
              accessibilityRole="button"
              accessibilityLabel="Explorer les recettes publiques"
            >
              <Text style={styles.link}>Explorer</Text>
            </Pressable>
          </View>
          {publicFavorites.length === 0 ? (
            <Text style={styles.emptyText}>
              Aucune recette publique favorite pour le moment.
            </Text>
          ) : (
            publicFavorites.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={styles.row}
                onPress={() => router.push(`/(app)/recipes/${recipe.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir la recette publique ${recipe.name}`}
              >
                <Text style={styles.rowTitle}>{recipe.name}</Text>
                <Text style={styles.rowMeta}>Publique</Text>
              </Pressable>
            ))
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Équipement</Text>
            <Pressable
              onPress={() => router.push("/(app)/equipment")}
              accessibilityRole="button"
              accessibilityLabel="Gérer les équipements"
            >
              <Text style={styles.link}>Gérer</Text>
            </Pressable>
          </View>
          <Text style={styles.meta}>
            {demoEquipments.length} équipements disponibles
          </Text>
          <Text style={styles.meta}>
            Prêts à brasser : {demoEquipments.length}
          </Text>
        </Card>

        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profil</Text>
            <Pressable
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Se déconnecter"
            >
              <Text style={styles.logoutLink}>Se déconnecter</Text>
            </Pressable>
          </View>
          <Text style={styles.meta}>Email : {session?.user.email ?? "-"}</Text>
          <Text style={styles.meta}>Rôle : {session?.user.role ?? "user"}</Text>
          <Text style={styles.meta}>
            Statut du compte : {session?.user.isActive ? "Actif" : "Inactif"}
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Accès complémentaires</Text>
          <View style={styles.quickActions}>
            {dashboardNavigationLinks.map((destination) => (
              <Pressable
                key={destination.href}
                style={styles.actionButton}
                onPress={() => router.push(destination.href)}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir l'écran ${destination.label}`}
              >
                <Text style={styles.actionText}>{destination.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
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
  metricsGrid: {
    marginTop: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  metricCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.neutral.white,
  },
  metricValue: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
  },
  metricLabel: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  brandCard: {
    marginBottom: spacing.sm,
    alignItems: "center",
  },
  brandTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  brandSubtitle: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
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
  logoutLink: {
    color: colors.semantic.error,
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
    width: "48%",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  actionText: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
});
