import type { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";

const INGREDIENT_CATEGORY_VALUES: readonly IngredientCategory[] = [
  "malt",
  "hop",
  "yeast",
];

export const ingredientCategoryLabels: Record<IngredientCategory, string> = {
  malt: "Malts",
  hop: "Hops",
  yeast: "Yeasts",
};

export function isIngredientCategory(
  value: string,
): value is IngredientCategory {
  return INGREDIENT_CATEGORY_VALUES.includes(value as IngredientCategory);
}
