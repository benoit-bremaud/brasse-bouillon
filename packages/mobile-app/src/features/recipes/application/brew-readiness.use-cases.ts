import type {
  ChecklistItem,
  ReadinessChecklist,
} from "@/features/recipes/domain/brew-readiness.types";
import type { RecipeDetailsIngredientItem } from "@/features/recipes/application/recipes.use-cases";
import { formatQuantity } from "@/features/recipes/presentation/recipe-details.utils";

/**
 * Brew-preparation readiness use-cases (build slice A2 — ingredient checklist).
 *
 * Pure functions over the already-normalised recipe ingredients. The demo vs
 * live divergence is resolved upstream by `getRecipeDetailsViewModel`, so this
 * layer never branches on `dataSource` — it only transforms the ingredient
 * list into the readiness model from the brew-prep class diagram (#1248).
 */

/**
 * Build the ingredient readiness checklist from a recipe's ingredients.
 *
 * Every recipe ingredient is `required` (the recipe-ingredient rows carry no
 * optional flag); items start `have: false` — the brewer ticks what they
 * already have. The `id` is composited from the ingredient + its timing +
 * index so two additions of the same ingredient (different timings) stay
 * distinct keys (mirrors the IngredientsTab row-key recipe).
 */
export function buildIngredientChecklist(
  ingredients: readonly RecipeDetailsIngredientItem[],
): ReadinessChecklist {
  const items: ChecklistItem[] = ingredients.map((ingredient, index) => ({
    id: `${ingredient.ingredientId}-${ingredient.timing ?? "no-timing"}-${index}`,
    name: ingredient.name,
    qty: formatQuantity(ingredient.amount, ingredient.unit),
    required: true,
    have: false,
  }));

  return { kind: "ingredient", items };
}

/**
 * Realises `ReadinessChecklist.isComplete()`: every required item is had.
 * Non-required items never block (forward-compat for a future optional-item
 * notion). An empty checklist is vacuously complete (nothing is missing).
 */
export function isChecklistComplete(checklist: ReadinessChecklist): boolean {
  return checklist.items.every((item) => !item.required || item.have);
}

/** The required items still missing — drives the "what's missing" recap. */
export function getMissingItems(
  checklist: ReadinessChecklist,
): readonly ChecklistItem[] {
  return checklist.items.filter((item) => item.required && !item.have);
}
