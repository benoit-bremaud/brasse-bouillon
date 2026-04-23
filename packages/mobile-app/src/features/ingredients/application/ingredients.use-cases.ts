import {
  getIngredientDetailsApi,
  listIngredientCategoriesSummaryApi,
  listIngredientsByCategoryApi,
} from "@/features/ingredients/data/ingredients.api";
import {
  Ingredient,
  IngredientCategory,
  IngredientCategorySummary,
  IngredientFilters,
} from "@/features/ingredients/domain/ingredient.types";

import { dataSource } from "@/core/data/data-source";
import {
  demoHops,
  demoIngredients,
  demoMalts,
  demoYeasts,
} from "@/mocks/demo-data";

function isIngredientCategory(value: string): value is IngredientCategory {
  const categories: readonly IngredientCategory[] = ["malt", "hop", "yeast"];
  return categories.includes(value as IngredientCategory);
}

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
    // Count from the category-specific demo arrays so the Ingredients
    // home counter matches the items shown on each category list
    // screen. Using demoIngredients would under-count malts (4 vs
    // 10 in demoMalts) because demoIngredients is a thin secondary
    // array used by the recipe ingredient catalog.
    return [
      { category: "malt", count: demoMalts.length },
      { category: "hop", count: demoHops.length },
      { category: "yeast", count: demoYeasts.length },
    ];
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
    const [categoryFromId] = ingredientId.split("-");
    if (categoryFromId && isIngredientCategory(categoryFromId)) {
      if (categoryFromId !== category) {
        return null;
      }
    }

    return (
      demoIngredients.find(
        (item) => item.id === ingredientId && item.category === category,
      ) ?? null
    );
  }

  return getIngredientDetailsApi(category, ingredientId);
}
