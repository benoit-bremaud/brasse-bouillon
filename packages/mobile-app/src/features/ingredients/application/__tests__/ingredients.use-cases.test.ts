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
import {
  getMiscDetailsApi,
  listMiscApi,
  type MiscProduct,
} from "@/features/ingredients/data/misc.api";

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

// Misc dispatches straight to the api rather than through a per-type
// use-case (it has no demo-only path or filters of its own), so the boundary
// mocked here is the data module.
jest.mock("@/features/ingredients/data/misc.api", () => ({
  listMiscApi: jest.fn(),
  getMiscDetailsApi: jest.fn(),
}));

const mockedListMiscApi = listMiscApi as jest.MockedFunction<
  typeof listMiscApi
>;
const mockedGetMiscDetailsApi = getMiscDetailsApi as jest.MockedFunction<
  typeof getMiscDetailsApi
>;
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

function buildMiscProduct(overrides: Partial<MiscProduct> = {}): MiscProduct {
  return {
    id: "misc-whirlfloc-uuid",
    slug: "whirlfloc",
    name: "Whirlfloc",
    miscType: "fining",
    useAt: "boil",
    useFor: "Clarté",
    timeMin: 15,
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
    mockedListMiscApi.mockReset();
    mockedListMiscApi.mockResolvedValue([]);
    mockedGetMiscDetailsApi.mockReset();
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
        misc: demoIngredients.filter((item) => item.category === "misc").length,
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

    // Edge case — every rayon the shop can open must get a count, so the hub
    // never renders a live rayon with a missing badge.
    it("always includes every catalog category (malt, hop, yeast, misc)", async () => {
      const summary = await listIngredientCategoriesSummary();

      expect(summary.map((item) => item.category).sort()).toEqual([
        "hop",
        "malt",
        "misc",
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
      mockedListMiscApi.mockResolvedValue([buildMiscProduct()]);

      const summary = await listIngredientCategoriesSummary();

      expect(mockedListMalts).toHaveBeenCalledTimes(1);
      expect(mockedListHops).toHaveBeenCalledTimes(1);
      expect(mockedListYeasts).toHaveBeenCalledTimes(1);
      expect(mockedListMiscApi).toHaveBeenCalledTimes(1);
      expect(summary).toEqual([
        { category: "malt", count: 2 },
        { category: "hop", count: 1 },
        { category: "yeast", count: 1 },
        { category: "misc", count: 1 },
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

    // Misc dispatches straight to `listMiscApi` (no per-type use-case, see
    // `listLiveIngredientsByCategory`'s `case "misc"`), so the delegation
    // guard here mirrors the hop/yeast ones above but against the api mock.
    it("delegates the misc list to listMiscApi + maps MiscProduct to Ingredient", async () => {
      dataSource.useDemoData = false;
      mockedListMiscApi.mockResolvedValue([
        buildMiscProduct({
          id: "misc-whirlfloc-uuid",
          name: "Whirlfloc",
          miscType: "fining",
          useAt: "boil",
          useFor: "Clarté",
          timeMin: 15,
          description: "Clarifiant utilisé en fin d'ébullition.",
        }),
      ]);

      const results = await listIngredientsByCategory("misc");

      expect(mockedListMiscApi).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(1);
      // Full-shape assertion (not just toMatchObject) — miscToIngredient is
      // the flattest mapper (no specGroups to parse), so every field is a
      // straight passthrough worth pinning, including the
      // description → notes rename.
      expect(results[0]).toEqual({
        id: "misc-whirlfloc-uuid",
        name: "Whirlfloc",
        category: "misc",
        miscType: "fining",
        useAt: "boil",
        useFor: "Clarté",
        timeMin: 15,
        notes: "Clarifiant utilisé en fin d'ébullition.",
      });
    });

    // Edge case — an empty catalog page must not surface as an error or a
    // stale list; the Accessoires rayon should just render empty.
    it("returns an empty list when the misc catalog is empty", async () => {
      dataSource.useDemoData = false;
      mockedListMiscApi.mockResolvedValue([]);

      const results = await listIngredientsByCategory("misc");

      expect(mockedListMiscApi).toHaveBeenCalledTimes(1);
      expect(results).toEqual([]);
    });

    it("delegates misc details to getMiscDetailsApi + maps to Ingredient", async () => {
      dataSource.useDemoData = false;
      mockedGetMiscDetailsApi.mockResolvedValue(
        buildMiscProduct({
          id: "misc-whirlfloc-uuid",
          name: "Whirlfloc",
        }),
      );

      const details = await getIngredientDetails("misc", "misc-whirlfloc-uuid");

      expect(mockedGetMiscDetailsApi).toHaveBeenCalledWith(
        "misc-whirlfloc-uuid",
      );
      expect(details).toMatchObject({
        id: "misc-whirlfloc-uuid",
        name: "Whirlfloc",
        category: "misc",
      });
    });

    // Sad path — a missing id resolves to null rather than throwing, same
    // contract as getMaltDetails/getHopDetails/getYeastDetails on a 404.
    it("returns null when the misc id does not resolve to a catalog product", async () => {
      dataSource.useDemoData = false;
      mockedGetMiscDetailsApi.mockResolvedValue(null);

      const details = await getIngredientDetails("misc", "misc-unknown-uuid");

      expect(mockedGetMiscDetailsApi).toHaveBeenCalledWith("misc-unknown-uuid");
      expect(details).toBeNull();
    });
  });

  describe("type adapter coverage (live mode)", () => {
    beforeEach(() => {
      dataSource.useDemoData = false;
    });

    // ─── maltToIngredient — exercise normalizeMaltType branches ───
    it.each([
      ["Caramel 60", "caramel"],
      ["Crystal 120", "caramel"],
      ["Roasted Barley", "roasted"],
      ["Chocolate Malt", "roasted"],
      ["Pilsner Base", "base"],
      ["Pale Ale", "base"],
      ["Acidulated", "specialty"],
    ] as const)(
      "maltToIngredient normalizes maltType %s → %s",
      async (raw, expected) => {
        mockedListMalts.mockResolvedValue([
          buildMaltProduct({ maltType: raw }),
        ]);
        const [result] = await listIngredientsByCategory("malt");
        expect(result.category).toBe("malt");
        if (result.category === "malt") {
          expect(result.maltType).toBe(expected);
        }
      },
    );

    // ─── maltToIngredient — fallback potential gravity ───
    it("maltToIngredient falls back to default gravity when missing", async () => {
      mockedListMalts.mockResolvedValue([buildMaltProduct({ specGroups: [] })]);
      const [result] = await listIngredientsByCategory("malt");
      if (result.category === "malt") {
        expect(result.ebc).toBe(0);
        expect(result.potentialSg).toBeCloseTo(1.03, 5);
      }
    });

    // ─── hopToIngredient — exercise normalizeHopUse branches ───
    it.each([
      ["bittering", "bittering"],
      ["both", "dual"],
      ["dual-purpose", "dual"],
      ["aroma", "aroma"],
      [undefined, "aroma"],
    ] as const)(
      "hopToIngredient normalizes hopType %s → %s",
      async (raw, expected) => {
        mockedListHops.mockResolvedValue([buildHopProduct({ hopType: raw })]);
        const [result] = await listIngredientsByCategory("hop");
        if (result.category === "hop") {
          expect(result.hopUse).toBe(expected);
        }
      },
    );

    // ─── hopToIngredient — exercise normalizeHopForm via specGroups ───
    it.each([
      ["pellet", "pellet"],
      ["leaf", "whole"],
      ["whole", "whole"],
    ] as const)(
      "hopToIngredient reads form '%s' from Format specGroup → %s",
      async (formValue, expected) => {
        mockedListHops.mockResolvedValue([
          buildHopProduct({
            specGroups: [
              {
                id: "hop-format-group",
                title: "Format",
                rows: [{ id: "hop-form", label: "Form", value: formValue }],
              },
            ],
          }),
        ]);
        const [result] = await listIngredientsByCategory("hop");
        if (result.category === "hop") {
          expect(result.form).toBe(expected);
        }
      },
    );

    // ─── yeastToIngredient — exercise normalizeYeastType branches ───
    it.each([
      ["lager", "lager"],
      ["wheat", "wheat"],
      ["wine", "belgian"],
      ["champagne", "belgian"],
      ["ale", "ale"],
      [undefined, "ale"],
    ] as const)(
      "yeastToIngredient normalizes yeastType %s → %s",
      async (raw, expected) => {
        mockedListYeasts.mockResolvedValue([
          buildYeastProduct({ yeastType: raw }),
        ]);
        const [result] = await listIngredientsByCategory("yeast");
        if (result.category === "yeast") {
          expect(result.yeastType).toBe(expected);
        }
      },
    );

    // ─── yeastToIngredient — flocculation parsing ───
    it.each([
      ["low", "low"],
      ["medium", "medium"],
      ["high", "high"],
      ["very_high", "high"],
    ] as const)(
      "yeastToIngredient parses flocculation '%s' from specGroups → %s",
      async (flocValue, expected) => {
        mockedListYeasts.mockResolvedValue([
          buildYeastProduct({
            specGroups: [
              {
                id: "yeast-fermentation-group",
                title: "Fermentation",
                rows: [
                  {
                    id: "yeast-flocculation",
                    label: "Flocculation",
                    value: flocValue,
                  },
                ],
              },
            ],
          }),
        ]);
        const [result] = await listIngredientsByCategory("yeast");
        if (result.category === "yeast") {
          expect(result.flocculation).toBe(expected);
        }
      },
    );

    // ─── yeastToIngredient — temperature range parsing ───
    it("yeastToIngredient parses temperature range from specGroups", async () => {
      mockedListYeasts.mockResolvedValue([
        buildYeastProduct({
          specGroups: [
            {
              id: "yeast-fermentation-group",
              title: "Fermentation",
              rows: [
                {
                  id: "yeast-temperature-range",
                  label: "Temperature",
                  value: "15-22",
                  unit: "°C",
                },
              ],
            },
          ],
        }),
      ]);
      const [result] = await listIngredientsByCategory("yeast");
      if (result.category === "yeast") {
        expect(result.fermentationMinC).toBe(15);
        expect(result.fermentationMaxC).toBe(22);
      }
    });

    // ─── yeastToIngredient — single-value temperature ───
    it("yeastToIngredient handles a single-value temperature (no range)", async () => {
      mockedListYeasts.mockResolvedValue([
        buildYeastProduct({
          specGroups: [
            {
              id: "yeast-fermentation-group",
              title: "Fermentation",
              rows: [
                {
                  id: "yeast-temperature-range",
                  label: "Temperature",
                  value: "20",
                  unit: "°C",
                },
              ],
            },
          ],
        }),
      ]);
      const [result] = await listIngredientsByCategory("yeast");
      if (result.category === "yeast") {
        expect(result.fermentationMinC).toBe(20);
        expect(result.fermentationMaxC).toBe(20);
      }
    });
  });
});
