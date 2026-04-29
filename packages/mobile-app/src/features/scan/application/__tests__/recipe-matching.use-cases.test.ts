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

      const result = await getMatchingRecipes({
        id: "uuid-beer",
        barcode: "5060277380019",
      });

      expect(mockDemoEquivalents).toHaveBeenCalledWith("5060277380019");
      expect(mockApiFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        rankings: demoRecipes,
        lowConfidence: false,
      });
    });

    it("sad: when the demo set has no match for the barcode, returns empty rankings + low_confidence=true", async () => {
      mockDemoEquivalents.mockReturnValue([]);

      const result = await getMatchingRecipes({
        id: "uuid-beer",
        barcode: "9999999999999",
      });

      expect(result).toEqual({ rankings: [], lowConfidence: true });
    });
  });

  describe("backend mode", () => {
    beforeEach(() => {
      dataSourceMock.useDemoData = false;
    });

    it("happy: forwards the call to the API with the catalog item id and passes through the envelope", async () => {
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

      const result = await getMatchingRecipes({
        id: "uuid-beer",
        barcode: "5060277380019",
      });

      expect(mockApiFetch).toHaveBeenCalledWith("uuid-beer");
      expect(mockDemoEquivalents).not.toHaveBeenCalled();
      expect(result).toBe(apiResponse);
    });

    it("sad: low_confidence=true from the API surfaces unchanged in the envelope", async () => {
      mockApiFetch.mockResolvedValue({
        rankings: [],
        lowConfidence: true,
      });

      const result = await getMatchingRecipes({
        id: "uuid-beer",
        barcode: "5060277380019",
      });

      expect(result.lowConfidence).toBe(true);
    });
  });
});
