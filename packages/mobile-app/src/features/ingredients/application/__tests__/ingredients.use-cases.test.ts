import {
  getIngredientDetails,
  listIngredientCategoriesSummary,
  listIngredientsByCategory,
} from "@/features/ingredients/application/ingredients.use-cases";
import {
  getHopDetails,
  listHops,
} from "@/features/ingredients/application/hops.use-cases";
import {
  getMaltDetails,
  listMalts,
} from "@/features/ingredients/application/malts.use-cases";
import {
  getYeastDetails,
  listYeasts,
} from "@/features/ingredients/application/yeasts.use-cases";

import { HopProduct } from "@/features/ingredients/domain/hop.types";
import { MaltProduct } from "@/features/ingredients/domain/malt.types";
import { YeastProduct } from "@/features/ingredients/domain/yeast.types";
import { dataSource } from "@/core/data/data-source";
import { demoIngredients, demoMalts } from "@/mocks/demo-data";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/ingredients/application/malts.use-cases", () => ({
  listMalts: jest.fn(),
  getMaltDetails: jest.fn(),
}));

jest.mock("@/features/ingredients/application/hops.use-cases", () => ({
  listHops: jest.fn(),
  getHopDetails: jest.fn(),
}));

jest.mock("@/features/ingredients/application/yeasts.use-cases", () => ({
  listYeasts: jest.fn(),
  getYeastDetails: jest.fn(),
}));

const mockedListMalts = listMalts as jest.MockedFunction<typeof listMalts>;
const mockedGetMaltDetails = getMaltDetails as jest.MockedFunction<
  typeof getMaltDetails
>;
const mockedListHops = listHops as jest.MockedFunction<typeof listHops>;
const mockedGetHopDetails = getHopDetails as jest.MockedFunction<
  typeof getHopDetails
>;
const mockedListYeasts = listYeasts as jest.MockedFunction<typeof listYeasts>;
const mockedGetYeastDetails = getYeastDetails as jest.MockedFunction<
  typeof getYeastDetails
>;

function buildHopProduct(overrides: Partial<HopProduct> = {}): HopProduct {
  return {
    id: "hop-citra-uuid",
    slug: "citra",
    name: "Citra",
    hopType: "aroma",
    specGroups: [
      {
        id: "hop-acids-group",
        title: "Acids & stability",
        rows: [
          { id: "hop-alpha-acid", label: "Alpha", value: "12", unit: "%" },
        ],
      },
    ],
    ...overrides,
  };
}

function buildMaltProduct(overrides: Partial<MaltProduct> = {}): MaltProduct {
  return {
    id: "malt-pilsen-uuid",
    slug: "pilsner-malt",
    name: "Pilsner Malt",
    maltType: "base",
    specGroups: [
      {
        id: "malt-color-group",
        title: "Color & yield",
        rows: [
          {
            id: "malt-color-ebc",
            label: "Color (EBC)",
            value: "3",
            unit: "EBC",
          },
        ],
      },
    ],
    ...overrides,
  };
}

