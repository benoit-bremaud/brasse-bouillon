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
import { demoIngredients, demoMalts } from "@/mocks/demo-data";

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

  describe("listIngredientCategoriesSummary", () => {
    // Happy path — regression guard for issue #623.
    // The counter must match the source each category list SCREEN consumes:
    //   malt → demoMalts (via listMalts)
    //   hop → demoIngredients (via listIngredientsByCategory)
    //   yeast → demoIngredients (via listIngredientsByCategory)
    it("returns demo counts aligned with each category's displayed source", async () => {
      const summary = await listIngredientCategoriesSummary();

      const byCategory = Object.fromEntries(
        summary.map((item) => [item.category, item.count] as const),
      );

      expect(byCategory).toEqual({
        malt: demoMalts.length,
        hop: demoIngredients.filter((item) => item.category === "hop").length,
        yeast: demoIngredients.filter((item) => item.category === "yeast")
          .length,
      });

      expect(mockedListIngredientCategoriesSummaryApi).not.toHaveBeenCalled();
    });

    // Sad path — API failure should propagate (not be swallowed) so the
    // screen can render its error state.
    it("propagates API errors in live mode instead of falling back silently", async () => {
      dataSource.useDemoData = false;
      const apiError = new Error("upstream 500");
      mockedListIngredientCategoriesSummaryApi.mockRejectedValue(apiError);

      await expect(listIngredientCategoriesSummary()).rejects.toThrow(
        "upstream 500",
      );
      expect(mockedListIngredientCategoriesSummaryApi).toHaveBeenCalledTimes(1);
    });

    // Edge case — always returns the 3 expected categories (never drops one).
    it("always includes all three categories (malt, hop, yeast)", async () => {
      const summary = await listIngredientCategoriesSummary();

      expect(summary.map((item) => item.category).sort()).toEqual([
        "hop",
        "malt",
        "yeast",
      ]);
    });

    // Edge case — counts are non-negative integers.
    it("returns non-negative integer counts for every category", async () => {
      const summary = await listIngredientCategoriesSummary();

      for (const item of summary) {
        expect(Number.isInteger(item.count)).toBe(true);
        expect(item.count).toBeGreaterThanOrEqual(0);
      }
    });
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
