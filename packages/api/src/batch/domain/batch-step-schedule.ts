import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';

/**
 * Minimal shape needed to derive a step's deadline — the persisted launch
 * snapshot fields. Accepts the ORM entity or any structurally-compatible row.
 */
export interface ScheduledStep {
  started_at?: Date | null;
  planned_duration_min?: number | null;
}

/**
 * Whether a missed deadline on this step type degrades the beer, so the
 * dashboard should surface it as a critical alert. Derived from the step
 * `type` — no dedicated column. The exhaustive `switch` (no `default`) makes a
 * new `RecipeStepType` member a compile error until its criticality is decided.
 *
 * Quality-critical: FERMENTATION (biological window) and PACKAGING
 * (conditioning / carbonation). MASH / BOIL / WHIRLPOOL are time-sensitive
 * process steps but not "quality-critical" in the alert sense.
 */
export function isQualityCriticalType(type: RecipeStepType): boolean {
  switch (type) {
    case RecipeStepType.FERMENTATION:
    case RecipeStepType.PACKAGING:
      return true;
    case RecipeStepType.MASH:
    case RecipeStepType.BOIL:
    case RecipeStepType.WHIRLPOOL:
      return false;
  }
}

/**
 * Absolute instant a step is due: when it started plus its planned duration.
 * `null` when the step is absent, has not started, or carries no planned
 * duration — the dashboard shows a neutral "no deadline yet" state rather than
 * a fabricated one.
 */
export function computeStepDueAt(
  step: ScheduledStep | null | undefined,
): Date | null {
  if (!step || !step.started_at || step.planned_duration_min == null) {
    return null;
  }
  return new Date(
    step.started_at.getTime() + step.planned_duration_min * 60_000,
  );
}
