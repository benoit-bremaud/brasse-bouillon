import {
  archiveBatch,
  cancelBatch,
  completeCurrentBatchStep,
  deleteBatch,
  getBatchDetails,
  getBatchDetailsViewModel,
  listBatches,
  startBatch,
  startCurrentBatchStep,
} from "@/features/batches/application/batches.use-cases";
import {
  archiveBatch as archiveBatchApi,
  cancelBatch as cancelBatchApi,
  completeCurrentStep,
  deleteBatch as deleteBatchApi,
  getMineById,
  listMine,
  startBatch as startBatchApi,
  startCurrentStep,
} from "@/features/batches/data/batches.api";

import { dataSource } from "@/core/data/data-source";
import { getRecipeDetails } from "@/features/recipes/application/recipes.use-cases";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/batches/data/batches.api", () => ({
  listMine: jest.fn(),
  getMineById: jest.fn(),
  startCurrentStep: jest.fn(),
  completeCurrentStep: jest.fn(),
  startBatch: jest.fn(),
  deleteBatch: jest.fn(),
  cancelBatch: jest.fn(),
  archiveBatch: jest.fn(),
}));

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  getRecipeDetails: jest.fn(),
}));

const mockedGetRecipeDetails = getRecipeDetails as jest.MockedFunction<
  typeof getRecipeDetails
>;

const mockedListMine = listMine as jest.MockedFunction<typeof listMine>;
const mockedGetMineById = getMineById as jest.MockedFunction<
  typeof getMineById
>;
const mockedCompleteCurrentStep = completeCurrentStep as jest.MockedFunction<
  typeof completeCurrentStep
>;
const mockedStartCurrentStep = startCurrentStep as jest.MockedFunction<
  typeof startCurrentStep
>;
const mockedStartBatchApi = startBatchApi as jest.MockedFunction<
  typeof startBatchApi
>;
const mockedDeleteBatchApi = deleteBatchApi as jest.MockedFunction<
  typeof deleteBatchApi
>;
const mockedCancelBatchApi = cancelBatchApi as jest.MockedFunction<
  typeof cancelBatchApi
>;
const mockedArchiveBatchApi = archiveBatchApi as jest.MockedFunction<
  typeof archiveBatchApi
>;

