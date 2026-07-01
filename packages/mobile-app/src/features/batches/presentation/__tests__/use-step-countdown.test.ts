import { act, renderHook } from "@testing-library/react-native";

import { BatchStep } from "@/features/batches/domain/batch.types";
import {
  formatCountdown,
  useStepCountdown,
} from "@/features/batches/presentation/use-step-countdown";

function makeStep(overrides: Partial<BatchStep> = {}): BatchStep {
  return {
    batchId: "b-1",
    stepOrder: 0,
    type: "mash",
    label: "Empâtage 67°C",
    status: "in_progress",
    createdAt: "2026-05-19T09:00:00.000Z",
    updatedAt: "2026-05-19T09:00:00.000Z",
    ...overrides,
  };
}

describe("formatCountdown", () => {
  // Happy path
  it("formats seconds as MM:SS", () => {
    expect(formatCountdown(125)).toBe("02:05");
  });

  // Edge: past an hour
  it("includes hours past 3600s", () => {
    expect(formatCountdown(3661)).toBe("1:01:01");
  });

  // Sad path: negative clamps to zero
  it("clamps negative values to 00:00", () => {
    expect(formatCountdown(-5)).toBe("00:00");
  });
});

describe("useStepCountdown", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  // Sad path: no planned duration → no timer (fermentation / legacy steps)
  it("returns null when the step has no plannedDurationMin", () => {
    const { result } = renderHook(() =>
      useStepCountdown(makeStep({ plannedDurationMin: null }), true),
    );
    expect(result.current).toBeNull();
  });

  it("returns null for a null step", () => {
    const { result } = renderHook(() => useStepCountdown(null, true));
    expect(result.current).toBeNull();
  });

  // F1 PRÉP: a timed step in progress but not yet activated (no startedAt) runs
  // no countdown in live mode — the timer only starts on « Démarrer ».
  it("returns null in PRÉP (live, timed step with no startedAt)", () => {
    const { result } = renderHook(() =>
      useStepCountdown(
        makeStep({ plannedDurationMin: 30, startedAt: undefined }),
        false,
      ),
    );
    expect(result.current).toBeNull();
  });

  // F1 ACTIF: once activated (startedAt set) the countdown runs from that anchor.
  it("runs once the step is activated (live, startedAt set)", () => {
    const startedAt = new Date(Date.now() - 5 * 60_000).toISOString(); // 5 min ago
    const { result } = renderHook(() =>
      useStepCountdown(makeStep({ plannedDurationMin: 30, startedAt }), false),
    );
    expect(result.current).not.toBeNull();
    expect(result.current?.remainingSec).toBeGreaterThanOrEqual(1480);
    expect(result.current?.remainingSec).toBeLessThanOrEqual(1500);
  });

  // Happy path: demo anchors mid-brew (~40% remaining of a 30 min step)
  it("computes a mid-brew countdown in demo mode", () => {
    const { result } = renderHook(() =>
      useStepCountdown(makeStep({ plannedDurationMin: 30 }), true),
    );
    expect(result.current).not.toBeNull();
    expect(result.current?.totalSec).toBe(1800);
    expect(result.current?.remainingSec).toBeGreaterThanOrEqual(700);
    expect(result.current?.remainingSec).toBeLessThanOrEqual(740);
    expect(result.current?.progressPct).toBeGreaterThanOrEqual(58);
    expect(result.current?.progressPct).toBeLessThanOrEqual(62);
  });

  // Edge: it ticks down over time
  it("decreases as time advances", () => {
    const { result } = renderHook(() =>
      useStepCountdown(makeStep({ plannedDurationMin: 30 }), true),
    );
    const first = result.current?.remainingSec ?? 0;
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    const later = result.current?.remainingSec ?? 0;
    expect(later).toBeLessThan(first);
  });

  // P1 regression: when the active step changes, the anchor must reset so the
  // countdown measures the NEW step, not continue from the previous one.
  it("re-anchors when the step changes", () => {
    const { result, rerender } = renderHook(
      ({ step }: { step: BatchStep }) => useStepCountdown(step, true),
      {
        initialProps: {
          step: makeStep({ stepOrder: 0, plannedDurationMin: 30 }),
        },
      },
    );
    act(() => {
      jest.advanceTimersByTime(120_000);
    });

    rerender({ step: makeStep({ stepOrder: 1, plannedDurationMin: 60 }) });

    // Re-anchored to ~60% elapsed of the new 60 min step (~1440s left), not the
    // ~600s that the old 30 min step had drained to.
    expect(result.current?.totalSec).toBe(3600);
    expect(result.current?.remainingSec).toBeGreaterThanOrEqual(1400);
    expect(result.current?.remainingSec).toBeLessThanOrEqual(1480);
  });

  // Live mode: a late-arriving startedAt re-anchors to the real start time.
  it("re-anchors when startedAt arrives late (live mode)", () => {
    const startedAt = new Date(Date.now() - 5 * 60_000).toISOString(); // 5 min ago
    const { result, rerender } = renderHook(
      ({ step }: { step: BatchStep }) => useStepCountdown(step, false),
      {
        initialProps: {
          step: makeStep({ plannedDurationMin: 30, startedAt: undefined }),
        },
      },
    );

    rerender({ step: makeStep({ plannedDurationMin: 30, startedAt }) });

    // 30 min total, 5 min elapsed → ~25 min (1500s) remaining.
    expect(result.current?.remainingSec).toBeGreaterThanOrEqual(1480);
    expect(result.current?.remainingSec).toBeLessThanOrEqual(1500);
  });
});
