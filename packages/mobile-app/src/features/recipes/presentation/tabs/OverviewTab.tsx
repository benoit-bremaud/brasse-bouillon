import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { BeerHero } from "@/features/scan/presentation/components/BeerHero";
import { Card } from "@/core/ui/Card";
import { colors, radius, spacing, typography } from "@/core/theme";
import { RecipeProvenanceBadge } from "@/features/recipes/presentation/components/RecipeProvenanceBadge";
import type {
  Recipe,
  RecipeStats,
} from "@/features/recipes/domain/recipe.types";
import type { RecipeDetailsEquipmentItem } from "@/features/recipes/application/recipes.use-cases";

type OverviewTabProps = Readonly<{
  recipe: Recipe;
  equipment: RecipeDetailsEquipmentItem[];
  targetVolumeLiters: number;
  provenanceLabel: string | null;
  /**
   * Opens the pre-brew ingredient readiness checklist (build slice A2).
   * Optional so the tab renders unchanged where the entry point is not wired.
   */
  onOpenIngredientReadiness?: () => void;
}>;

/**
 * Overview tab of the redesigned recipe detail screen
 * (Issue #740, Round 4 v2 — 5-tab layout).
 *
 * Lands the user on a quick-glance summary:
 * - EBC-driven hero (reuses the canonical `BeerHero` primitive),
 * - Optional provenance badge when the recipe was imported from the
 *   scan flow ("Importée depuis le scan • <beer name>"),
 * - At-a-glance card with brewing metrics scaled to the user's
 *   target volume,
 * - Intro narrative (recipe description, hidden when empty),
 * - Equipment checklist — the user sees up-front everything that
 *   will be needed to brew the recipe (capacities side by side).
 */
export function OverviewTab({
  recipe,
  equipment,
  targetVolumeLiters,
  provenanceLabel,
  onOpenIngredientReadiness,
}: OverviewTabProps) {
  const stats: RecipeStats | null | undefined = recipe.stats;
  const styleLabel = pickField(recipe, "style");
  const breweryLabel = pickField(recipe, "brewery");
  const colorEbc = stats?.colorEbc ?? null;

  return (
    <View testID="recipe-overview-tab" style={styles.container}>
      {provenanceLabel ? (
        <RecipeProvenanceBadge label={provenanceLabel} />
      ) : null}

      <BeerHero
        name={recipe.name}
        brewery={breweryLabel}
        style={styleLabel}
        colorEbc={colorEbc}
      />

      {stats ? (
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>En un coup d'œil</Text>
          <View style={styles.statsGrid}>
            <StatBlock label="ABV" value={`${stats.abv}%`} />
            <StatBlock label="IBU" value={String(stats.ibu)} />
            <StatBlock
              label="Couleur"
              value={
                typeof stats.colorEbc === "number"
                  ? `${stats.colorEbc} EBC`
                  : "—"
              }
            />
            <StatBlock label="OG" value={String(stats.og)} />
            <StatBlock label="FG" value={String(stats.fg)} />
            <StatBlock label="Volume cible" value={`${targetVolumeLiters} L`} />
          </View>
          <Text style={styles.referenceHint}>
            IBU, ABV, OG et FG restent les valeurs de référence de la recette
            d'origine.
          </Text>
        </Card>
      ) : null}

      {onOpenIngredientReadiness ? (
        <Pressable
          testID="recipe-open-ingredient-readiness"
          accessibilityRole="button"
          accessibilityLabel="Vérifier mes ingrédients"
          style={({ pressed }) => [
            styles.readinessButton,
            pressed && styles.readinessButtonPressed,
          ]}
          onPress={onOpenIngredientReadiness}
        >
          <Ionicons
            name="checkbox-outline"
            size={20}
            color={colors.brand.secondary}
          />
          <Text style={styles.readinessButtonText}>
            Vérifier mes ingrédients
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.brand.secondary}
          />
        </Pressable>
      ) : null}

      {recipe.description ? (
        <Card style={styles.introCard}>
          <Text style={styles.cardTitle}>À propos de cette recette</Text>
          <Text style={styles.introText}>{recipe.description}</Text>
        </Card>
      ) : null}

      <Card style={styles.checklistCard}>
        <Text style={styles.cardTitle}>Matériel requis</Text>
        <Text style={styles.checklistHint}>
          Ce dont tu auras besoin pour brasser cette recette. Vérifie ta cuisine
          avant de commencer.
        </Text>
        {equipment.length === 0 ? (
          <Text style={styles.emptyText}>
            Aucun matériel n'est listé pour cette recette.
          </Text>
        ) : (
          equipment.map((item) => (
            <View
              key={item.equipmentId}
              testID={`recipe-equipment-checklist-${item.equipmentId}`}
              style={styles.checklistRow}
            >
              <View style={styles.checklistMain}>
                <Text style={styles.checklistName}>
                  {item.equipment?.name ?? "Matériel inconnu"}
                </Text>
                <Text style={styles.checklistMeta}>
                  {item.role ?? item.equipment?.type ?? "Usage général"}
                  {item.equipment?.volumeLiters
                    ? ` • capacité ${item.equipment.volumeLiters} L`
                    : ""}
                </Text>
              </View>
              {item.equipment?.volumeLiters ? (
                <View style={styles.capacityChip}>
                  <Text style={styles.capacityChipText}>
                    {item.equipment.volumeLiters} L
                  </Text>
                </View>
              ) : null}
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

type StatBlockProps = Readonly<{
  label: string;
  value: string;
}>;

function StatBlock({ label, value }: StatBlockProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function pickField(recipe: Recipe, key: "style" | "brewery"): string | null {
  const candidate = (
    recipe as { style?: string | null; brewery?: string | null }
  )[key];
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  statsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  introCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  checklistCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  statItem: {
    width: "30%",
    minWidth: 90,
    backgroundColor: colors.brand.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textTransform: "uppercase",
    fontWeight: typography.weight.bold,
  },
  statValue: {
    marginTop: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  referenceHint: {
    marginTop: spacing.sm,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.neutral.textSecondary,
  },
  readinessButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  readinessButtonPressed: {
    opacity: 0.85,
  },
  readinessButtonText: {
    flex: 1,
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  introText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  checklistHint: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  checklistMain: {
    flex: 1,
    marginRight: spacing.sm,
  },
  checklistName: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  checklistMeta: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  capacityChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  capacityChipText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.bold,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});
