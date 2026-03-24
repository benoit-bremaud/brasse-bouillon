import { request } from "@/core/http/http-client";

import { Recipe, RecipeStep } from "../domain/recipe.types";

type RecipeDto = {
  id: string;
  owner_id: string;
  name: string;
  description?: string | null;
  visibility: Recipe["visibility"];
  version: number;
  root_recipe_id: string;
  parent_recipe_id?: string | null;
  created_at: string;
  updated_at: string;
};

type RecipeStepDto = {
  recipe_id: string;
  step_order: number;
  type: RecipeStep["type"];
  label: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

function mapRecipe(dto: RecipeDto): Recipe {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    name: dto.name,
    description: dto.description ?? null,
    visibility: dto.visibility,
    version: dto.version,
    rootRecipeId: dto.root_recipe_id,
    parentRecipeId: dto.parent_recipe_id ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

function mapRecipeStep(dto: RecipeStepDto): RecipeStep {
  return {
    recipeId: dto.recipe_id,
    stepOrder: dto.step_order,
    type: dto.type,
    label: dto.label,
    description: dto.description ?? null,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export async function listMine(): Promise<Recipe[]> {
  const rows = await request<RecipeDto[]>("/recipes");
  return rows.map(mapRecipe);
}

export async function getMineById(id: string): Promise<Recipe> {
  const row = await request<RecipeDto>(`/recipes/${id}`);
  return mapRecipe(row);
}

export async function listSteps(recipeId: string): Promise<RecipeStep[]> {
  const rows = await request<RecipeStepDto[]>(`/recipes/${recipeId}/steps`);
  return rows.map(mapRecipeStep);
}
