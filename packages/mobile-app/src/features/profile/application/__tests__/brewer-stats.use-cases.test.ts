import { getBrewerLevel, getBrewerStats } from "../brewer-stats.use-cases";

import { listBatches } from "@/features/batches/application/batches.use-cases";
import { listRecipes } from "@/features/recipes/application/recipes.use-cases";
import { listCurrentUserScans } from "@/features/scan/data/scan.api";

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  listBatches: jest.fn(),
}));
jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  listRecipes: jest.fn(),
}));
jest.mock("@/features/scan/data/scan.api", () => ({
  listCurrentUserScans: jest.fn(),
}));

const mockedListBatches = listBatches as jest.MockedFunction<
  typeof listBatches
>;
const mockedListRecipes = listRecipes as jest.MockedFunction<
  typeof listRecipes
>;
const mockedListCurrentUserScans = listCurrentUserScans as jest.MockedFunction<
  typeof listCurrentUserScans
>;

describe("brewer stats", () => {
  beforeEach(() => {
    mockedListBatches.mockReset();
    mockedListRecipes.mockReset();
    mockedListCurrentUserScans.mockReset();
    mockedListCurrentUserScans.mockResolvedValue([]);
  });

  it.each([
    [0, "Apprenti"],
    [4, "Apprenti"],
    [5, "Brasseur"],
    [19, "Brasseur"],
    [20, "Maître Brasseur"],
  ] as const)("maps %i completed batches to %s", (count, expected) => {
    // Arrange

    // Act
    const level = getBrewerLevel(count);

    // Assert
    expect(level).toBe(expected);
  });

  it("aggregates personal counts and computes the level", async () => {
    // Arrange
    mockedListBatches.mockResolvedValue([
      { status: "completed" },
      { status: "completed" },
      { status: "in_progress" },
      { status: "draft" },
    ] as Awaited<ReturnType<typeof listBatches>>);
    mockedListRecipes.mockResolvedValue([
      { id: "recipe-1" },
      { id: "recipe-2" },
    ] as Awaited<ReturnType<typeof listRecipes>>);
    mockedListCurrentUserScans.mockResolvedValue([
      { id: "scan-1", status: "matched", createdAt: "2026-07-15" },
    ]);

    // Act
    const stats = await getBrewerStats();

    // Assert
    expect(stats).toEqual({
      activeBatches: 1,
      completedBatches: 2,
      authoredRecipes: 2,
      submittedScans: 1,
      level: "Apprenti",
    });
  });

  it("returns zero counts and the apprentice level for empty collections", async () => {
    // Arrange
    mockedListBatches.mockResolvedValue([]);
    mockedListRecipes.mockResolvedValue([]);

    // Act
    const stats = await getBrewerStats();

    // Assert
    expect(stats).toEqual({
      activeBatches: 0,
      completedBatches: 0,
      authoredRecipes: 0,
      submittedScans: 0,
      level: "Apprenti",
    });
  });

  it("propagates a batch loading failure", async () => {
    // Arrange
    const error = new Error("Batches unavailable");
    mockedListBatches.mockRejectedValue(error);
    mockedListRecipes.mockResolvedValue([]);
    mockedListCurrentUserScans.mockResolvedValue([]);

    // Act
    const statsPromise = getBrewerStats();

    // Assert
    await expect(statsPromise).rejects.toBe(error);
  });
});
