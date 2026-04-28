import { getImportSourceId } from "@/features/recipes/application/recipes.use-cases";

const dataSourceMock = { useDemoData: true };

jest.mock("@/core/data/data-source", () => ({
  get dataSource() {
    return dataSourceMock;
  },
}));

describe("getImportSourceId (Issue #701 helper)", () => {
  beforeEach(() => {
    dataSourceMock.useDemoData = true;
  });

  describe("happy path — demo mode", () => {
    it("returns the demo recipeId so demoRecipes lookup resolves", () => {
      dataSourceMock.useDemoData = true;
      const match = {
        recipeId: "r-demo-1",
        publicRecipeId: "00000000-0000-4000-8000-000000000001",
      };

      expect(getImportSourceId(match)).toBe("r-demo-1");
    });

    it("returns the demo recipeId even when publicRecipeId is missing", () => {
      dataSourceMock.useDemoData = true;
      const match = { recipeId: "r-demo-7" };

      expect(getImportSourceId(match)).toBe("r-demo-7");
    });
  });

  describe("happy path — backend mode", () => {
    it("returns the publicRecipeId so the API can find a real PUBLIC row", () => {
      dataSourceMock.useDemoData = false;
      const match = {
        recipeId: "r-demo-1",
        publicRecipeId: "00000000-0000-4000-8000-000000000001",
      };

      expect(getImportSourceId(match)).toBe(
        "00000000-0000-4000-8000-000000000001",
      );
    });
  });

  describe("sad path — backend mode without publicRecipeId", () => {
    it("falls back to recipeId so the import attempt at least surfaces a clear 404", () => {
      // Defensive fallback — legacy / partial mocks may not carry
      // publicRecipeId. The import will sad-path with 404 from the
      // backend, which is preferable to a runtime undefined error.
      dataSourceMock.useDemoData = false;
      const match = { recipeId: "r-demo-99" };

      expect(getImportSourceId(match)).toBe("r-demo-99");
    });
  });

  describe("edge cases", () => {
    it("does not mutate the input match", () => {
      dataSourceMock.useDemoData = false;
      const match = {
        recipeId: "r-demo-1",
        publicRecipeId: "00000000-0000-4000-8000-000000000001",
      };
      const snapshot = { ...match };

      getImportSourceId(match);

      expect(match).toEqual(snapshot);
    });
  });
});
