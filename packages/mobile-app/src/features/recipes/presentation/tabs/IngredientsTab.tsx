import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import Slider from "@react-native-community/slider";

import { Card } from "@/core/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  formatQuantity,
  getIngredientGroupEntries,
  groupIngredientsByType,
  scaleQuantity,
} from "@/features/recipes/presentation/recipe-details.utils";
import type { RecipeDetailsIngredientItem } from "@/features/recipes/application/recipes.use-cases";
import { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";

const SLIDER_MIN_LITRES = 5;
const SLIDER_MAX_LITRES = 100;
const SLIDER_STEP = 1;

type IngredientsTabProps = Readonly<{
  ingredients: RecipeDetailsIngredientItem[];
  baseVolumeLiters: number;
  targetVolumeLiters: number;
  scalingFactor: number;
  onChangeTargetVolume: (volume: number) => void;
  onOpenIngredient: (ingredient: {
    id: string;
    category: IngredientCategory;
  }) => void;
  onOpenShop: () => void;
}>;

/**
 * Ingredients tab of the redesigned recipe detail screen
 * (Issue #740, Round 4 v2 — 5-tab layout).
 *
 * Co-locates the **target-volume slider** with the ingredient list
 * because the slider is the input that scales every quantity. A user
 * dragging the slider sees the malts / hops / yeasts quantities react
 * live, which makes the recipe feel "alive" and avoids the cognitive
 * jump of having the controls in another tab.
 *
 * Tap on an ingredient row navigates to its dedicated detail screen
 * (existing pattern — preserved from the previous monolithic screen).
 */
export function IngredientsTab(props: IngredientsTabProps) {
  const {
    ingredients,
    baseVolumeLiters,
    targetVolumeLiters,
    scalingFactor,
    onChangeTargetVolume,
    onOpenIngredient,
    onOpenShop,
  } = props;

  const groupedIngredients = useMemo(
    () => groupIngredientsByType(ingredients),
    [ingredients],
  );
  const ingredientGroupEntries = useMemo(
    () => getIngredientGroupEntries(groupedIngredients),
    [groupedIngredients],
  );

  return (
    <View testID="recipe-ingredients-tab" style={styles.container}>
      <Card style={styles.sliderCard}>
        <View style={styles.sliderHeader}>
          <Text style={styles.sliderTitle}>Volume cible</Text>
          <Text
            testID="recipe-target-volume-readout"
            style={styles.sliderValue}
          >
            {targetVolumeLiters} L
          </Text>
        </View>
        <Slider
          testID="recipe-target-volume-slider"
          accessibilityLabel="Volume cible en litres"
          minimumValue={SLIDER_MIN_LITRES}
          maximumValue={SLIDER_MAX_LITRES}
          step={SLIDER_STEP}
          value={targetVolumeLiters}
          onSlidingComplete={onChangeTargetVolume}
          minimumTrackTintColor={colors.brand.secondary}
          maximumTrackTintColor={colors.neutral.border}
          thumbTintColor={colors.brand.secondary}
        />
        <Text style={styles.sliderHint}>
          Recette de base : {baseVolumeLiters} L. Les quantités se mettent à
          jour quand tu déplaces le curseur.
        </Text>
      </Card>

      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Ingrédients</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ouvrir la boutique depuis la liste des ingrédients"
            style={styles.inlineAction}
            onPress={onOpenShop}
          >
            <Ionicons
              name="cart-outline"
              size={16}
              color={colors.brand.secondary}
            />
            <Text style={styles.inlineActionText}>Boutique</Text>
          </Pressable>
        </View>

        <Card style={styles.ingredientsCard}>
          {ingredients.length === 0 ? (
            <Text style={styles.emptyText}>
              Pas d'ingrédient renseigné pour cette recette.
            </Text>
          ) : (
            ingredientGroupEntries.map(({ key, label }) => (
              <View key={key} style={styles.groupBlock}>
                <Text style={styles.groupTitle}>{label}</Text>

                {groupedIngredients[key].map((item, index) => {
                  const quantity = formatQuantity(
                    scaleQuantity(item.amount, scalingFactor),
                    item.unit,
                  );

                  return (
                    <View
                      key={`${item.ingredientId}-${item.timing ?? "no-timing"}-${index}`}
                      style={styles.listItem}
                    >
                      <Pressable
                        style={styles.listItemMain}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ingredient details for ${item.name}`}
                        disabled={!item.ingredient}
                        onPress={() => {
                          if (!item.ingredient) {
                            return;
                          }
                          onOpenIngredient(item.ingredient);
                        }}
                      >
                        <Text style={styles.listItemTitle}>{item.name}</Text>
                        <Text style={styles.listItemMeta}>
                          {quantity}
                          {item.timing ? ` • ${item.timing}` : ""}
                        </Text>
                        {item.notes ? (
                          <Text style={styles.listItemNotes}>{item.notes}</Text>
                        ) : null}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  sliderCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.xs,
  },
  sliderTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  sliderValue: {
    color: colors.brand.secondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  sliderHint: {
    marginTop: spacing.xs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  sectionHeaderRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  inlineAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  inlineActionText: {
    color: colors.brand.secondary,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  ingredientsCard: {
    padding: spacing.md,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginTop: spacing.sm,
  },
  groupBlock: {
    marginTop: spacing.sm,
  },
  groupTitle: {
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.xxs,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  listItemMain: {
    flex: 1,
  },
  listItemTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  listItemMeta: {
    marginTop: spacing.xxs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  listItemNotes: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});
