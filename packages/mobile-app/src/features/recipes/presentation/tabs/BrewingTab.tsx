import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  BREWING_PHASES,
  RECIPE_PROCESS_DISPLAY_OPTIONS,
  RecipeProcessDisplayMode,
} from "@/features/recipes/presentation/recipe-details.constants";
import type { RecipeStep } from "@/features/recipes/domain/recipe.types";

type BrewingTabProps = Readonly<{
  ingredientsCount: number;
  equipmentCount: number;
  steps: RecipeStep[];
  processDisplayMode: RecipeProcessDisplayMode;
  onChangeProcessDisplayMode: (mode: RecipeProcessDisplayMode) => void;
}>;

/**
 * Brewing tab of the redesigned recipe detail screen
 * (Issue #740, Round 4 v2 — 5-tab layout).
 *
 * Slimmed-down compared to the previous monolithic Brassage tab:
 * ingredients moved to the dedicated `IngredientsTab`, equipment
 * promoted to the Overview "checklist matériel" card, water profile
 * promoted to the dedicated `WaterTab`. What remains is the brewing
 * **process** itself: the canonical 13-phase BJCP-aligned phases,
 * the recipe-authored steps (mash / boil / fermentation / packaging),
 * and a compact summary mode for users who only want a glance.
 *
 * The "Lancer un brassin" entry point lives on the orchestrator's
 * sticky CTA bar and stays accessible across every tab — see
 * `RecipeDetailsScreen` and `RecipeStickyCta`.
 */
export function BrewingTab({
  ingredientsCount,
  equipmentCount,
  steps,
  processDisplayMode,
  onChangeProcessDisplayMode,
}: BrewingTabProps) {
  return (
    <ScrollView
      testID="recipe-brewing-tab"
      contentContainerStyle={styles.container}
    >
      <Text style={styles.sectionTitle}>Aperçu du process</Text>
      <View style={styles.toggleRow}>
        {RECIPE_PROCESS_DISPLAY_OPTIONS.map((option) => (
          <Pressable
            key={option.id}
            testID={`recipe-process-filter-${option.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Use ${option.label.toLowerCase()} process display mode`}
            style={[
              styles.toggleChip,
              processDisplayMode === option.id && styles.toggleChipActive,
            ]}
            onPress={() => onChangeProcessDisplayMode(option.id)}
          >
            <Text
              style={[
                styles.toggleChipText,
                processDisplayMode === option.id && styles.toggleChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.card}>
        {processDisplayMode === "phases"
          ? BREWING_PHASES.map((phase) => (
              <View key={phase.id} style={styles.phaseRow}>
                <Text style={styles.phaseTitle}>{phase.title}</Text>
                <Text style={styles.phaseDetails}>{phase.details}</Text>
              </View>
            ))
          : null}

        {processDisplayMode === "recipe" ? (
          steps.length > 0 ? (
            steps.map((item) => (
              <View
                key={`${item.recipeId}-${item.stepOrder}`}
                style={styles.stepRow}
              >
                <View style={styles.stepHeader}>
                  <Text style={styles.stepTitle}>
                    {item.stepOrder + 1}. {item.label}
                  </Text>
                  <Text style={styles.stepType}>{item.type}</Text>
                </View>
                {item.description ? (
                  <Text style={styles.stepDescription}>{item.description}</Text>
                ) : null}
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Pas d'étapes renseignées pour cette recette.
            </Text>
          )
        ) : null}

        {processDisplayMode === "compact" ? (
          <>
            <Text style={styles.compactStat}>
              Étapes recette : {steps.length}
            </Text>
            <Text style={styles.compactStat}>
              Ingrédients : {ingredientsCount}
            </Text>
            <Text style={styles.compactStat}>Matériel : {equipmentCount}</Text>
            {steps[0] ? (
              <Text style={styles.compactHint}>
                Prochaine étape clé : {steps[0].label}
              </Text>
            ) : null}
          </>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.md,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  toggleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  toggleChipActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  toggleChipText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  toggleChipTextActive: {
    color: colors.brand.secondary,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  phaseRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  phaseTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  phaseDetails: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  stepRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  stepType: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    textTransform: "uppercase",
    fontWeight: typography.weight.bold,
    backgroundColor: colors.brand.background,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  stepDescription: {
    marginTop: spacing.sm,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  compactStat: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.xxs,
  },
  compactHint: {
    marginTop: spacing.xs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
