/**
 * Guards the measurement DTO -> domain mapping and the create/list calls
 * against the shared http-client (B2 — US-0404).
 */

import * as httpClient from "@/core/http/http-client";

import {
  createMeasurement,
  listMeasurements,
} from "@/features/batches/data/batches.api";

jest.mock("@/core/http/http-client");

const mockedRequest = httpClient.request as jest.MockedFunction<
  typeof httpClient.request
>;

function measurementDto(overrides: Record<string, unknown> = {}) {
  return {
    id: "m1",
    batch_id: "b1",
    step_order: 2,
    type: "og",
    value: 1.05,
    unit: null,
    taken_at: "2026-05-19T09:00:00.000Z",
    created_at: "2026-05-19T09:00:00.000Z",
    ...overrides,
  };
}

describe("measurement data layer", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it("maps a measurement DTO to the domain shape (happy path)", async () => {
    mockedRequest.mockResolvedValue([measurementDto()]);

    const [measurement] = await listMeasurements("b1");

    expect(measurement).toEqual({
      id: "m1",
      batchId: "b1",
      stepOrder: 2,
      type: "og",
      value: 1.05,
      unit: null,
      takenAt: "2026-05-19T09:00:00.000Z",
      createdAt: "2026-05-19T09:00:00.000Z",
    });
  });

  it("nullish-coalesces missing optional fields to null (edge path)", async () => {
    mockedRequest.mockResolvedValue([
      measurementDto({ step_order: undefined, unit: undefined }),
    ]);

    const [measurement] = await listMeasurements("b1");

    expect(measurement.stepOrder).toBeNull();
    expect(measurement.unit).toBeNull();
  });

  it("GETs the batch measurements endpoint (happy path)", async () => {
    mockedRequest.mockResolvedValue([]);

    await listMeasurements("b1");

    expect(mockedRequest).toHaveBeenCalledWith("/batches/b1/measurements");
  });

  it("POSTs a creation payload and maps the response (happy path)", async () => {
    mockedRequest.mockResolvedValue(
      measurementDto({ type: "fg", value: 1.01 }),
    );

    const created = await createMeasurement("b1", { type: "fg", value: 1.01 });

    expect(mockedRequest).toHaveBeenCalledWith("/batches/b1/measurements", {
      method: "POST",
      body: { type: "fg", value: 1.01 },
    });
    expect(created.type).toBe("fg");
    expect(created.value).toBe(1.01);
  });

  it("propagates http-client errors (sad path)", async () => {
    mockedRequest.mockRejectedValue(new Error("400 out of range"));

    await expect(
      createMeasurement("b1", { type: "og", value: 2 }),
    ).rejects.toThrow("400 out of range");
  });
});
