import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@/core/theme";

import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { DifficultyBadge } from "@/features/recipes/presentation/components/DifficultyBadge";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Recipe } from "@/features/recipes/domain/recipe.types";
import { formatFrDate } from "@/core/utils/format";
import { getSrmColor } from "@/features/tools/data/catalogs/srm";

const ebcToSrm = (ebc: number): number => ebc * 0.508;

// Mobile UI is French (cf. project convention "UI stays French"). The
// catalogue path overrides this with `badgeLabel="Publique"` as a
// deliberate marker on its discovery surface — the override is now
// just a defensive guarantee in case the API leaks a non-public row.
const VISIBILITY_LABELS: Record<Recipe["visibility"], string> = {
  public: "Publique",
  private: "Privée",
  unlisted: "Non listée",
};

const VISIBILITY_VARIANTS: Record<Recipe["visibility"], "success" | "info"> = {
  public: "success",
  private: "info",
  unlisted: "info",
};

type Props = Readonly<{
  recipe: Recipe;
  /**
   * Optional override of the visibility badge's label. Defaults to
   * the canonical `VISIBILITY_LABELS[visibility]`. Passed by callers
   * that want to force a specific label (e.g. CatalogScreen always
   * shows "Publique" because it pre-filters on visibility — so a
   * future bug that lets a non-public recipe through still renders
   * the correct badge text rather than a contradiction).
   */
  badgeLabel?: string;
  onPress: () => void;
}>;

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

  // Novice differentiator: two recipes can legitimately share a name, so the
  // card carries its creation date to tell them apart. Omitted entirely when
  // the date is missing/unparseable rather than showing a broken value.
  const createdAtLabel = formatFrDate(recipe.createdAt);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ouvrir la recette ${recipe.name}`}
      onPress={onPress}
    >
      <Card style={styles.card}>
        <Badge
          label={renderedBadgeLabel}
          variant={renderedBadgeVariant}
          placement="corner"
        />
        <View style={styles.cardContent}>
          <View style={[styles.recipeIcon, { backgroundColor: beerColor }]}>
            <Ionicons
              name="document-text"
              size={24}
              color={colors.neutral.white}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {recipe.name}
            </Text>
            {stats && (
              <View style={styles.statsRow}>
                <Text style={styles.statItem}>{stats.ibu} IBU</Text>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.statItem}>{stats.abv}% ABV</Text>
                <Text style={styles.statDivider}>•</Text>
                <Text style={styles.statItem}>{stats.volumeLiters}L</Text>
              </View>
            )}
            {recipe.difficultyEffective && recipe.difficultyReasons?.length ? (
              <DifficultyBadge
                level={recipe.difficultyEffective}
                style={styles.difficultyBadge}
              />
            ) : null}
            {createdAtLabel ? (
              <Text style={styles.createdAt}>Créée le {createdAtLabel}</Text>
            ) : null}
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
    paddingTop: spacing.sm,
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
  difficultyBadge: {
    marginTop: spacing.xs,
  },
  createdAt: {
    marginTop: spacing.xs,
    fontSize: typography.size.label,
    color: colors.neutral.muted,
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
