import {
    getIngredientDetails,
    listIngredientCategoriesSummary,
    listIngredientsByCategory,
} from "@/features/ingredients/application/ingredients.use-cases";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

describe("ingredients use-cases", () => {
  it("returns categories summary with counts", async () => {
    const summary = await listIngredientCategoriesSummary();

    expect(summary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "malt" }),
        expect.objectContaining({ category: "hop" }),
        expect.objectContaining({ category: "yeast" }),
      ]),
    );

    const total = summary.reduce((acc, item) => acc + item.count, 0);
    expect(total).toBeGreaterThan(0);
  });

  it("filters malts by search and EBC range", async () => {
    const results = await listIngredientsByCategory("malt", {
      search: "malt",
      ebcMin: 5,
      ebcMax: 30,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((item) => item.category === "malt")).toBe(true);
    expect(
      results.every(
        (item) => item.category === "malt" && item.ebc >= 5 && item.ebc <= 30,
      ),
    ).toBe(true);
  });

  it("filters hops by minimum alpha acids", async () => {
    const results = await listIngredientsByCategory("hop", {
      alphaAcidMin: 10,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((item) => item.category === "hop" && item.alphaAcid >= 10),
    ).toBe(true);
  });

  it("returns ingredient details for matching category and id", async () => {
    const details = await getIngredientDetails("yeast", "yeast-1");

    expect(details).toBeTruthy();
    expect(details?.category).toBe("yeast");
    expect(details?.name).toContain("US-05");
  });

  it("returns null when id exists in another category", async () => {
    const details = await getIngredientDetails("malt", "hop-1");

    expect(details).toBeNull();
  });
});
