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
 * tracker instead, or legacy steps), or when the step is still in PRÉP — in
 * progress but not yet activated (no `startedAt`), so no timer runs until the
 * brewer taps « Démarrer » (novice-journey friction F1; see brew-day/06).
 *
 * Hooks run unconditionally; the `null` result is what callers gate on.
 */
export function useStepCountdown(
  step: BatchStep | null,
  useDemoData: boolean,
): StepCountdown | null {
  // ACTIF vs PRÉP: a timed step only counts down once activated (`startedAt`
  // set). Demo mode always shows a running timer for the screenshot.
  const isActive = useDemoData || step?.startedAt != null;
  const totalSec =
    isActive && step?.plannedDurationMin != null
      ? step.plannedDurationMin * 60
      : 0;

  // Identity of the step the anchor was fixed for. When it changes — the active
  // step moves on, or `startedAt` arrives late from persisted state — the anchor
  // must be recomputed, otherwise the countdown keeps measuring from the
  // previous step (the #781 P1 review finding).
  const stepKey =
    step != null && totalSec > 0
      ? `${step.batchId}:${step.stepOrder}:${step.startedAt ?? ""}`
      : null;

  // Epoch ms from which elapsed time is measured. Re-anchored during render
  // whenever `stepKey` changes (deriving state from props without an effect).
  const anchorRef = React.useRef<number | null>(null);
  const anchorKeyRef = React.useRef<string | null>(null);
  if (stepKey !== anchorKeyRef.current) {
    anchorKeyRef.current = stepKey;
    if (stepKey === null) {
      anchorRef.current = null;
    } else if (useDemoData) {
      anchorRef.current = Date.now() - totalSec * DEMO_ELAPSED_FRACTION * 1000;
    } else if (step?.startedAt) {
      anchorRef.current = new Date(step.startedAt).getTime();
    } else {
      // Unreachable while `stepKey` is non-null (that requires `totalSec > 0`,
      // hence `isActive`). Defensive null so a stray render never anchors to now.
      anchorRef.current = null;
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
    // Re-syncs immediately on step change (stepKey dep), then ticks each second.
    setRemainingSec(readRemaining());
    const id = setInterval(() => setRemainingSec(readRemaining()), 1000);
    return () => clearInterval(id);
  }, [totalSec, readRemaining, stepKey]);

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
