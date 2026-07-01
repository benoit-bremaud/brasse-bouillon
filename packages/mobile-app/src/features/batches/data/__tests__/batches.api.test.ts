/**
 * Guards the batch DTO → domain mapping, in particular the B1-live step
 * enrichment: `planned_duration_min` + `pedagogical_tip` must survive the
 * mapping so the live step card shows the ⓘ tip and the countdown timer
 * (previously demo-only).
 */

import * as httpClient from "@/core/http/http-client";

import { deleteBatch, getMineById } from "@/features/batches/data/batches.api";

jest.mock("@/core/http/http-client");

const mockedRequest = httpClient.request as jest.MockedFunction<
  typeof httpClient.request
>;

function batchDtoWithStep(stepOverrides: Record<string, unknown> = {}) {
  return {
    id: "b1",
    owner_id: "u1",
    recipe_id: "r1",
    status: "in_progress",
    current_step_order: 0,
    started_at: "2026-02-05T09:00:00.000Z",
    created_at: "2026-02-05T09:00:00.000Z",
    updated_at: "2026-02-05T09:00:00.000Z",
    steps: [
      {
        batch_id: "b1",
        step_order: 0,
        type: "mash",
        label: "Mash",
        description: "d",
        status: "in_progress",
        created_at: "2026-02-05T09:00:00.000Z",
        updated_at: "2026-02-05T09:00:00.000Z",
        ...stepOverrides,
      },
    ],
  };
}

describe("batches.api — mapBatchStep enrichment (B1-live)", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it("maps planned duration + pedagogical tip onto a batch step (happy)", async () => {
    mockedRequest.mockResolvedValue(
      batchDtoWithStep({
        planned_duration_min: 60,
        pedagogical_tip: "pourquoi empâter à 67°C",
      }),
    );

    const batch = await getMineById("b1");

    expect(batch.steps[0].plannedDurationMin).toBe(60);
    expect(batch.steps[0].pedagogicalTip).toBe("pourquoi empâter à 67°C");
  });

  it("nulls them when the backend omits them (edge: legacy / over-days steps)", async () => {
    mockedRequest.mockResolvedValue(batchDtoWithStep());

    const batch = await getMineById("b1");

    expect(batch.steps[0].plannedDurationMin).toBeNull();
    expect(batch.steps[0].pedagogicalTip).toBeNull();
  });
});

describe("batches.api — deleteBatch (F25)", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it("DELETEs a batch by id (happy)", async () => {
    mockedRequest.mockResolvedValue(undefined as never);

    await deleteBatch("b1");

    expect(mockedRequest).toHaveBeenCalledWith("/batches/b1", {
      method: "DELETE",
    });
  });

  it("propagates the request error (sad)", async () => {
    mockedRequest.mockRejectedValue(new Error("boom"));

    await expect(deleteBatch("b1")).rejects.toThrow("boom");
  });
});
