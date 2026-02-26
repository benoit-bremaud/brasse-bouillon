import {
  INGREDIENT_CATEGORIES,
  Ingredient,
  IngredientCategory,
  IngredientCategorySummary,
  IngredientFilters,
} from "@/features/ingredients/domain/ingredient.types";
import {
  getIngredientDetailsApi,
  listIngredientCategoriesSummaryApi,
  listIngredientsByCategoryApi,
} from "@/features/ingredients/data/ingredients.api";

import { dataSource } from "@/core/data/data-source";
import { demoIngredients } from "@/mocks/demo-data";

function normalizeSearch(search?: string): string {
  return search?.trim().toLocaleLowerCase() ?? "";
}

function applyFilters(
  items: Ingredient[],
  category: IngredientCategory,
  filters: IngredientFilters,
): Ingredient[] {
  const search = normalizeSearch(filters.search);

  return items.filter((item) => {
    if (search && !item.name.toLocaleLowerCase().includes(search)) {
      return false;
    }

    if (category === "malt" && item.category === "malt") {
      if (filters.ebcMin !== undefined && item.ebc < filters.ebcMin) {
        return false;
      }
      if (filters.ebcMax !== undefined && item.ebc > filters.ebcMax) {
        return false;
      }
    }

    if (category === "hop" && item.category === "hop") {
      if (
        filters.alphaAcidMin !== undefined &&
        item.alphaAcid < filters.alphaAcidMin
      ) {
        return false;
      }
    }

    if (category === "yeast" && item.category === "yeast") {
      if (
        filters.attenuationMin !== undefined &&
        item.attenuationMax < filters.attenuationMin
      ) {
        return false;
      }
    }

    return true;
  });
}

function getDemoIngredientsByCategory(
  category: IngredientCategory,
): Ingredient[] {
  return demoIngredients.filter((item) => item.category === category);
}

export async function listIngredientCategoriesSummary(): Promise<
  IngredientCategorySummary[]
> {
  if (dataSource.useDemoData) {
    return INGREDIENT_CATEGORIES.map((category) => ({
      category,
      count: demoIngredients.filter((item) => item.category === category)
        .length,
    }));
  }

  return listIngredientCategoriesSummaryApi();
}

export async function listIngredientsByCategory(
  category: IngredientCategory,
  filters: IngredientFilters = {},
): Promise<Ingredient[]> {
  if (dataSource.useDemoData) {
    const categoryItems = getDemoIngredientsByCategory(category);
    return applyFilters(categoryItems, category, filters);
  }

  const categoryItems = await listIngredientsByCategoryApi(category);
  return applyFilters(categoryItems, category, filters);
}

export async function getIngredientDetails(
  category: IngredientCategory,
  ingredientId: string,
): Promise<Ingredient | null> {
  if (!ingredientId) {
    return null;
  }

  if (dataSource.useDemoData) {
    return (
      demoIngredients.find(
        (item) => item.id === ingredientId && item.category === category,
      ) ?? null
    );
  }

  return getIngredientDetailsApi(category, ingredientId);
}