function buildYeastProduct(
  overrides: Partial<YeastProduct> = {},
): YeastProduct {
  return {
    id: "yeast-us05-uuid",
    slug: "safale-us-05",
    name: "Safale US-05",
    yeastType: "ale",
    specGroups: [
      {
        id: "yeast-fermentation-group",
        title: "Fermentation",
        rows: [
          {
            id: "yeast-attenuation",
            label: "Attenuation",
            value: "78",
            unit: "%",
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("ingredients use-cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedListMalts.mockReset();
    mockedGetMaltDetails.mockReset();
    mockedListHops.mockReset();
    mockedGetHopDetails.mockReset();
    mockedListYeasts.mockReset();
    mockedGetYeastDetails.mockReset();
  });

  describe("listIngredientCategoriesSummary", () => {
    // Happy path — regression guard for issue #623.
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

      expect(mockedListMalts).not.toHaveBeenCalled();
      expect(mockedListHops).not.toHaveBeenCalled();
      expect(mockedListYeasts).not.toHaveBeenCalled();
    });

    // Sad path — API failure should propagate.
    it("propagates per-category errors in live mode instead of falling back silently", async () => {
      dataSource.useDemoData = false;
      mockedListMalts.mockResolvedValue([]);
      mockedListHops.mockResolvedValue([]);
      mockedListYeasts.mockRejectedValue(new Error("upstream 500"));

      await expect(listIngredientCategoriesSummary()).rejects.toThrow(
        "upstream 500",
      );
    });

    // Edge case — always returns the 3 expected categories.
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

  it("filters malts by search and EBC range (demo mode)", async () => {
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

  it("filters hops by minimum alpha acids (demo mode)", async () => {
    const results = await listIngredientsByCategory("hop", {
      alphaAcidMin: 10,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((item) => item.category === "hop" && item.alphaAcid >= 10),
    ).toBe(true);
  });

  it("returns ingredient details for matching category and id (demo mode)", async () => {
    const details = await getIngredientDetails("yeast", "yeast-1");

    expect(details).toBeTruthy();
    expect(details?.category).toBe("yeast");
    expect(details?.name).toContain("US-05");
  });

  it("returns null when id exists in another category (demo mode)", async () => {
    const details = await getIngredientDetails("malt", "hop-1");

    expect(details).toBeNull();
    expect(mockedGetMaltDetails).not.toHaveBeenCalled();
  });

  describe("live mode delegation (Issue #887)", () => {
    it("delegates the categories summary to the per-category use-cases", async () => {
      dataSource.useDemoData = false;
      mockedListMalts.mockResolvedValue([
        buildMaltProduct(),
        buildMaltProduct(),
      ]);
      mockedListHops.mockResolvedValue([buildHopProduct()]);
      mockedListYeasts.mockResolvedValue([buildYeastProduct()]);

      const summary = await listIngredientCategoriesSummary();

      expect(mockedListMalts).toHaveBeenCalledTimes(1);
      expect(mockedListHops).toHaveBeenCalledTimes(1);
      expect(mockedListYeasts).toHaveBeenCalledTimes(1);
      expect(summary).toEqual([
        { category: "malt", count: 2 },
        { category: "hop", count: 1 },
        { category: "yeast", count: 1 },
      ]);
    });

    it("delegates the hop list to listHops + maps HopProduct to Ingredient", async () => {
      dataSource.useDemoData = false;
      mockedListHops.mockResolvedValue([
        buildHopProduct({
          id: "hop-citra-uuid",
          name: "Citra",
          specGroups: [
            {
              id: "hop-acids-group",
              title: "Acids & stability",
              rows: [
                {
                  id: "hop-alpha-acid",
                  label: "Alpha",
                  value: "12",
                  unit: "%",
                },
              ],
            },
          ],
        }),
        buildHopProduct({
          id: "hop-saaz-uuid",
          name: "Saaz",
          specGroups: [
            {
              id: "hop-acids-group",
              title: "Acids & stability",
              rows: [
                {
                  id: "hop-alpha-acid",
                  label: "Alpha",
                  value: "3",
                  unit: "%",
                },
              ],
            },
          ],
        }),
      ]);

      const results = await listIngredientsByCategory("hop", {
        search: "cit",
        alphaAcidMin: 10,
      });

      expect(mockedListHops).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        id: "hop-citra-uuid",
        name: "Citra",
        category: "hop",
      });
      // Live IDs are real UUIDs from the catalogue, not synthetic
      // `hop-citra` strings — this is the regression guard for the
      // post Issue #887 cleanup that removed the legacy
      // `ingredients.api.ts` recipe-crawl path.
      expect(results[0].id).toBe("hop-citra-uuid");
    });

    it("delegates yeast details to getYeastDetails + maps to Ingredient", async () => {
      dataSource.useDemoData = false;
      mockedGetYeastDetails.mockResolvedValue(
        buildYeastProduct({
          id: "yeast-us05-uuid",
          name: "Safale US-05",
        }),
      );

      const details = await getIngredientDetails("yeast", "yeast-us05-uuid");

      expect(mockedGetYeastDetails).toHaveBeenCalledWith("yeast-us05-uuid");
      expect(details).toMatchObject({
        id: "yeast-us05-uuid",
        name: "Safale US-05",
        category: "yeast",
      });
    });

    it("returns null when ingredient id is empty", async () => {
      dataSource.useDemoData = false;

      const details = await getIngredientDetails("yeast", "");

      expect(details).toBeNull();
      expect(mockedGetYeastDetails).not.toHaveBeenCalled();
    });
  });
});
