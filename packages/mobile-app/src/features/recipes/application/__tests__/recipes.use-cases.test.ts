import { getRecipeDetailsViewModel } from "@/features/recipes/application/recipes.use-cases";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

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
