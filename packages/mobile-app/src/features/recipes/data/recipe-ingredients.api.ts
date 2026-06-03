import { request } from "@/core/http/http-client";

/**
 * Recipe-ingredient sub-resources (#1134). In live mode a recipe's
 * ingredients are NOT inlined on `GET /recipes/:id`; they are served
 * per type by dedicated endpoints. Each row is denormalised (it carries
 * its own display name + weight), so no catalog lookup is needed.
 */

interface RecipeFermentableDto {
  id: string;
  recipe_id: string;
  name: string;
  type: string;
  weight_g: number;
  potential_gravity?: number | null;
  color_ebc?: number | null;
}

interface RecipeHopDto {
  id: string;
  recipe_id: string;
  variety: string;
  type: string;
  weight_g: number;
  alpha_acid_percent?: number | null;
  addition_stage: string;
  addition_time_min?: number | null;
}

interface RecipeYeastDto {
  id: string;
  recipe_id: string;
  name: string;
  type: string;
  amount_g: number;
  attenuation_percent?: number | null;
}

interface RecipeAdditiveDto {
  id: string;
  recipe_id: string;
  name: string;
  type: string;
  amount_g: number;
}

export interface RecipeFermentableRow {
  id: string;
  name: string;
  weightG: number;
}

export interface RecipeHopRow {
  id: string;
  variety: string;
  weightG: number;
  additionStage: string;
  additionTimeMin: number | null;
}

export interface RecipeYeastRow {
  id: string;
  name: string;
  amountG: number;
}

export interface RecipeAdditiveRow {
  id: string;
  name: string;
  amountG: number;
}

export async function listRecipeFermentables(
  recipeId: string,
): Promise<RecipeFermentableRow[]> {
  const rows = await request<RecipeFermentableDto[]>(
    `/recipes/${recipeId}/fermentables`,
  );
  return rows.map((dto) => ({
    id: dto.id,
    name: dto.name,
    weightG: dto.weight_g,
  }));
}

export async function listRecipeHops(
  recipeId: string,
): Promise<RecipeHopRow[]> {
  const rows = await request<RecipeHopDto[]>(`/recipes/${recipeId}/hops`);
  return rows.map((dto) => ({
    id: dto.id,
    variety: dto.variety,
    weightG: dto.weight_g,
    additionStage: dto.addition_stage,
    additionTimeMin: dto.addition_time_min ?? null,
  }));
}

export async function listRecipeYeasts(
  recipeId: string,
): Promise<RecipeYeastRow[]> {
  const rows = await request<RecipeYeastDto[]>(`/recipes/${recipeId}/yeasts`);
  return rows.map((dto) => ({
    id: dto.id,
    name: dto.name,
    amountG: dto.amount_g,
  }));
}

export async function listRecipeAdditives(
  recipeId: string,
): Promise<RecipeAdditiveRow[]> {
  const rows = await request<RecipeAdditiveDto[]>(
    `/recipes/${recipeId}/additives`,
  );
  return rows.map((dto) => ({
    id: dto.id,
    name: dto.name,
    amountG: dto.amount_g,
  }));
}
