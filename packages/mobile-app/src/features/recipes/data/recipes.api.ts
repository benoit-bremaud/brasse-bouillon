import { request } from "@/core/http/http-client";

import {
  Recipe,
  RecipeDifficultyLevel,
  RecipeDifficultyReason,
  RecipeStep,
} from "../domain/recipe.types";

type RecipeDto = {
  id: string;
  // `owner_id` is omitted by the API on the catalog projection
  // (`PublicRecipeDto`) so an anonymous reader cannot enumerate
  // authors. The Mon Carnet path still receives it. Issue #779.
  owner_id?: string;
  name: string;
  description?: string | null;
  visibility: Recipe["visibility"];
  version: number;
  root_recipe_id: string;
  parent_recipe_id?: string | null;
  // Brewing metrics — surfaced as `recipe.stats` on the front so
  // RecipesScreen / CatalogScreen cards render IBU/ABV/volume/color.
  // Without these fields the cards fall back to the default swatch
  // and lose the stats row entirely (Issue #779 Copilot review).
  batch_size_l?: number | null;
  og_target?: number | null;
  fg_target?: number | null;
  abv_estimated?: number | null;
  ibu_target?: number | null;
  ebc_target?: number | null;
  // Brewing-difficulty badge (ADR-0024). Backend-computed; the effective level
  // = `difficulty_override ?? difficulty_computed`. `difficulty_reasons` feeds
  // the tap-to-explain (rendered as-is, never recomputed client-side).
  difficulty_computed?: RecipeDifficultyLevel | null;
  difficulty_override?: RecipeDifficultyLevel | null;
  difficulty_effective?: RecipeDifficultyLevel | null;
  difficulty_reasons?: RecipeDifficultyReason[] | null;
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

// Exported for unit testing (Issue #779 — coverage guard on
// mapRecipeStats branches). Not part of the feature's public API.
export function mapRecipe(dto: RecipeDto): Recipe {
  return {
    id: dto.id,
    ownerId: dto.owner_id,
    name: dto.name,
    description: dto.description ?? null,
    visibility: dto.visibility,
    version: dto.version,
    rootRecipeId: dto.root_recipe_id,
    parentRecipeId: dto.parent_recipe_id ?? null,
    stats: mapRecipeStats(dto),
    difficultyComputed: dto.difficulty_computed ?? undefined,
    difficultyOverride: dto.difficulty_override ?? null,
    difficultyEffective: dto.difficulty_effective ?? undefined,
    difficultyReasons: dto.difficulty_reasons ?? undefined,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

// Pulls the brewing metric fields off the API DTO into the
// front-end `RecipeStats` shape used by the cards. Returns `null`
// when none of the metric fields are populated, so the screens'
// `stats ? ... : null` guards stay simple.
function mapRecipeStats(dto: RecipeDto): Recipe["stats"] {
  const ibu = dto.ibu_target ?? null;
  const abv = dto.abv_estimated ?? null;
  const og = dto.og_target ?? null;
  const fg = dto.fg_target ?? null;
  const volumeLiters = dto.batch_size_l ?? null;
  const colorEbc = dto.ebc_target ?? null;

  if (
    ibu === null &&
    abv === null &&
    og === null &&
    fg === null &&
    volumeLiters === null &&
    colorEbc === null
  ) {
    return null;
  }

  return {
    ibu: ibu ?? 0,
    abv: abv ?? 0,
    og: og ?? 0,
    fg: fg ?? 0,
    volumeLiters: volumeLiters ?? 0,
    colorEbc: colorEbc ?? undefined,
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

// Issue #779 — Recipe Catalog mini.
// Hits the GET /recipes/public route added in PR (this PR) and
// returns every PUBLIC recipe regardless of owner. Backbone of the
// CatalogScreen discovery surface.
export async function listPublic(): Promise<Recipe[]> {
  const rows = await request<RecipeDto[]>("/recipes/public");
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

export async function importFromCommunity(sourceId: string): Promise<Recipe> {
  const row = await request<RecipeDto>(
    `/recipes/import-from-community/${sourceId}`,
    { method: "POST" },
  );
  return mapRecipe(row);
}

export async function deleteRecipe(id: string): Promise<void> {
  await request<void>(`/recipes/${id}`, { method: "DELETE" });
}
