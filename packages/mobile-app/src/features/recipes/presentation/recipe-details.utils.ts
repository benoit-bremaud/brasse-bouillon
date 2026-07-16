import { RecipeDetailsIngredientItem } from "@/features/recipes/application/recipes.use-cases";
import {
  RECIPE_INGREDIENT_GROUP_LABELS,
  RECIPE_INGREDIENT_GROUP_ORDER,
  RecipeIngredientGroupKey,
} from "@/features/recipes/presentation/recipe-details.constants";

import type { WaterProfile } from "@/core/brewing-calculations";

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

// `formatQuantity` lives in the layer-neutral `core/utils/format` so the
// application layer (brew-readiness use-cases) can reuse it without importing
// from presentation. Re-exported here for the existing presentation callers.
export { formatQuantity } from "@/core/utils/format";

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
    const key: RecipeIngredientGroupKey =
      item.category === "malt" ||
      item.category === "hop" ||
      item.category === "yeast"
        ? item.category
        : "other";
    grouped[key].push(item);
  });

  return grouped;
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
