import {
  getProgressPercent,
  getTimelineLayout,
} from "@/features/batches/presentation/BatchTimeline";

import { BatchStep } from "@/features/batches/domain/batch.types";

const makeStep = (
  stepOrder: number,
  status: BatchStep["status"],
): BatchStep => ({
  batchId: "b1",
  stepOrder,
  type: "mash",
  label: `Step ${stepOrder}`,
  status,
  createdAt: "2026-02-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
});

describe("getProgressPercent", () => {
  it("returns 0 for empty steps", () => {
    expect(getProgressPercent([])).toBe(0);
  });

  it("handles single-step batches", () => {
    expect(getProgressPercent([makeStep(0, "completed")])).toBe(100);
    expect(getProgressPercent([makeStep(0, "pending")])).toBe(0);
  });

  it("uses in_progress step position when present", () => {
    const steps = [
      makeStep(0, "completed"),
      makeStep(1, "in_progress"),
      makeStep(2, "pending"),
    ];

    expect(getProgressPercent(steps)).toBe(50);
  });

  it("uses last completed marker when no in_progress step exists", () => {
    const oneCompleted = [
      makeStep(0, "completed"),
      makeStep(1, "pending"),
      makeStep(2, "pending"),
    ];

    const twoCompleted = [
      makeStep(0, "completed"),
      makeStep(1, "completed"),
      makeStep(2, "pending"),
    ];

    expect(getProgressPercent(oneCompleted)).toBe(0);
    expect(getProgressPercent(twoCompleted)).toBe(50);
  });

  it("returns 0 when no step is completed and none is in progress", () => {
    const steps = [
      makeStep(0, "pending"),
      makeStep(1, "pending"),
      makeStep(2, "pending"),
    ];

    expect(getProgressPercent(steps)).toBe(0);
  });
});

describe("getTimelineLayout", () => {
  it("returns zeroed layout for empty timeline", () => {
    expect(getTimelineLayout(0, 360)).toEqual({
      timelineWidth: 0,
      stepWidth: 0,
      trackWidth: 0,
    });
  });

  it("keeps one-step timeline centered with no track", () => {
    const layout = getTimelineLayout(1, 360);

    expect(layout.trackWidth).toBe(0);
    expect(layout.timelineWidth).toBeGreaterThan(0);
    expect(layout.stepWidth).toBe(layout.timelineWidth);
  });

  it("uses minimum step width when screen is narrow", () => {
    const layout = getTimelineLayout(6, 320);

    expect(layout.timelineWidth).toBe(504);
    expect(layout.stepWidth).toBe(84);
    expect(layout.trackWidth).toBe(420);
  });

  it("fills available viewport when enough horizontal space exists", () => {
    const layout = getTimelineLayout(3, 390);

    expect(layout.timelineWidth).toBe(342);
    expect(layout.stepWidth).toBe(114);
    expect(layout.trackWidth).toBe(228);
  });
});
