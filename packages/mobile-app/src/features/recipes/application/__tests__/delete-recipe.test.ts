import { deleteRecipeFromCarnet } from "@/features/recipes/application/recipes.use-cases";
import { deleteRecipe } from "@/features/recipes/data/recipes.api";

const dataSourceMock = { useDemoData: true };

jest.mock("@/core/data/data-source", () => ({
  get dataSource() {
    return dataSourceMock;
  },
}));

jest.mock("@/features/recipes/data/recipes.api", () => ({
  deleteRecipe: jest.fn(),
}));

const mockedDelete = deleteRecipe as jest.MockedFunction<typeof deleteRecipe>;

describe("deleteRecipeFromCarnet", () => {
  beforeEach(() => {
    mockedDelete.mockReset();
    dataSourceMock.useDemoData = true;
  });

  describe("demo mode", () => {
    it("is a no-op and never calls the API (the demo catalog is read-only)", async () => {
      await expect(deleteRecipeFromCarnet("r-demo-1")).resolves.toBeUndefined();
      expect(mockedDelete).not.toHaveBeenCalled();
    });
  });

  describe("backend mode", () => {
    it("delegates to the recipes API delete with the recipe id (happy path)", async () => {
      dataSourceMock.useDemoData = false;
      mockedDelete.mockResolvedValueOnce(undefined);

      await deleteRecipeFromCarnet("r-42");

      expect(mockedDelete).toHaveBeenCalledWith("r-42");
    });

    it("propagates the API error (sad path)", async () => {
      dataSourceMock.useDemoData = false;
      mockedDelete.mockRejectedValueOnce(new Error("forbidden"));

      await expect(deleteRecipeFromCarnet("r-42")).rejects.toThrow("forbidden");
    });
  });
});
