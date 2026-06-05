import { getMatchingRecipes } from "@/features/scan/application/recipe-matching.use-cases";

const dataSourceMock = { useDemoData: true };
jest.mock("@/core/data/data-source", () => ({
  get dataSource() {
    return dataSourceMock;
  },
}));

jest.mock("@/features/scan/data/recipe-matching.api", () => ({
  fetchMatchingRecipes: jest.fn(),
}));
jest.mock("@/mocks/demo-data", () => ({
  getDemoEquivalentRecipes: jest.fn(),
}));

import { fetchMatchingRecipes } from "@/features/scan/data/recipe-matching.api";
import { getDemoEquivalentRecipes } from "@/mocks/demo-data";

const mockApiFetch = fetchMatchingRecipes as jest.MockedFunction<
  typeof fetchMatchingRecipes
>;
const mockDemoEquivalents = getDemoEquivalentRecipes as jest.MockedFunction<
  typeof getDemoEquivalentRecipes
>;

function makeBeer(
  overrides: Partial<{
    barcode: string;
    style: string;
    abv: number | null;
    ibu: number | null;
    colorEbc: number | null;
  }> = {},
) {
  return {
    barcode: "5060277380019",
    style: "American IPA",
    abv: 5.4,
    ibu: 45,
    colorEbc: 14,
    ...overrides,
  };
}

describe("getMatchingRecipes (Issue #700)", () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
    mockDemoEquivalents.mockReset();
    dataSourceMock.useDemoData = true;
  });

  describe("demo mode", () => {
    it("happy: returns the demo equivalent recipes wrapped in the envelope", async () => {
      const demoRecipes = [
        {
          recipeId: "r-demo-1",
          publicRecipeId: "uuid-1",
          name: "Session IPA Citra",
          brewer: "Communauté Brasse-Bouillon",
          rating: 4.7,
          brewedCount: 23,
          score: 92,
        },
      ];
      mockDemoEquivalents.mockReturnValue(demoRecipes);

      const result = await getMatchingRecipes(makeBeer());

      expect(mockDemoEquivalents).toHaveBeenCalledWith("5060277380019");
      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        rankings: demoRecipes,
        lowConfidence: false,
      });
    });

    it("sad: when the demo set has no match for the barcode, returns empty rankings + low_confidence=true", async () => {
      mockDemoEquivalents.mockReturnValue([]);

      const result = await getMatchingRecipes(
        makeBeer({ barcode: "9999999999999" }),
      );

      expect(result).toEqual({ rankings: [], lowConfidence: true });
    });
  });

  describe("backend mode", () => {
    beforeEach(() => {
      dataSourceMock.useDemoData = false;
    });

    it("happy: forwards the beer characteristics to the API and passes through the envelope", async () => {
      const apiResponse = {
        rankings: [
          {
            recipeId: "uuid-recipe",
            publicRecipeId: "uuid-recipe",
            name: "Hop Forward IPA",
            brewer: "Communauté Brasse-Bouillon",
            rating: 4.5,
            brewedCount: 10,
            score: 88,
          },
        ],
        lowConfidence: false,
      };
      mockApiFetch.mockResolvedValue(apiResponse);

      const result = await getMatchingRecipes(makeBeer());

      expect(mockApiFetch).toHaveBeenCalledWith({
        style: "American IPA",
        abv: 5.4,
        ibu: 45,
        colorEbc: 14,
      });
      expect(mockDemoEquivalents).not.toHaveBeenCalled();
      expect(result).toBe(apiResponse);
    });

    it("edge: forwards null characteristics unchanged (the API renormalises)", async () => {
      mockApiFetch.mockResolvedValue({ rankings: [], lowConfidence: true });

      await getMatchingRecipes(
        makeBeer({
          style: "Style inconnu",
          abv: null,
          ibu: null,
          colorEbc: null,
        }),
      );

      expect(mockApiFetch).toHaveBeenCalledWith({
        style: "Style inconnu",
        abv: null,
        ibu: null,
        colorEbc: null,
      });
    });

    it("sad: low_confidence=true from the API surfaces unchanged in the envelope", async () => {
      mockApiFetch.mockResolvedValue({
        rankings: [],
        lowConfidence: true,
      });

      const result = await getMatchingRecipes(makeBeer());

      expect(result.lowConfidence).toBe(true);
    });
  });
});
