import React from "react";

import { BatchStep } from "@/features/batches/domain/batch.types";

// In demo mode the countdown is anchored mid-brew so a screenshot reads a
// believable "running timer" (~40% remaining), mirroring the pinned
// fermentation tracker (J+5 / J+14). Live mode uses the real `startedAt`.
const DEMO_ELAPSED_FRACTION = 0.6;

export type StepCountdown = {
  remainingSec: number;
  totalSec: number;
  progressPct: number;
};

/**
 * Countdown for an in-progress brewing step that declares a planned duration
 * (brewing assistant, #781). Ticks once per second. Returns `null` when the
 * step has no `plannedDurationMin` (e.g. fermentation, which uses the day-based
 * tracker instead, or legacy steps).
 *
 * Hooks run unconditionally; the `null` result is what callers gate on.
 */
export function useStepCountdown(
  step: BatchStep | null,
  useDemoData: boolean,
): StepCountdown | null {
  const totalSec =
    step?.plannedDurationMin != null ? step.plannedDurationMin * 60 : 0;

  // Lazily fix the anchor (epoch ms from which elapsed time is measured) once,
  // so the countdown doesn't reset on every render.
  const anchorRef = React.useRef<number | null>(null);
  if (anchorRef.current === null && totalSec > 0) {
    if (useDemoData) {
      anchorRef.current = Date.now() - totalSec * DEMO_ELAPSED_FRACTION * 1000;
    } else if (step?.startedAt) {
      anchorRef.current = new Date(step.startedAt).getTime();
    } else {
      anchorRef.current = Date.now();
    }
  }

  const readRemaining = React.useCallback((): number => {
    if (totalSec <= 0 || anchorRef.current === null) {
      return 0;
    }
    const elapsedSec = (Date.now() - anchorRef.current) / 1000;
    return Math.max(0, Math.round(totalSec - elapsedSec));
  }, [totalSec]);

  const [remainingSec, setRemainingSec] = React.useState<number>(readRemaining);

  React.useEffect(() => {
    if (totalSec <= 0) {
      return;
    }
    setRemainingSec(readRemaining());
    const id = setInterval(() => setRemainingSec(readRemaining()), 1000);
    return () => clearInterval(id);
  }, [totalSec, readRemaining]);

  if (totalSec <= 0) {
    return null;
  }

  const progressPct = Math.round(((totalSec - remainingSec) / totalSec) * 100);
  return { remainingSec, totalSec, progressPct };
}

/** Format a remaining-seconds value as `MM:SS` (or `H:MM:SS` past an hour). */
export function formatCountdown(remainingSec: number): string {
  const safe = Math.max(0, Math.floor(remainingSec));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
