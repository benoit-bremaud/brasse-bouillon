import type { ReadinessChecklist } from "@/features/recipes/domain/brew-readiness.types";
import type { RecipeDetailsIngredientItem } from "@/features/recipes/application/recipes.use-cases";
import {
  buildIngredientChecklist,
  getMissingItems,
  isChecklistComplete,
} from "@/features/recipes/application/brew-readiness.use-cases";

function makeIngredient(
  overrides: Partial<RecipeDetailsIngredientItem> = {},
): RecipeDetailsIngredientItem {
  return {
    ingredientId: "ferm-1",
    name: "Pilsner Malt",
    category: "malt",
    amount: 0.9,
    unit: "kg",
    timing: null,
    notes: null,
    ingredient: null,
    ...overrides,
  };
}

describe("brew-readiness use-cases (A2)", () => {
  describe("buildIngredientChecklist", () => {
    it("happy: maps ingredients to a required, unchecked ingredient checklist", () => {
      const checklist = buildIngredientChecklist([
        makeIngredient({ ingredientId: "ferm-1", name: "Pilsner Malt" }),
        makeIngredient({
          ingredientId: "hop-1",
          name: "Cascade",
          category: "hop",
          amount: 5,
          unit: "g",
        }),
      ]);

      expect(checklist.kind).toBe("ingredient");
      expect(checklist.items).toHaveLength(2);
      expect(checklist.items[0]).toMatchObject({
        name: "Pilsner Malt",
        qty: "0.9 kg",
        required: true,
        have: false,
      });
      expect(checklist.items[1]).toMatchObject({ name: "Cascade", qty: "5 g" });
    });

    it("sad: returns an empty ingredient checklist for no ingredients", () => {
      expect(buildIngredientChecklist([])).toEqual({
        kind: "ingredient",
        items: [],
      });
    });

    it("edge: the same ingredient at two timings yields distinct item ids", () => {
      const checklist = buildIngredientChecklist([
        makeIngredient({
          ingredientId: "hop-1",
          name: "Cascade",
          category: "hop",
          timing: "boil 60 min",
        }),
        makeIngredient({
          ingredientId: "hop-1",
          name: "Cascade",
          category: "hop",
          timing: "flameout",
        }),
      ]);

      const [first, second] = checklist.items;
      expect(first.id).not.toBe(second.id);
    });
  });

  describe("isChecklistComplete", () => {
    it("happy: true when every required item is had", () => {
      const checklist: ReadinessChecklist = {
        kind: "ingredient",
        items: [
          { id: "a", name: "A", qty: "1 kg", required: true, have: true },
          { id: "b", name: "B", qty: "2 g", required: true, have: true },
        ],
      };
      expect(isChecklistComplete(checklist)).toBe(true);
    });

    it("sad: false when a required item is missing", () => {
      const checklist: ReadinessChecklist = {
        kind: "ingredient",
        items: [
          { id: "a", name: "A", qty: "1 kg", required: true, have: true },
          { id: "b", name: "B", qty: "2 g", required: true, have: false },
        ],
      };
      expect(isChecklistComplete(checklist)).toBe(false);
    });

    it("edge: an empty checklist is vacuously complete", () => {
      expect(isChecklistComplete({ kind: "ingredient", items: [] })).toBe(true);
    });

    it("edge: a non-required unchecked item does not block completion", () => {
      const checklist: ReadinessChecklist = {
        kind: "ingredient",
        items: [
          { id: "a", name: "A", qty: "1 kg", required: true, have: true },
          { id: "b", name: "B", qty: "2 g", required: false, have: false },
        ],
      };
      expect(isChecklistComplete(checklist)).toBe(true);
    });
  });

  describe("getMissingItems", () => {
    it("returns only the required, not-yet-had items", () => {
      const checklist: ReadinessChecklist = {
        kind: "ingredient",
        items: [
          { id: "a", name: "A", qty: "1 kg", required: true, have: true },
          { id: "b", name: "B", qty: "2 g", required: true, have: false },
          { id: "c", name: "C", qty: "3 g", required: false, have: false },
        ],
      };
      const missing = getMissingItems(checklist);
      expect(missing).toHaveLength(1);
      expect(missing[0].name).toBe("B");
    });

    it("returns nothing when the checklist is complete", () => {
      const checklist: ReadinessChecklist = {
        kind: "ingredient",
        items: [
          { id: "a", name: "A", qty: "1 kg", required: true, have: true },
        ],
      };
      expect(getMissingItems(checklist)).toHaveLength(0);
    });
  });
});
