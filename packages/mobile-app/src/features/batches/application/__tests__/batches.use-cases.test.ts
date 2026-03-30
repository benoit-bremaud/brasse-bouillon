import {
  completeCurrentBatchStep,
  getBatchDetails,
  listBatches,
  startBatch,
} from "@/features/batches/application/batches.use-cases";
import {
  completeCurrentStep,
  getMineById,
  listMine,
  startBatch as startBatchApi,
} from "@/features/batches/data/batches.api";

import { dataSource } from "@/core/data/data-source";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/batches/data/batches.api", () => ({
  listMine: jest.fn(),
  getMineById: jest.fn(),
  completeCurrentStep: jest.fn(),
  startBatch: jest.fn(),
}));

const mockedListMine = listMine as jest.MockedFunction<typeof listMine>;
const mockedGetMineById = getMineById as jest.MockedFunction<
  typeof getMineById
>;
const mockedCompleteCurrentStep = completeCurrentStep as jest.MockedFunction<
  typeof completeCurrentStep
>;
const mockedStartBatchApi = startBatchApi as jest.MockedFunction<
  typeof startBatchApi
>;

describe("batches use-cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedListMine.mockReset();
    mockedGetMineById.mockReset();
    mockedCompleteCurrentStep.mockReset();
    mockedStartBatchApi.mockReset();
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
    const batch = await getBatchDetails("b-demo-1");

    expect(batch).toBeTruthy();
    expect(batch?.id).toBe("b-demo-1");
    expect(mockedGetMineById).not.toHaveBeenCalled();
  });

  it("returns null for missing batch id in complete step", async () => {
    const batch = await completeCurrentBatchStep("");

    expect(batch).toBeNull();
    expect(mockedCompleteCurrentStep).not.toHaveBeenCalled();
  });

  it("returns demo batch on complete step when demo data is enabled", async () => {
    const batch = await completeCurrentBatchStep("b-demo-1");

    expect(batch).toBeTruthy();
    expect(batch?.id).toBe("b-demo-1");
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

  it("throws when starting a batch in demo mode", async () => {
    dataSource.useDemoData = true;

    await expect(startBatch("r1")).rejects.toThrow(
      "Starting a batch is disabled when using demo data. Switch to live data to start a batch.",
    );
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
});
