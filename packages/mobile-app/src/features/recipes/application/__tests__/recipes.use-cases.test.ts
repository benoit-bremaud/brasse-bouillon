import {
  getRecipeDetailsViewModel,
  listPublicRecipes,
  listRecipes,
} from "@/features/recipes/application/recipes.use-cases";
import { dataSource } from "@/core/data/data-source";
import { getMineById, listSteps } from "@/features/recipes/data/recipes.api";
import {
  listRecipeAdditives,
  listRecipeFermentables,
  listRecipeHops,
  listRecipeYeasts,
} from "@/features/recipes/data/recipe-ingredients.api";
import type { Recipe } from "@/features/recipes/domain/recipe.types";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/recipes/data/recipes.api", () => ({
  listMine: jest.fn(),
  listPublic: jest.fn(),
  getMineById: jest.fn(),
  listSteps: jest.fn(),
  importFromCommunity: jest.fn(),
}));

jest.mock("@/features/recipes/data/recipe-ingredients.api", () => ({
  listRecipeFermentables: jest.fn(),
  listRecipeHops: jest.fn(),
  listRecipeYeasts: jest.fn(),
  listRecipeAdditives: jest.fn(),
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

  // sad: every recipe returned has the well-formed shape the CatalogScreen
  // relies on (id, name, visibility). A public/community recipe legitimately
  // has NO ownerId — the backend strips it (ownerId present ⟺ owned), which is
  // exactly what drives « Ajouter à mon carnet » — so we do not require it here.
  it("sad: every returned recipe carries the minimum shape the screen relies on", async () => {
    const recipes = await listPublicRecipes();

    for (const recipe of recipes) {
      expect(recipe.id).toBeTruthy();
      expect(recipe.name).toBeTruthy();
      expect(recipe.visibility).toBe("public");
    }
  });

  it("keeps a community recipe (no ownerId) out of « Mes recettes » but in « Découvrir »", async () => {
    const mine = await listRecipes();
    const discover = await listPublicRecipes();

    expect(mine.some((r) => r.id === "r-demo-community-1")).toBe(false);
    expect(discover.some((r) => r.id === "r-demo-community-1")).toBe(true);
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
    expect(viewModel?.ingredients[0].name).toBeTruthy();

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

describe("getRecipeDetailsViewModel — live mode (#1134)", () => {
  const mockedGetMineById = getMineById as jest.MockedFunction<
    typeof getMineById
  >;
  const mockedListSteps = listSteps as jest.MockedFunction<typeof listSteps>;
  const mockedFermentables = listRecipeFermentables as jest.MockedFunction<
    typeof listRecipeFermentables
  >;
  const mockedHops = listRecipeHops as jest.MockedFunction<
    typeof listRecipeHops
  >;
  const mockedYeasts = listRecipeYeasts as jest.MockedFunction<
    typeof listRecipeYeasts
  >;
  const mockedAdditives = listRecipeAdditives as jest.MockedFunction<
    typeof listRecipeAdditives
  >;

  const liveRecipe: Recipe = {
    id: "r-live-1",
    name: "Live IPA",
    visibility: "public",
    version: 1,
    rootRecipeId: "r-live-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    stats: { ibu: 40, abv: 6, og: 1.06, fg: 1.012, volumeLiters: 20 },
  };

  beforeEach(() => {
    dataSource.useDemoData = false;
    mockedGetMineById.mockResolvedValue(liveRecipe);
    mockedListSteps.mockResolvedValue([]);
    mockedFermentables.mockResolvedValue([]);
    mockedHops.mockResolvedValue([]);
    mockedYeasts.mockResolvedValue([]);
    mockedAdditives.mockResolvedValue([]);
  });

  afterEach(() => {
    dataSource.useDemoData = true;
    jest.clearAllMocks();
  });

  it("happy: aggregates the four ingredient sub-resources into the view model", async () => {
    mockedFermentables.mockResolvedValue([
      { id: "f1", name: "Maris Otter", weightG: 5000 },
    ]);
    mockedHops.mockResolvedValue([
      {
        id: "h1",
        variety: "Citra",
        weightG: 30,
        additionStage: "boil",
        additionTimeMin: 10,
      },
    ]);
    mockedYeasts.mockResolvedValue([{ id: "y1", name: "US-05", amountG: 11 }]);
    mockedAdditives.mockResolvedValue([
      { id: "a1", name: "Whirlfloc", amountG: 2 },
    ]);

    const vm = await getRecipeDetailsViewModel("r-live-1");
    const items = vm?.ingredients ?? [];
    const byCat = Object.fromEntries(items.map((i) => [i.category, i]));

    expect(items).toHaveLength(4);
    expect(byCat.malt).toMatchObject({
      name: "Maris Otter",
      amount: 5,
      unit: "kg",
      ingredient: null,
    });
    expect(byCat.hop).toMatchObject({
      name: "Citra",
      amount: 30,
      unit: "g",
      timing: "boil · 10 min",
    });
    expect(byCat.yeast).toMatchObject({ name: "US-05", amount: 11, unit: "g" });
    expect(byCat.other).toMatchObject({
      name: "Whirlfloc",
      amount: 2,
      unit: "g",
    });
    // No recipe↔equipment link in the live API → equipment is empty.
    expect(vm?.equipment).toEqual([]);
  });

  it("sad: returns empty ingredients when the recipe has no ingredient rows", async () => {
    const vm = await getRecipeDetailsViewModel("r-live-1");

    expect(vm?.ingredients).toEqual([]);
    expect(vm?.equipment).toEqual([]);
  });

  it("edge: a hop with no addition time falls back to the stage label", async () => {
    mockedHops.mockResolvedValue([
      {
        id: "h2",
        variety: "Saaz",
        weightG: 20,
        additionStage: "dry-hop",
        additionTimeMin: null,
      },
    ]);

    const vm = await getRecipeDetailsViewModel("r-live-1");
    const hop = vm?.ingredients.find((i) => i.category === "hop");

    expect(hop?.timing).toBe("dry-hop");
  });

  it("edge: an owner-only sub-resource that 403s degrades to empty without breaking the view", async () => {
    // A non-owner viewing a PUBLIC recipe gets a 403 on the owner-only
    // ingredient endpoints. The failed section must degrade to empty, not
    // reject the whole detail view (keeps public recipes readable).
    mockedFermentables.mockRejectedValue(new Error("403 Forbidden"));
    mockedHops.mockResolvedValue([
      {
        id: "h1",
        variety: "Citra",
        weightG: 30,
        additionStage: "boil",
        additionTimeMin: 10,
      },
    ]);

    const vm = await getRecipeDetailsViewModel("r-live-1");
    const items = vm?.ingredients ?? [];

    expect(items.find((i) => i.category === "malt")).toBeUndefined();
    expect(items.find((i) => i.category === "hop")?.name).toBe("Citra");
  });
});
