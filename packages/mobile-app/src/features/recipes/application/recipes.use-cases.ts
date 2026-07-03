import {
  deleteRecipe,
  getMineById,
  importFromCommunity,
  listMine,
  listPublic,
  listSteps,
} from "@/features/recipes/data/recipes.api";
import {
  listRecipeAdditives,
  listRecipeFermentables,
  listRecipeHops,
  listRecipeYeasts,
} from "@/features/recipes/data/recipe-ingredients.api";
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
  // Denormalised display fields (#1134). In demo mode they mirror the
  // resolved catalog `ingredient`; in live mode they come straight from
  // the recipe-ingredient sub-resource rows (which carry their own name),
  // and `ingredient` stays null (no catalog deep-link available live).
  name: string;
  category: "malt" | "hop" | "yeast" | "other";
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
  // « Mes recettes » = owned only. A demo recipe without an `ownerId` is a
  // community recipe: it is excluded here and surfaces in « Découvrir » via
  // `listPublicRecipes` (e.g. "Blonde de la Communauté", r-demo-community-1).
  return dataSource.useDemoData
    ? demoRecipes.filter((recipe) => recipe.ownerId != null)
    : listMine();
}

/**
 * Issue #779 — Recipe Catalog mini.
 *
 * Lists every PUBLIC recipe regardless of owner — the discovery
 * surface that fills the empty Mon Carnet for new users (Léa,
 * Nicolas) before they have brewed anything themselves. In demo
 * mode, falls back to the same `demoRecipes` mock the rest of the
 * app uses (filtered to public visibility).
 */
export async function listPublicRecipes(): Promise<Recipe[]> {
  if (dataSource.useDemoData) {
    return demoRecipes.filter((recipe) => recipe.visibility === "public");
  }
  return listPublic();
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

export type ImportRecipeResult = {
  recipeId: string;
  name: string;
};

/**
 * Pick the right recipe id to send to `importRecipeFromCommunity`
 * depending on the active data source (Issue #701).
 *
 * - Demo mode (`useDemoData=true`) → returns `match.recipeId`
 *   (e.g. 'r-demo-1') so the local-only flow looks up `demoRecipes`.
 * - Backend mode → returns `match.publicRecipeId` (UUID) which
 *   references a row in the `recipes` table seeded by
 *   `public-recipes.seed.ts`. Falls back to `match.recipeId` if
 *   `publicRecipeId` is missing (legacy / partial mocks) — the
 *   import will then sad-path with 404 as before.
 */
export function getImportSourceId(match: {
  recipeId: string;
  publicRecipeId?: string;
}): string {
  if (dataSource.useDemoData) {
    return match.recipeId;
  }
  return match.publicRecipeId ?? match.recipeId;
}

/**
 * Import a community (PUBLIC or UNLISTED) recipe into the current
 * user's catalog. In demo mode, simulates the backend by returning
 * the source recipe id (which already lives in `demoRecipes`) so
 * the screen can navigate to a resolvable detail page without a
 * real API call.
 */
export async function importRecipeFromCommunity(
  sourceId: string,
): Promise<ImportRecipeResult> {
  if (dataSource.useDemoData) {
    const source = demoRecipes.find((item) => item.id === sourceId);
    if (!source) {
      throw new Error(`Demo recipe not found: ${sourceId}`);
    }
    return { recipeId: source.id, name: source.name };
  }
  const imported = await importFromCommunity(sourceId);
  return { recipeId: imported.id, name: imported.name };
}

/**
 * Delete one of the current user's recipes from « Mon Carnet ». In demo mode
 * this is a no-op — the bundled demo catalog is read-only.
 */
export async function deleteRecipeFromCarnet(recipeId: string): Promise<void> {
  if (dataSource.useDemoData) {
    return;
  }
  await deleteRecipe(recipeId);
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

  // Demo: resolve each recipe ingredient ref against the bundled catalog.
  // Live (#1134): the recipe DTO never inlines ingredients — fetch the
  // per-type sub-resources, which are self-describing (name + weight).
  const ingredients = dataSource.useDemoData
    ? (recipe.ingredients ?? []).map((ref): RecipeDetailsIngredientItem => {
        const ingredient =
          demoIngredients.find((item) => item.id === ref.ingredientId) ?? null;
        return {
          ingredientId: ref.ingredientId,
          name: ingredient?.name ?? "Ingrédient inconnu",
          category: ingredient?.category ?? "other",
          amount: ref.amount,
          unit: ref.unit,
          timing: ref.timing,
          notes: ref.notes,
          ingredient,
        };
      })
    : await buildLiveRecipeIngredients(recipeId);

  // Equipment: demo only — there is no recipe↔equipment link in the live
  // API yet, so live recipes surface no equipment (#1134, out of scope).
  const equipment = dataSource.useDemoData
    ? (recipe.equipment ?? []).map((ref) => ({
        equipmentId: ref.equipmentId,
        role: ref.role,
        notes: ref.notes,
        equipment:
          demoEquipments.find((item) => item.id === ref.equipmentId) ?? null,
      }))
    : [];

  return {
    recipe,
    steps,
    ingredients,
    equipment,
  };
}

/**
 * Live recipe ingredients (#1134) — aggregates the four self-describing
 * sub-resources into the unified view-model item shape. `ingredient`
 * stays null (the rows are denormalised; the live DTOs expose no catalog
 * id, so there is no deep-link). Additives fall in the "other" group.
 */
async function buildLiveRecipeIngredients(
  recipeId: string,
): Promise<RecipeDetailsIngredientItem[]> {
  // The ingredient sub-resource endpoints are owner-only (the backend
  // asserts ownership on every read), so a non-owner viewing a PUBLIC
  // recipe gets a 403/404. Degrade each fetch to an empty list instead of
  // failing the whole detail view — the recipe still renders, just without
  // that section. Surfacing ingredients for public recipes needs a
  // public-readable endpoint (tracked under #1134's backend half).
  const orEmpty = <T>(rows: Promise<T[]>): Promise<T[]> =>
    rows.catch(() => [] as T[]);
  const [fermentables, hops, yeasts, additives] = await Promise.all([
    orEmpty(listRecipeFermentables(recipeId)),
    orEmpty(listRecipeHops(recipeId)),
    orEmpty(listRecipeYeasts(recipeId)),
    orEmpty(listRecipeAdditives(recipeId)),
  ]);

  const malts: RecipeDetailsIngredientItem[] = fermentables.map((row) => ({
    ingredientId: row.id,
    name: row.name,
    category: "malt",
    amount: row.weightG / 1000,
    unit: "kg",
    ingredient: null,
  }));

  const hopItems: RecipeDetailsIngredientItem[] = hops.map((row) => ({
    ingredientId: row.id,
    name: row.variety,
    category: "hop",
    amount: row.weightG,
    unit: "g",
    timing:
      row.additionTimeMin != null
        ? `${row.additionStage} · ${row.additionTimeMin} min`
        : row.additionStage,
    ingredient: null,
  }));

  const yeastItems: RecipeDetailsIngredientItem[] = yeasts.map((row) => ({
    ingredientId: row.id,
    name: row.name,
    category: "yeast",
    amount: row.amountG,
    unit: "g",
    ingredient: null,
  }));

  const additiveItems: RecipeDetailsIngredientItem[] = additives.map((row) => ({
    ingredientId: row.id,
    name: row.name,
    category: "other",
    amount: row.amountG,
    unit: "g",
    ingredient: null,
  }));

  return [...malts, ...hopItems, ...yeastItems, ...additiveItems];
}
