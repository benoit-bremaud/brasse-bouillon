import {
  MIN_TIMELINE_STEP_WIDTH,
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
    const stepCount = 1;
    const availableWidth = 360;
    const layout = getTimelineLayout(stepCount, availableWidth);

    const expectedTimelineWidth = Math.max(
      availableWidth,
      stepCount * MIN_TIMELINE_STEP_WIDTH,
    );

    expect(layout.trackWidth).toBe(0);
    expect(layout.timelineWidth).toBe(expectedTimelineWidth);
    expect(layout.stepWidth).toBeCloseTo(layout.timelineWidth / stepCount);
  });

  it("uses minimum step width when screen is narrow", () => {
    const stepCount = 6;
    const availableWidth = 320;
    const layout = getTimelineLayout(stepCount, availableWidth);

    const expectedTimelineWidth = Math.max(
      availableWidth,
      stepCount * MIN_TIMELINE_STEP_WIDTH,
    );

    expect(layout.timelineWidth).toBe(expectedTimelineWidth);
    expect(layout.timelineWidth).toBeGreaterThan(availableWidth);

    expect(layout.stepWidth).toBeCloseTo(layout.timelineWidth / stepCount);
    expect(layout.trackWidth).toBeCloseTo(
      layout.timelineWidth - layout.stepWidth,
    );
  });

  it("fills available viewport when enough horizontal space exists", () => {
    const stepCount = 3;
    const availableWidth = 390;
    const layout = getTimelineLayout(stepCount, availableWidth);

    const expectedTimelineWidth = Math.max(
      availableWidth,
      stepCount * MIN_TIMELINE_STEP_WIDTH,
    );

    expect(layout.timelineWidth).toBe(expectedTimelineWidth);
    expect(layout.timelineWidth).toBeLessThanOrEqual(availableWidth);
    expect(layout.stepWidth).toBeCloseTo(layout.timelineWidth / stepCount);
    expect(layout.trackWidth).toBeCloseTo(
      layout.timelineWidth - layout.stepWidth,
    );
  });
});
