import {
  getMineById,
  listMine,
  listSteps,
} from "@/features/recipes/data/recipes.api";
import { Recipe, RecipeStep } from "@/features/recipes/domain/recipe.types";
import { demoRecipeSteps, demoRecipes } from "@/mocks/demo-data";

import { dataSource } from "@/core/data/data-source";

export async function listRecipes(): Promise<Recipe[]> {
  return dataSource.useDemoData ? demoRecipes : listMine();
}

export async function getRecipeDetails(
  recipeId: string,
): Promise<Recipe | null> {
  if (!recipeId) {
    return null;
  }
  if (dataSource.useDemoData) {
    return demoRecipes.find((item) => item.id === recipeId) ?? null;
  }
  return getMineById(recipeId);
}

export async function listRecipeSteps(recipeId: string): Promise<RecipeStep[]> {
  if (!recipeId) {
    return [];
  }
  if (dataSource.useDemoData) {
    return demoRecipeSteps.filter((step) => step.recipeId === recipeId);
  }
  return listSteps(recipeId);
}
