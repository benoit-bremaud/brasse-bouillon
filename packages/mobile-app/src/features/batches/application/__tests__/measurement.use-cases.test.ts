import {
  clearDemoMeasurements,
  listBatchMeasurements,
  recordBatchMeasurement,
} from "@/features/batches/application/measurement.use-cases";
import {
  createMeasurement,
  listMeasurements,
} from "@/features/batches/data/batches.api";

import { dataSource } from "@/core/data/data-source";
import { Measurement } from "@/features/batches/domain/measurement.types";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/batches/data/batches.api", () => ({
  createMeasurement: jest.fn(),
  listMeasurements: jest.fn(),
}));

const mockedCreate = createMeasurement as jest.MockedFunction<
  typeof createMeasurement
>;
const mockedList = listMeasurements as jest.MockedFunction<
  typeof listMeasurements
>;

describe("measurement use-cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedCreate.mockReset();
    mockedList.mockReset();
    clearDemoMeasurements();
  });

  it("returns null and skips the API for a missing batch id (edge path)", async () => {
    const result = await recordBatchMeasurement("", {
      type: "og",
      value: 1.05,
    });

    expect(result).toBeNull();
    expect(mockedCreate).not.toHaveBeenCalled();
  });

  it("returns an empty list and skips the API for a missing batch id (edge path)", async () => {
    const result = await listBatchMeasurements("");

    expect(result).toEqual([]);
    expect(mockedList).not.toHaveBeenCalled();
  });

  it("records and reads back a measurement locally in demo mode (happy path)", async () => {
    const batchId = "b-demo-record";

    const recorded = await recordBatchMeasurement(batchId, {
      type: "og",
      value: 1.05,
    });

    expect(recorded?.type).toBe("og");
    expect(recorded?.value).toBe(1.05);
    expect(mockedCreate).not.toHaveBeenCalled();

    const list = await listBatchMeasurements(batchId);
    expect(list.map((m) => m.value)).toContain(1.05);
    expect(mockedList).not.toHaveBeenCalled();
  });

  it("returns an empty demo list for a batch with no readings (sad path)", async () => {
    const list = await listBatchMeasurements("b-demo-empty");

    expect(list).toEqual([]);
    expect(mockedList).not.toHaveBeenCalled();
  });

  it("delegates to the data layer in live mode (happy path)", async () => {
    dataSource.useDemoData = false;
    const liveMeasurement: Measurement = {
      id: "m-live",
      batchId: "b-live",
      stepOrder: null,
      type: "fg",
      value: 1.01,
      unit: null,
      takenAt: "2026-05-30T09:00:00.000Z",
      createdAt: "2026-05-30T09:00:00.000Z",
    };
    mockedCreate.mockResolvedValue(liveMeasurement);
    mockedList.mockResolvedValue([liveMeasurement]);

    const recorded = await recordBatchMeasurement("b-live", {
      type: "fg",
      value: 1.01,
    });
    const list = await listBatchMeasurements("b-live");

    expect(mockedCreate).toHaveBeenCalledWith("b-live", {
      type: "fg",
      value: 1.01,
    });
    expect(mockedList).toHaveBeenCalledWith("b-live");
    expect(recorded).toEqual(liveMeasurement);
    expect(list).toEqual([liveMeasurement]);
  });

  it("propagates a live-mode API error when recording fails (sad path)", async () => {
    dataSource.useDemoData = false;
    mockedCreate.mockRejectedValue(new Error("Network error"));

    await expect(
      recordBatchMeasurement("b-live", { type: "og", value: 1.05 }),
    ).rejects.toThrow("Network error");
    expect(mockedCreate).toHaveBeenCalledWith("b-live", {
      type: "og",
      value: 1.05,
    });
  });
});
