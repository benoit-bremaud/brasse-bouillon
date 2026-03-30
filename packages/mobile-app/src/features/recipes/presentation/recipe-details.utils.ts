import {
  RecipeDetailsEquipmentItem,
  RecipeDetailsIngredientItem,
} from "@/features/recipes/application/recipes.use-cases";
import {
  RECIPE_INGREDIENT_GROUP_LABELS,
  RECIPE_INGREDIENT_GROUP_ORDER,
  RecipeIngredientGroupKey,
} from "@/features/recipes/presentation/recipe-details.constants";

import type { WaterProfile } from "@/core/brewing-calculations";
import type { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";
import type { LocalCartItem } from "@/features/shop/domain/cart.types";
import type { ShopCategory } from "@/features/shop/domain/shop.types";

const WATER_METRICS: (keyof WaterProfile)[] = [
  "ca",
  "mg",
  "na",
  "so4",
  "cl",
  "hco3",
];

export type WaterCompatibility = {
  score: number;
  matchedMetrics: number;
  totalMetrics: number;
  label: "Excellent" | "Good" | "Fair" | "Low";
};

export function parseTargetVolume(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value.replace(",", "."));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function calculateScalingFactor(
  baseVolumeLiters: number,
  targetVolumeLiters: number,
): number {
  if (baseVolumeLiters <= 0 || targetVolumeLiters <= 0) {
    return 1;
  }

  return targetVolumeLiters / baseVolumeLiters;
}

export function scaleQuantity(amount: number, factor: number): number {
  const scaled = amount * factor;
  return Number.parseFloat(scaled.toFixed(3));
}

export function formatQuantity(amount: number, unit: string): string {
  if (!Number.isFinite(amount)) {
    return `0 ${unit}`;
  }

  const roundedAmount = Number.isInteger(amount)
    ? amount
    : Number.parseFloat(amount.toFixed(2));

  return `${roundedAmount} ${unit}`;
}

function toIngredientGroupKey(
  category: IngredientCategory | null | undefined,
): RecipeIngredientGroupKey {
  if (!category) {
    return "other";
  }

  if (category === "malt" || category === "hop" || category === "yeast") {
    return category;
  }

  return "other";
}

export function groupIngredientsByType(
  ingredients: RecipeDetailsIngredientItem[],
): Record<RecipeIngredientGroupKey, RecipeDetailsIngredientItem[]> {
  const grouped: Record<
    RecipeIngredientGroupKey,
    RecipeDetailsIngredientItem[]
  > = {
    malt: [],
    hop: [],
    yeast: [],
    other: [],
  };

  ingredients.forEach((item) => {
    const key = toIngredientGroupKey(item.ingredient?.category);
    grouped[key].push(item);
  });

  return grouped;
}

export function mapIngredientCategoryToShopCategory(
  category: IngredientCategory | null | undefined,
): ShopCategory {
  if (category === "malt") {
    return "malts";
  }

  if (category === "hop") {
    return "houblons";
  }

  if (category === "yeast") {
    return "levures";
  }

  return "accessoires";
}

export function toIngredientCartItem(
  ingredient: RecipeDetailsIngredientItem,
  scalingFactor: number,
): LocalCartItem {
  const scaledAmount = scaleQuantity(ingredient.amount, scalingFactor);
  const ingredientName =
    ingredient.ingredient?.name ?? `Ingredient ${ingredient.ingredientId}`;
  const ingredientCategory = mapIngredientCategoryToShopCategory(
    ingredient.ingredient?.category,
  );

  return {
    key: `ingredient-${ingredient.ingredientId}-${ingredient.unit}`,
    source: "ingredient",
    refId: ingredient.ingredientId,
    name: ingredientName,
    category: ingredientCategory,
    quantity: scaledAmount,
    unit: ingredient.unit,
  };
}

export function buildIngredientCartItems(
  ingredients: RecipeDetailsIngredientItem[],
  scalingFactor: number,
): LocalCartItem[] {
  return ingredients.map((ingredient) =>
    toIngredientCartItem(ingredient, scalingFactor),
  );
}

export function toEquipmentCartItem(
  equipment: RecipeDetailsEquipmentItem,
): LocalCartItem {
  return {
    key: `equipment-${equipment.equipmentId}`,
    source: "equipment",
    refId: equipment.equipmentId,
    name: equipment.equipment?.name ?? `Equipment ${equipment.equipmentId}`,
    category: "materiel",
    quantity: 1,
    unit: "unit",
  };
}

export function isVolumeCompatible(
  targetVolumeLiters: number,
  equipmentCapacityLiters: number | null,
): boolean {
  if (!equipmentCapacityLiters || equipmentCapacityLiters <= 0) {
    return true;
  }

  return targetVolumeLiters <= equipmentCapacityLiters;
}

export function calculateWaterCompatibility(
  recommended: WaterProfile,
  actual: WaterProfile,
): WaterCompatibility {
  let totalScore = 0;
  let matchedMetrics = 0;

  WATER_METRICS.forEach((metric) => {
    const recommendedValue = Math.max(recommended[metric], 1);
    const actualValue = actual[metric];
    const relativeGap =
      Math.abs(actualValue - recommendedValue) / recommendedValue;

    if (relativeGap <= 0.25) {
      matchedMetrics += 1;
    }

    totalScore += Math.max(0, 100 - Math.min(relativeGap, 1.5) * 100);
  });

  const averageScore = Math.round(totalScore / WATER_METRICS.length);

  if (averageScore >= 85) {
    return {
      score: averageScore,
      matchedMetrics,
      totalMetrics: WATER_METRICS.length,
      label: "Excellent",
    };
  }

  if (averageScore >= 70) {
    return {
      score: averageScore,
      matchedMetrics,
      totalMetrics: WATER_METRICS.length,
      label: "Good",
    };
  }

  if (averageScore >= 50) {
    return {
      score: averageScore,
      matchedMetrics,
      totalMetrics: WATER_METRICS.length,
      label: "Fair",
    };
  }

  return {
    score: averageScore,
    matchedMetrics,
    totalMetrics: WATER_METRICS.length,
    label: "Low",
  };
}

export const WATER_METRIC_LABELS: Record<keyof WaterProfile, string> = {
  ca: "Calcium",
  mg: "Magnesium",
  na: "Sodium",
  so4: "Sulfates",
  cl: "Chlorides",
  hco3: "Bicarbonates",
};

export function getIngredientGroupEntries(
  groupedIngredients: Record<
    RecipeIngredientGroupKey,
    RecipeDetailsIngredientItem[]
  >,
): { key: RecipeIngredientGroupKey; label: string }[] {
  return RECIPE_INGREDIENT_GROUP_ORDER.filter(
    (groupKey) => groupedIngredients[groupKey].length > 0,
  ).map((groupKey) => ({
    key: groupKey,
    label: RECIPE_INGREDIENT_GROUP_LABELS[groupKey],
  }));
}
