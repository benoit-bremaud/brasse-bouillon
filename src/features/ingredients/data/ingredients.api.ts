import {
  INGREDIENT_CATEGORIES,
  Ingredient,
  IngredientCategory,
  IngredientCategorySummary,
} from "@/features/ingredients/domain/ingredient.types";

import { request } from "@/core/http/http-client";

type RecipeListItemDto = {
  id: string;
};

type RecipeFermentableDto = {
  id: string;
  recipe_id: string;
  name: string;
  type: "grain" | "extract" | "sugar" | "adjunct";
  weight_g: number;
  potential_gravity: number | null;
  color_ebc: number | null;
  created_at: string;
  updated_at: string;
};

type RecipeHopDto = {
  id: string;
  recipe_id: string;
  variety: string;
  type: "pellet" | "whole_leaf" | "extract";
  weight_g: number;
  alpha_acid_percent: number | null;
  addition_stage: "boil" | "whirlpool" | "dry_hop" | "first_wort";
  addition_time_min: number | null;
  created_at: string;
  updated_at: string;
};

type RecipeYeastDto = {
  id: string;
  recipe_id: string;
  name: string;
  type: "ale" | "lager" | "wild" | "brett";
  amount_g: number;
  attenuation_percent: number | null;
  temperature_min_c: number | null;
  temperature_max_c: number | null;
  created_at: string;
  updated_at: string;
};

function toIngredientCategorySummary(
  ingredients: Ingredient[],
): IngredientCategorySummary[] {
  return INGREDIENT_CATEGORIES.map((category) => ({
    category,
    count: ingredients.filter((item) => item.category === category).length,
  }));
}

function normalizeName(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildLiveIngredientId(
  category: IngredientCategory,
  name: string,
): string {
  const normalizedName = normalizeName(name);
  return `${category}-${normalizedName}`;
}

function deduplicateIngredients(items: Ingredient[]): Ingredient[] {
  const uniqueByCategoryAndName = new Map<string, Ingredient>();

  items.forEach((item) => {
    const key = `${item.category}:${item.name.toLocaleLowerCase()}`;
    if (!uniqueByCategoryAndName.has(key)) {
      uniqueByCategoryAndName.set(key, item);
    }
  });

  return [...uniqueByCategoryAndName.values()];
}

function mapFermentableTypeToMaltType(
  type: RecipeFermentableDto["type"],
): "base" | "caramel" | "roasted" | "specialty" {
  if (type === "sugar") {
    return "caramel";
  }

  if (type === "adjunct") {
    return "specialty";
  }

  if (type === "extract") {
    return "specialty";
  }

  return "base";
}

function mapHopTypeToForm(type: RecipeHopDto["type"]): "pellet" | "whole" {
  if (type === "whole_leaf") {
    return "whole";
  }

  return "pellet";
}

function mapHopStageToUsage(
  stage: RecipeHopDto["addition_stage"],
): "bittering" | "aroma" | "dual" {
  if (stage === "boil" || stage === "first_wort") {
    return "bittering";
  }

  if (stage === "whirlpool") {
    return "dual";
  }

  return "aroma";
}

function mapYeastTypeToCategory(
  type: RecipeYeastDto["type"],
): "ale" | "lager" | "wheat" | "belgian" {
  if (type === "lager") {
    return "lager";
  }

  if (type === "wild") {
    return "wheat";
  }

  if (type === "brett") {
    return "belgian";
  }

  return "ale";
}

function mapFermentableToIngredient(dto: RecipeFermentableDto): Ingredient {
  const ebc = dto.color_ebc ?? 0;
  const potentialSg = dto.potential_gravity ?? 1.03;

  return {
    id: buildLiveIngredientId("malt", dto.name),
    name: dto.name,
    category: "malt",
    maltType: mapFermentableTypeToMaltType(dto.type),
    ebc,
    potentialSg,
    maxPercent: 100,
    notes: `Source recipe ingredient: ${dto.id}`,
  };
}

function mapHopToIngredient(dto: RecipeHopDto): Ingredient {
  return {
    id: buildLiveIngredientId("hop", dto.variety),
    name: dto.variety,
    category: "hop",
    form: mapHopTypeToForm(dto.type),
    hopUse: mapHopStageToUsage(dto.addition_stage),
    alphaAcid: dto.alpha_acid_percent ?? 0,
    betaAcid: 0,
    notes: `Source recipe ingredient: ${dto.id}`,
  };
}

function mapYeastToIngredient(dto: RecipeYeastDto): Ingredient {
  const attenuation = dto.attenuation_percent ?? 75;

  return {
    id: buildLiveIngredientId("yeast", dto.name),
    name: dto.name,
    category: "yeast",
    yeastType: mapYeastTypeToCategory(dto.type),
    attenuationMin: Math.max(0, attenuation - 2),
    attenuationMax: Math.min(100, attenuation + 2),
    flocculation: "medium",
    fermentationMinC: dto.temperature_min_c ?? 18,
    fermentationMaxC: dto.temperature_max_c ?? 24,
    notes: `Source recipe ingredient: ${dto.id}`,
  };
}

async function listRecipeIds(): Promise<string[]> {
  const recipes = await request<RecipeListItemDto[]>("/recipes");
  return recipes.map((recipe) => recipe.id);
}

async function listFermentablesByRecipe(
  recipeId: string,
): Promise<RecipeFermentableDto[]> {
  return request<RecipeFermentableDto[]>(`/recipes/${recipeId}/fermentables`);
}

async function listHopsByRecipe(recipeId: string): Promise<RecipeHopDto[]> {
  return request<RecipeHopDto[]>(`/recipes/${recipeId}/hops`);
}

async function listYeastsByRecipe(recipeId: string): Promise<RecipeYeastDto[]> {
  return request<RecipeYeastDto[]>(`/recipes/${recipeId}/yeasts`);
}

async function listAllIngredients(): Promise<Ingredient[]> {
  const recipeIds = await listRecipeIds();

  if (recipeIds.length === 0) {
    return [];
  }

  const ingredientsByRecipe = await Promise.all(
    recipeIds.map(async (recipeId) => {
      const [fermentables, hops, yeasts] = await Promise.all([
        listFermentablesByRecipe(recipeId),
        listHopsByRecipe(recipeId),
        listYeastsByRecipe(recipeId),
      ]);

      return [
        ...fermentables.map(mapFermentableToIngredient),
        ...hops.map(mapHopToIngredient),
        ...yeasts.map(mapYeastToIngredient),
      ];
    }),
  );

  return deduplicateIngredients(ingredientsByRecipe.flat());
}

export async function listIngredientCategoriesSummaryApi(): Promise<
  IngredientCategorySummary[]
> {
  const ingredients = await listAllIngredients();
  return toIngredientCategorySummary(ingredients);
}

export async function listIngredientsByCategoryApi(
  category: IngredientCategory,
): Promise<Ingredient[]> {
  const ingredients = await listAllIngredients();
  return ingredients.filter((item) => item.category === category);
}

export async function getIngredientDetailsApi(
  category: IngredientCategory,
  ingredientId: string,
): Promise<Ingredient | null> {
  if (!ingredientId) {
    return null;
  }

  const items = await listIngredientsByCategoryApi(category);
  return items.find((item) => item.id === ingredientId) ?? null;
}
