/**
 * Guards the B3 priming / bottling / tasting DTO -> domain mapping and the
 * calls against the shared http-client.
 */

import * as httpClient from "@/core/http/http-client";

import {
  closeBottling,
  createTasting,
  getPriming,
  getTasting,
} from "@/features/batches/data/batches.api";

jest.mock("@/core/http/http-client");

const mockedRequest = httpClient.request as jest.MockedFunction<
  typeof httpClient.request
>;

function primingDto(overrides: Record<string, unknown> = {}) {
  return {
    sugar_grams: 28,
    sugar_type: "table_sugar",
    target_co2_vol: 2.4,
    volume_l: 4.3,
    safety_warning: "Sécurité : ne dépassez jamais la dose…",
    ...overrides,
  };
}

function tastingDto(overrides: Record<string, unknown> = {}) {
  return {
    id: "t1",
    batch_id: "b1",
    rating: 4,
    note: "Belle mousse",
    created_at: "2026-06-20T09:00:00.000Z",
    ...overrides,
  };
}

function batchDto(overrides: Record<string, unknown> = {}) {
  return {
    id: "b1",
    owner_id: "u1",
    recipe_id: "r1",
    status: "completed",
    current_step_order: null,
    started_at: "2026-02-05T09:00:00.000Z",
    bottled_at: "2026-06-20T09:00:00.000Z",
    completed_at: "2026-06-20T09:00:00.000Z",
    created_at: "2026-02-05T09:00:00.000Z",
    updated_at: "2026-06-20T09:00:00.000Z",
    steps: [],
    ...overrides,
  };
}

describe("bottling data layer", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it("maps a priming DTO to the domain shape (happy path)", async () => {
    mockedRequest.mockResolvedValue(primingDto());

    const priming = await getPriming("b1");

    expect(mockedRequest).toHaveBeenCalledWith("/batches/b1/priming");
    expect(priming).toEqual({
      sugarGrams: 28,
      sugarType: "table_sugar",
      targetCo2Vol: 2.4,
      volumeL: 4.3,
      safetyWarning: "Sécurité : ne dépassez jamais la dose…",
    });
    // Pins the snake_case backend contract: the fixture above is the real
    // backend `PrimingDto` shape and `sugar_grams` must surface as `sugarGrams`.
    expect(priming.sugarGrams).toBe(28);
  });

  it("maps a tasting DTO and nullish-coalesces a missing note (edge path)", async () => {
    mockedRequest.mockResolvedValue(tastingDto({ note: undefined }));

    const tasting = await getTasting("b1");

    expect(mockedRequest).toHaveBeenCalledWith("/batches/b1/tasting");
    expect(tasting).toEqual({
      id: "t1",
      batchId: "b1",
      rating: 4,
      note: null,
      createdAt: "2026-06-20T09:00:00.000Z",
    });
  });

  it("POSTs a tasting creation payload and maps the response (happy path)", async () => {
    mockedRequest.mockResolvedValue(tastingDto({ rating: 5, note: "Top" }));

    const created = await createTasting("b1", { rating: 5, note: "Top" });

    expect(mockedRequest).toHaveBeenCalledWith("/batches/b1/tasting", {
      method: "POST",
      body: { rating: 5, note: "Top" },
    });
    expect(created.rating).toBe(5);
    expect(created.note).toBe("Top");
  });

  it("POSTs the close endpoint and maps the batch (happy path)", async () => {
    mockedRequest.mockResolvedValue(batchDto());

    const batch = await closeBottling("b1");

    expect(mockedRequest).toHaveBeenCalledWith("/batches/b1/bottling/close", {
      method: "POST",
    });
    expect(batch.status).toBe("completed");
    expect(batch.bottledAt).toBe("2026-06-20T09:00:00.000Z");
  });

  it("nulls bottled_at when the backend omits it (edge path)", async () => {
    mockedRequest.mockResolvedValue(batchDto({ bottled_at: undefined }));

    const batch = await closeBottling("b1");

    expect(batch.bottledAt).toBeNull();
  });

  it("propagates http-client errors when reading a tasting (sad path)", async () => {
    mockedRequest.mockRejectedValue(new Error("404 Tasting not found"));

    await expect(getTasting("b1")).rejects.toThrow("404 Tasting not found");
  });
});
