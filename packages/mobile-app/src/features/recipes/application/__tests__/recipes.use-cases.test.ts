import {
  getRecipeDetailsViewModel,
  listPublicRecipes,
} from "@/features/recipes/application/recipes.use-cases";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

describe("recipes use-cases — listPublicRecipes (Issue #779)", () => {
  // happy: in demo mode, returns only the recipes whose visibility
  // is "public" — the discovery surface of the CatalogScreen must
  // never expose private or unlisted recipes from the local mocks.
  it("happy: returns only PUBLIC recipes from the demo seed", async () => {
    const recipes = await listPublicRecipes();

    expect(recipes.length).toBeGreaterThan(0);
    for (const recipe of recipes) {
      expect(recipe.visibility).toBe("public");
    }
  });

  // sad: every recipe returned has the well-formed shape the
  // CatalogScreen relies on (id, name, ownerId, visibility).
  it("sad: every returned recipe carries the minimum shape the screen relies on", async () => {
    const recipes = await listPublicRecipes();

    for (const recipe of recipes) {
      expect(recipe.id).toBeTruthy();
      expect(recipe.name).toBeTruthy();
      expect(recipe.ownerId).toBeTruthy();
    }
  });

  // edge: no PRIVATE or UNLISTED recipe leaks even when the demo
  // seed contains some.
  it("edge: never leaks PRIVATE or UNLISTED recipes", async () => {
    const recipes = await listPublicRecipes();

    expect(recipes.find((r) => r.visibility === "private")).toBeUndefined();
    expect(recipes.find((r) => r.visibility === "unlisted")).toBeUndefined();
  });
});

describe("recipes use-cases", () => {
  it("returns an enriched recipe details view model", async () => {
    const viewModel = await getRecipeDetailsViewModel("r-demo-1");

    expect(viewModel).toBeTruthy();
    expect(viewModel?.recipe.id).toBe("r-demo-1");
    expect(viewModel?.recipe.stats?.ibu).toBeGreaterThan(0);

    expect(viewModel?.ingredients.length).toBeGreaterThan(0);
    expect(viewModel?.ingredients[0].ingredient).toBeTruthy();

    expect(viewModel?.equipment.length).toBeGreaterThan(0);
    expect(viewModel?.equipment[0].equipment).toBeTruthy();

    const stepOrders = viewModel?.steps.map((step) => step.stepOrder) ?? [];
    expect(stepOrders).toEqual([...stepOrders].sort((a, b) => a - b));
  });

  it("returns null when recipe id is missing", async () => {
    const viewModel = await getRecipeDetailsViewModel("");
    expect(viewModel).toBeNull();
  });
});