describe("batches use-cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedListMine.mockReset();
    mockedGetMineById.mockReset();
    mockedCompleteCurrentStep.mockReset();
    mockedStartBatchApi.mockReset();
    mockedGetRecipeDetails.mockReset();
    mockedDeleteBatchApi.mockReset();
    mockedCancelBatchApi.mockReset();
    mockedArchiveBatchApi.mockReset();
  });

  it("deleteBatch is a no-op in demo mode (F25, demo)", async () => {
    dataSource.useDemoData = true;

    await expect(deleteBatch("b1")).resolves.toBeUndefined();
    expect(mockedDeleteBatchApi).not.toHaveBeenCalled();
  });

  it("deleteBatch calls the API when demo is off (F25, happy)", async () => {
    dataSource.useDemoData = false;
    mockedDeleteBatchApi.mockResolvedValue(undefined);

    await deleteBatch("b1");

    expect(mockedDeleteBatchApi).toHaveBeenCalledWith("b1");
  });

  it("deleteBatch propagates the API error when demo is off (F25, sad)", async () => {
    dataSource.useDemoData = false;
    mockedDeleteBatchApi.mockRejectedValue(new Error("boom"));

    await expect(deleteBatch("b1")).rejects.toThrow("boom");
  });

  it("cancelBatch is a no-op in demo mode; calls the API when live (F16)", async () => {
    dataSource.useDemoData = true;
    await expect(cancelBatch("b1")).resolves.toBeUndefined();
    expect(mockedCancelBatchApi).not.toHaveBeenCalled();

    dataSource.useDemoData = false;
    mockedCancelBatchApi.mockResolvedValue({ id: "b1" } as never);
    await cancelBatch("b1");
    expect(mockedCancelBatchApi).toHaveBeenCalledWith("b1");
  });

  it("cancelBatch returns early on a missing id (sad)", async () => {
    dataSource.useDemoData = false;
    await expect(cancelBatch("")).resolves.toBeUndefined();
    expect(mockedCancelBatchApi).not.toHaveBeenCalled();
  });

  it("archiveBatch is a no-op in demo mode; calls the API when live (F25)", async () => {
    dataSource.useDemoData = true;
    await expect(archiveBatch("b1")).resolves.toBeUndefined();
    expect(mockedArchiveBatchApi).not.toHaveBeenCalled();

    dataSource.useDemoData = false;
    mockedArchiveBatchApi.mockResolvedValue({ id: "b1" } as never);
    await archiveBatch("b1");
    expect(mockedArchiveBatchApi).toHaveBeenCalledWith("b1");
  });

  it("archiveBatch propagates the API error when live (sad)", async () => {
    dataSource.useDemoData = false;
    mockedArchiveBatchApi.mockRejectedValue(new Error("boom"));

    await expect(archiveBatch("b1")).rejects.toThrow("boom");
  });

  it("returns demo batches list when demo data is enabled", async () => {
    const batches = await listBatches();

    expect(batches.length).toBeGreaterThan(0);
    expect(mockedListMine).not.toHaveBeenCalled();
  });

  it("returns null for missing batch id in details", async () => {
    const batch = await getBatchDetails("");

    expect(batch).toBeNull();
    expect(mockedGetMineById).not.toHaveBeenCalled();
  });

  it("returns demo batch details when id exists", async () => {
    const batch = await getBatchDetails("b-demo-pdd-mash");

    expect(batch).toBeTruthy();
    expect(batch?.id).toBe("b-demo-pdd-mash");
    expect(mockedGetMineById).not.toHaveBeenCalled();
  });

  it("returns null for missing batch id in complete step", async () => {
    const batch = await completeCurrentBatchStep("");

    expect(batch).toBeNull();
    expect(mockedCompleteCurrentStep).not.toHaveBeenCalled();
  });

  it("returns demo batch on complete step when demo data is enabled", async () => {
    const batch = await completeCurrentBatchStep("b-demo-pdd-mash");

    expect(batch).toBeTruthy();
    expect(batch?.id).toBe("b-demo-pdd-mash");
    expect(mockedCompleteCurrentStep).not.toHaveBeenCalled();
  });

  it("uses live API for list and details when demo mode is disabled", async () => {
    dataSource.useDemoData = false;
    mockedListMine.mockResolvedValue([
      {
        id: "b-live-1",
        ownerId: "u1",
        recipeId: "r1",
        status: "in_progress",
        currentStepOrder: 1,
        startedAt: "2026-01-01T00:00:00.000Z",
        fermentationStartedAt: null,
        fermentationCompletedAt: null,
        completedAt: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
    mockedGetMineById.mockResolvedValue({
      id: "b-live-1",
      ownerId: "u1",
      recipeId: "r1",
      status: "in_progress",
      currentStepOrder: 1,
      startedAt: "2026-01-01T00:00:00.000Z",
      fermentationStartedAt: null,
      fermentationCompletedAt: null,
      completedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      steps: [],
    });

    const list = await listBatches();
    const details = await getBatchDetails("b-live-1");

    expect(mockedListMine).toHaveBeenCalledTimes(1);
    expect(mockedGetMineById).toHaveBeenCalledWith("b-live-1");
    expect(list).toHaveLength(1);
    expect(details?.id).toBe("b-live-1");
  });

  it("uses live API for complete current step when demo mode is disabled", async () => {
    dataSource.useDemoData = false;
    mockedCompleteCurrentStep.mockResolvedValue({
      id: "b-live-1",
      ownerId: "u1",
      recipeId: "r1",
      status: "completed",
      currentStepOrder: 2,
      startedAt: "2026-01-01T00:00:00.000Z",
      fermentationStartedAt: "2026-01-02T00:00:00.000Z",
      fermentationCompletedAt: "2026-01-10T00:00:00.000Z",
      completedAt: "2026-01-12T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-12T00:00:00.000Z",
      steps: [],
    });

    const updatedBatch = await completeCurrentBatchStep("b-live-1");

    expect(mockedCompleteCurrentStep).toHaveBeenCalledWith("b-live-1");
    expect(updatedBatch?.status).toBe("completed");
  });

  it("returns null for missing batch id in start step", async () => {
    const batch = await startCurrentBatchStep("");

    expect(batch).toBeNull();
    expect(mockedStartCurrentStep).not.toHaveBeenCalled();
  });

  it("returns demo batch on start step when demo data is enabled", async () => {
    dataSource.useDemoData = true;

    const batch = await startCurrentBatchStep("b-demo-pdd-mash");

    expect(batch?.id).toBe("b-demo-pdd-mash");
    expect(mockedStartCurrentStep).not.toHaveBeenCalled();
  });

  it("uses live API for start current step when demo mode is disabled", async () => {
    dataSource.useDemoData = false;
    mockedStartCurrentStep.mockResolvedValue({
      id: "b-live-1",
      ownerId: "u1",
      recipeId: "r1",
      status: "in_progress",
      currentStepOrder: 0,
      startedAt: "2026-01-01T00:00:00.000Z",
      fermentationStartedAt: null,
      fermentationCompletedAt: null,
      completedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      steps: [],
    });

    const activated = await startCurrentBatchStep("b-live-1");

    expect(mockedStartCurrentStep).toHaveBeenCalledWith("b-live-1");
    expect(activated?.status).toBe("in_progress");
  });

  it("returns the fil-rouge mash batch when starting a batch in demo mode", async () => {
    dataSource.useDemoData = true;

    const batch = await startBatch("r-demo-pdd");

    expect(batch.id).toBe("b-demo-pdd-mash");
    expect(mockedStartBatchApi).not.toHaveBeenCalled();
  });

  it("uses live API when starting a batch with live data", async () => {
    dataSource.useDemoData = false;
    mockedStartBatchApi.mockResolvedValue({
      id: "b-live-2",
      ownerId: "u1",
      recipeId: "r-live-1",
      status: "in_progress",
      currentStepOrder: 0,
      startedAt: "2026-01-01T00:00:00.000Z",
      fermentationStartedAt: null,
      fermentationCompletedAt: null,
      completedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      steps: [],
    });

    const batch = await startBatch("r-live-1");

    expect(mockedStartBatchApi).toHaveBeenCalledWith("r-live-1");
    expect(batch.id).toBe("b-live-2");
  });

  describe("getBatchDetailsViewModel", () => {
    it("enriches the batch with the recipe name (happy path)", async () => {
      mockedGetRecipeDetails.mockResolvedValue({
        id: "r-demo-pdd",
        name: "La Première du dimanche",
      } as never);

      const result = await getBatchDetailsViewModel("b-demo-pdd-mash");

      expect(result?.batch.id).toBe("b-demo-pdd-mash");
      expect(result?.recipeName).toBe("La Première du dimanche");
      expect(mockedGetRecipeDetails).toHaveBeenCalledWith("r-demo-pdd");
    });

    it("returns a null recipe name when the recipe is not found (sad path)", async () => {
      mockedGetRecipeDetails.mockResolvedValue(null);

      const result = await getBatchDetailsViewModel("b-demo-pdd-mash");

      expect(result?.batch.id).toBe("b-demo-pdd-mash");
      expect(result?.recipeName).toBeNull();
    });

    it("returns null and skips the recipe lookup when the batch is missing (edge path)", async () => {
      const result = await getBatchDetailsViewModel("");

      expect(result).toBeNull();
      expect(mockedGetRecipeDetails).not.toHaveBeenCalled();
    });

    it("still returns the batch with a null recipe name when the recipe lookup throws (degraded path)", async () => {
      mockedGetRecipeDetails.mockRejectedValue(new Error("recipe API 404"));

      const result = await getBatchDetailsViewModel("b-demo-pdd-mash");

      expect(result?.batch.id).toBe("b-demo-pdd-mash");
      expect(result?.recipeName).toBeNull();
    });

    it("surfaces the recipe batch volume for the closure view (happy path)", async () => {
      mockedGetRecipeDetails.mockResolvedValue({
        id: "r-demo-pdd",
        name: "La Première du dimanche",
        stats: { volumeLiters: 4.3 },
      } as never);

      const result = await getBatchDetailsViewModel("b-demo-pdd-mash");

      expect(result?.recipeVolumeL).toBe(4.3);
    });

    it("returns a null volume when the recipe omits the volume stat (edge path)", async () => {
      mockedGetRecipeDetails.mockResolvedValue({
        id: "r-demo-pdd",
        name: "La Première du dimanche",
        stats: {},
      } as never);

      const result = await getBatchDetailsViewModel("b-demo-pdd-mash");

      expect(result?.recipeVolumeL).toBeNull();
    });

    it("returns a null volume when the recipe lookup throws (degraded path)", async () => {
      mockedGetRecipeDetails.mockRejectedValue(new Error("recipe API 500"));

      const result = await getBatchDetailsViewModel("b-demo-pdd-mash");

      expect(result?.recipeVolumeL).toBeNull();
    });
  });
});
