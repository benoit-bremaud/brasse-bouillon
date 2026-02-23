import { colors, radius, spacing, typography } from "@/core/theme";
import { Href, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/core/auth/auth-context";
import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { Screen } from "@/core/ui/Screen";
import { listBatches } from "@/features/batches/application/batches.use-cases";
import { BatchSummary } from "@/features/batches/domain/batch.types";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { demoEquipments } from "@/mocks/demo-data";
import { Ionicons } from "@expo/vector-icons";

type QuickAction = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  href: Href;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "new-batch",
    label: "Nouveau brassin",
    icon: "cafe",
    color: colors.brand.primary,
    href: "/(app)/batches",
  },
  {
    id: "new-recipe",
    label: "Nouvelle recette",
    icon: "add-circle",
    color: colors.brand.secondary,
    href: "/(app)/recipes",
  },
  {
    id: "tools",
    label: "Outils",
    icon: "calculator",
    color: colors.semantic.info,
    href: "/(app)/tools",
  },
  {
    id: "academy",
    label: "Académie",
    icon: "school",
    color: colors.semantic.warning,
    href: "/(app)/tools",
  },
];

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
    () => recipes.filter((r) => r.visibility === "private").slice(0, 2),
    [recipes],
  );

  const publicFavorites = useMemo(
    () => recipes.filter((r) => r.visibility === "public").slice(0, 2),
    [recipes],
  );

  const activeBatches = useMemo(
    () => batches.filter((b) => b.status === "in_progress").slice(0, 3),
    [batches],
  );

  const stats = useMemo(
    () => ({
      privateRecipes: recipes.filter((r) => r.visibility === "private").length,
      publicRecipes: recipes.filter((r) => r.visibility === "public").length,
      activeBatches: batches.filter((b) => b.status === "in_progress").length,
      equipment: demoEquipments.length,
    }),
    [recipes, batches],
  );

  const displayName =
    session?.user.firstName ||
    session?.user.username ||
    session?.user.email?.split("@")[0] ||
    "Brasseur";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  return (
    <Screen isLoading={isLoading} error={error} onRetry={fetchData}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.heroName}>{displayName} ! 👋</Text>
            <Text style={styles.heroSubtext}>
              Prêt à brasser quelque chose de délicieux ?
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => router.push(action.href)}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: action.color + "20" },
                ]}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Pressable
            style={[
              styles.statCard,
              { backgroundColor: colors.brand.primary + "15" },
            ]}
            onPress={() => router.push("/(app)/recipes")}
          >
            <View style={styles.statHeader}>
              <Ionicons name="book" size={20} color={colors.brand.primary} />
              <Text style={styles.statValue}>{stats.privateRecipes}</Text>
            </View>
            <Text style={styles.statLabel}>Mes recettes</Text>
          </Pressable>

          <Pressable
            style={[
              styles.statCard,
              { backgroundColor: colors.brand.secondary + "15" },
            ]}
            onPress={() => router.push("/(app)/batches")}
          >
            <View style={styles.statHeader}>
              <Ionicons name="flask" size={20} color={colors.brand.secondary} />
              <Text style={styles.statValue}>{stats.activeBatches}</Text>
            </View>
            <Text style={styles.statLabel}>En fermentation</Text>
          </Pressable>

          <Pressable
            style={[
              styles.statCard,
              { backgroundColor: colors.semantic.info + "15" },
            ]}
            onPress={() => router.push("/(app)/explore")}
          >
            <View style={styles.statHeader}>
              <Ionicons name="globe" size={20} color={colors.semantic.info} />
              <Text style={styles.statValue}>{stats.publicRecipes}</Text>
            </View>
            <Text style={styles.statLabel}>Recettes publiques</Text>
          </Pressable>
        </View>

        {/* Active Batches */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="flask" size={18} color={colors.brand.secondary} />
              <Text style={styles.sectionTitle}>Brassins actifs</Text>
            </View>
            <Pressable onPress={() => router.push("/(app)/batches")}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </Pressable>
          </View>

          {activeBatches.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="beer" size={32} color={colors.neutral.muted} />
              <Text style={styles.emptyText}>Aucun brassin en cours</Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push("/(app)/batches")}
              >
                <Text style={styles.emptyButtonText}>Démarrer un brassin</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.batchesList}>
              {activeBatches.map((batch) => (
                <Pressable
                  key={batch.id}
                  style={styles.batchItem}
                  onPress={() => router.push(`/(app)/batches/${batch.id}`)}
                >
                  <View style={styles.batchIcon}>
                    <Ionicons
                      name="cafe"
                      size={20}
                      color={colors.brand.secondary}
                    />
                  </View>
                  <View style={styles.batchInfo}>
                    <Text style={styles.batchName}>
                      Brassin #{batch.id.slice(0, 6)}
                    </Text>
                    <Text style={styles.batchStep}>
                      {batch.currentStepOrder
                        ? `Étape ${batch.currentStepOrder}`
                        : "En attente"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          batch.status === "in_progress"
                            ? colors.semantic.success + "20"
                            : colors.neutral.muted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            batch.status === "in_progress"
                              ? colors.semantic.success
                              : colors.neutral.muted,
                        },
                      ]}
                    >
                      {batch.status === "in_progress" ? "Actif" : "Terminé"}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        {/* Private Recipes */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="lock-closed"
                size={18}
                color={colors.brand.primary}
              />
              <Text style={styles.sectionTitle}>Mes recettes</Text>
            </View>
            <Pressable onPress={() => router.push("/(app)/recipes")}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </Pressable>
          </View>

          {privateRecipes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text"
                size={32}
                color={colors.neutral.muted}
              />
              <Text style={styles.emptyText}>Pas encore de recettes</Text>
              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push("/(app)/recipes")}
              >
                <Text style={styles.emptyButtonText}>Créer une recette</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.recipesGrid}>
              {privateRecipes.map((recipe) => (
                <Pressable
                  key={recipe.id}
                  style={({ pressed }) => [
                    styles.recipeCard,
                    pressed && styles.recipeCardPressed,
                  ]}
                  onPress={() => router.push(`/(app)/recipes/${recipe.id}`)}
                >
                  <View style={styles.recipeIcon}>
                    <Ionicons
                      name="beer"
                      size={24}
                      color={colors.brand.primary}
                    />
                  </View>
                  <Text style={styles.recipeName} numberOfLines={1}>
                    {recipe.name}
                  </Text>
                  <Text style={styles.recipeMeta}>Recette privée</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        {/* Public Favorites */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="globe" size={18} color={colors.semantic.info} />
              <Text style={styles.sectionTitle}>À découvrir</Text>
            </View>
            <Pressable onPress={() => router.push("/(app)/explore")}>
              <Text style={styles.seeAll}>Explorer</Text>
            </Pressable>
          </View>

          {publicFavorites.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="compass" size={32} color={colors.neutral.muted} />
              <Text style={styles.emptyText}>
                Explorez les recettes publiques
              </Text>
            </View>
          ) : (
            <View style={styles.recipesGrid}>
              {publicFavorites.map((recipe) => (
                <Pressable
                  key={recipe.id}
                  style={({ pressed }) => [
                    styles.recipeCard,
                    pressed && styles.recipeCardPressed,
                  ]}
                  onPress={() => router.push(`/(app)/recipes/${recipe.id}`)}
                >
                  <View
                    style={[
                      styles.recipeIcon,
                      { backgroundColor: colors.semantic.info + "15" },
                    ]}
                  >
                    <Ionicons
                      name="beer"
                      size={24}
                      color={colors.semantic.info}
                    />
                  </View>
                  <Text style={styles.recipeName} numberOfLines={1}>
                    {recipe.name}
                  </Text>
                  <Text style={styles.recipeMeta}>Recette publique</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Card>

        {/* Equipment Summary */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons
                name="construct"
                size={18}
                color={colors.semantic.warning}
              />
              <Text style={styles.sectionTitle}>Mon équipement</Text>
            </View>
            <Pressable onPress={() => router.push("/(app)/equipment")}>
              <Text style={styles.seeAll}>Gérer</Text>
            </Pressable>
          </View>
          <View style={styles.equipmentSummary}>
            <View style={styles.equipmentIcon}>
              <Ionicons
                name="server"
                size={24}
                color={colors.semantic.warning}
              />
            </View>
            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentText}>
                {stats.equipment} équipements configurés
              </Text>
              <Text style={styles.equipmentSubtext}>Prêt à brasser</Text>
            </View>
          </View>
        </Card>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={18} color={colors.semantic.error} />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
    paddingTop: 0,
  },
  hero: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  heroContent: {
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: typography.size.h2,
    color: colors.neutral.white,
    opacity: 0.9,
  },
  heroName: {
    fontSize: typography.size.h1,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
    marginTop: spacing.xxs,
  },
  heroSubtext: {
    fontSize: typography.size.body,
    color: colors.neutral.white,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  actionCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statValue: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  statLabel: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
  sectionCard: {
    marginHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  seeAll: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    color: colors.brand.secondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  emptyText: {
    fontSize: typography.size.label,
    color: colors.neutral.muted,
    marginTop: spacing.xs,
  },
  emptyButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.brand.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  emptyButtonText: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    color: colors.neutral.white,
  },
  batchesList: {
    gap: spacing.xs,
  },
  batchItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  batchIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.brand.secondary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  batchInfo: {
    flex: 1,
  },
  batchName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  batchStep: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.weight.medium,
  },
  recipesGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  recipeCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  recipeCardPressed: {
    opacity: 0.8,
  },
  recipeIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  recipeName: {
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    textAlign: "center",
  },
  recipeMeta: {
    fontSize: 10,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  equipmentSummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  equipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.semantic.warning + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentText: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  equipmentSubtext: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    marginHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  logoutText: {
    fontSize: typography.size.label,
    color: colors.semantic.error,
  },
});
