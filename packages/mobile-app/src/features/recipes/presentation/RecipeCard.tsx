import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { getSrmColor } from "@/features/tools/data/catalogs/srm";

const ebcToSrm = (ebc: number): number => ebc * 0.508;

const VISIBILITY_LABELS: Record<Recipe["visibility"], string> = {
  public: "Public",
  private: "Private",
  unlisted: "Unlisted",
};

const VISIBILITY_VARIANTS: Record<Recipe["visibility"], "success" | "info"> = {
  public: "success",
  private: "info",
  unlisted: "info",
};

type Props = {
  recipe: Recipe;
  /**
   * Optional override of the visibility badge's label. Defaults to
   * the canonical `VISIBILITY_LABELS[visibility]`. Passed by callers
   * that want to force a specific label (e.g. CatalogScreen always
   * shows "Public" because it pre-filters on visibility — so a
   * future bug that lets a non-public recipe through still renders
   * the correct badge text rather than a contradiction).
   */
  badgeLabel?: string;
  onPress: () => void;
};

/**
 * Shared card used by both `RecipesScreen` (Mon Carnet) and
 * `CatalogScreen` (Recipe Catalog mini, Issue #779). Centralises the
 * EBC → SRM colour swatch, the IBU/ABV/volume stats row, the
 * visibility badge, and the chevron — so future tweaks land in one
 * place. Born out of the SonarCloud duplication QG on PR #845.
 */
export function RecipeCard({ recipe, badgeLabel, onPress }: Props) {
  const stats = recipe.stats;
  const ebc = stats?.colorEbc ?? 10;
  const srm = ebcToSrm(ebc);
  const beerColor = getSrmColor(srm);

  const renderedBadgeLabel = badgeLabel ?? VISIBILITY_LABELS[recipe.visibility];
  const renderedBadgeVariant = VISIBILITY_VARIANTS[recipe.visibility];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la recette ${recipe.name}`}
      onPress={onPress}
    >
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <View style={[styles.recipeIcon, { backgroundColor: beerColor }]}>
            <Ionicons
              name="document-text"
              size={24}
              color={colors.neutral.white}
            />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>{recipe.name}</Text>
              <Badge
                label={renderedBadgeLabel}
                variant={renderedBadgeVariant}
              />
            </View>
            {stats && (
              <View style={styles.statsRow}>
                <Text style={styles.statItem}>{stats.ibu} IBU</Text>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.statItem}>{stats.abv}% ABV</Text>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.statItem}>{stats.volumeLiters}L</Text>
              </View>
            )}
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
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  recipeIcon: {
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
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xxs,
  },
  statItem: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
  },
  statDivider: {
    marginHorizontal: spacing.xs,
    color: colors.neutral.muted,
  },
});
