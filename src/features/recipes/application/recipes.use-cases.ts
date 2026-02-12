import {
  getMineById,
  listMine,
  listSteps,
} from "@/features/recipes/data/recipes.api";
import { Recipe, RecipeStep } from "@/features/recipes/domain/recipe.types";
import {
  Equipment,
  demoEquipments,
  demoIngredients,
  demoRecipeSteps,
  demoRecipes,
} from "@/mocks/demo-data";

import { dataSource } from "@/core/data/data-source";
import { Ingredient } from "@/features/ingredients/domain/ingredient.types";

export type RecipeDetailsIngredientItem = {
  ingredientId: string;
  amount: number;
  unit: string;
  timing?: string | null;
  notes?: string | null;
  ingredient: Ingredient | null;
};

export type RecipeDetailsEquipmentItem = {
  equipmentId: string;
  role?: string | null;
  notes?: string | null;
  equipment: Equipment | null;
};

export type RecipeDetailsViewModel = {
  recipe: Recipe;
  steps: RecipeStep[];
  ingredients: RecipeDetailsIngredientItem[];
  equipment: RecipeDetailsEquipmentItem[];
};

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

export async function getRecipeDetailsViewModel(
  recipeId: string,
): Promise<RecipeDetailsViewModel | null> {
  if (!recipeId) {
    return null;
  }

  const [recipe, rawSteps] = await Promise.all([
    getRecipeDetails(recipeId),
    listRecipeSteps(recipeId),
  ]);

  if (!recipe) {
    return null;
  }

  const steps = [...rawSteps].sort((a, b) => a.stepOrder - b.stepOrder);

  const ingredientCatalog = dataSource.useDemoData ? demoIngredients : [];
  const equipmentCatalog = dataSource.useDemoData ? demoEquipments : [];

  const ingredients = (recipe.ingredients ?? []).map((ref) => ({
    ingredientId: ref.ingredientId,
    amount: ref.amount,
    unit: ref.unit,
    timing: ref.timing,
    notes: ref.notes,
    ingredient:
      ingredientCatalog.find((item) => item.id === ref.ingredientId) ?? null,
  }));

  const equipment = (recipe.equipment ?? []).map((ref) => ({
    equipmentId: ref.equipmentId,
    role: ref.role,
    notes: ref.notes,
    equipment:
      equipmentCatalog.find((item) => item.id === ref.equipmentId) ?? null,
  }));

  return {
    recipe,
    steps,
    ingredients,
    equipment,
  };
}
