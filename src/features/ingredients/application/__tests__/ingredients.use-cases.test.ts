import {
  getIngredientDetails,
  listIngredientCategoriesSummary,
  listIngredientsByCategory,
} from "@/features/ingredients/application/ingredients.use-cases";
import {
  getIngredientDetailsApi,
  listIngredientCategoriesSummaryApi,
  listIngredientsByCategoryApi,
} from "@/features/ingredients/data/ingredients.api";

import { dataSource } from "@/core/data/data-source";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/ingredients/data/ingredients.api", () => ({
  listIngredientCategoriesSummaryApi: jest.fn(),
  listIngredientsByCategoryApi: jest.fn(),
  getIngredientDetailsApi: jest.fn(),
}));

const mockedListIngredientCategoriesSummaryApi =
  listIngredientCategoriesSummaryApi as jest.MockedFunction<
    typeof listIngredientCategoriesSummaryApi
  >;
const mockedListIngredientsByCategoryApi =
  listIngredientsByCategoryApi as jest.MockedFunction<
    typeof listIngredientsByCategoryApi
  >;
const mockedGetIngredientDetailsApi =
  getIngredientDetailsApi as jest.MockedFunction<
    typeof getIngredientDetailsApi
  >;

describe("ingredients use-cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedListIngredientCategoriesSummaryApi.mockReset();
    mockedListIngredientsByCategoryApi.mockReset();
    mockedGetIngredientDetailsApi.mockReset();
  });

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
    expect(mockedListIngredientCategoriesSummaryApi).not.toHaveBeenCalled();
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
    expect(mockedGetIngredientDetailsApi).not.toHaveBeenCalled();
  });

  it("uses live categories API when demo data is disabled", async () => {
    dataSource.useDemoData = false;
    mockedListIngredientCategoriesSummaryApi.mockResolvedValue([
      { category: "malt", count: 2 },
      { category: "hop", count: 1 },
      { category: "yeast", count: 1 },
    ]);

    const summary = await listIngredientCategoriesSummary();

    expect(mockedListIngredientCategoriesSummaryApi).toHaveBeenCalledTimes(1);
    expect(summary).toEqual([
      { category: "malt", count: 2 },
      { category: "hop", count: 1 },
      { category: "yeast", count: 1 },
    ]);
  });

  it("uses live category API and still applies filters", async () => {
    dataSource.useDemoData = false;
    mockedListIngredientsByCategoryApi.mockResolvedValue([
      {
        id: "hop-citra",
        name: "Citra",
        category: "hop",
        form: "pellet",
        hopUse: "aroma",
        alphaAcid: 12,
        betaAcid: 4,
      },
      {
        id: "hop-saaz",
        name: "Saaz",
        category: "hop",
        form: "whole",
        hopUse: "aroma",
        alphaAcid: 3,
        betaAcid: 4,
      },
    ]);

    const results = await listIngredientsByCategory("hop", {
      search: "cit",
      alphaAcidMin: 10,
    });

    expect(mockedListIngredientsByCategoryApi).toHaveBeenCalledWith("hop");
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "hop-citra", name: "Citra" });
  });

  it("uses live ingredient details API when demo data is disabled", async () => {
    dataSource.useDemoData = false;
    mockedGetIngredientDetailsApi.mockResolvedValue({
      id: "yeast-us05",
      name: "US-05",
      category: "yeast",
      yeastType: "ale",
      attenuationMin: 76,
      attenuationMax: 80,
      flocculation: "medium",
      fermentationMinC: 18,
      fermentationMaxC: 22,
    });

    const details = await getIngredientDetails("yeast", "yeast-us05");

    expect(mockedGetIngredientDetailsApi).toHaveBeenCalledWith(
      "yeast",
      "yeast-us05",
    );
    expect(details).toMatchObject({ id: "yeast-us05", name: "US-05" });
  });

  it("returns null when ingredient id is empty", async () => {
    dataSource.useDemoData = false;

    const details = await getIngredientDetails("yeast", "");

    expect(details).toBeNull();
    expect(mockedGetIngredientDetailsApi).not.toHaveBeenCalled();
  });
});
