import { importRecipeFromCommunity } from "@/features/recipes/application/recipes.use-cases";
import { importFromCommunity } from "@/features/recipes/data/recipes.api";

const dataSourceMock = { useDemoData: true };

jest.mock("@/core/data/data-source", () => ({
  get dataSource() {
    return dataSourceMock;
  },
}));

jest.mock("@/features/recipes/data/recipes.api", () => ({
  importFromCommunity: jest.fn(),
}));

const mockedImport = importFromCommunity as jest.MockedFunction<
  typeof importFromCommunity
>;

describe("importRecipeFromCommunity", () => {
  beforeEach(() => {
    mockedImport.mockReset();
    dataSourceMock.useDemoData = true;
  });

  describe("happy path — demo mode", () => {
    it("returns the source recipe id and name without calling the API", async () => {
      const result = await importRecipeFromCommunity("r-demo-1");

      expect(result.recipeId).toBe("r-demo-1");
      expect(result.name.length).toBeGreaterThan(0);
      expect(mockedImport).not.toHaveBeenCalled();
    });
  });

  describe("sad path — demo mode", () => {
    it("throws when the source id does not match any demo recipe", async () => {
      await expect(importRecipeFromCommunity("does-not-exist")).rejects.toThrow(
        /Demo recipe not found/,
      );
      expect(mockedImport).not.toHaveBeenCalled();
    });
  });

  describe("happy path — backend mode", () => {
    it("delegates to the recipes API and returns the new recipe id and name", async () => {
      dataSourceMock.useDemoData = false;
      mockedImport.mockResolvedValueOnce({
        id: "imported-uuid-1",
        ownerId: "user-1",
        name: "Session IPA Citra (community)",
        description: null,
        visibility: "private",
        version: 1,
        rootRecipeId: "imported-uuid-1",
        parentRecipeId: null,
        createdAt: "2026-04-27T12:00:00.000Z",
        updatedAt: "2026-04-27T12:00:00.000Z",
      });

      const result = await importRecipeFromCommunity("source-uuid-7");

      expect(mockedImport).toHaveBeenCalledWith("source-uuid-7");
      expect(result).toEqual({
        recipeId: "imported-uuid-1",
        name: "Session IPA Citra (community)",
      });
    });
  });
});
