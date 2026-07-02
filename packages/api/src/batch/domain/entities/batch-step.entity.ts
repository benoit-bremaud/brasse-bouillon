import { RecipeStepType } from '../../../recipe/domain/enums/recipe-step-type.enum';

import { BatchStepStatus } from '../enums/batch-step-status.enum';

/**
 * One physical prep gesture of a step's PRÉP phase (F4), with its one-line
 * pedagogical why — the app teaches the craft, a novice must learn to brew
 * alone, not just execute (brew-day/01 + 06, educational vocation).
 *
 * Lives with the entities (not the guidance service) so the dependency points
 * services → entities, never the reverse.
 */
export interface StepPrepAction {
  readonly action: string;
  readonly why: string;
}

/**
 * BatchStep
 *
 * Snapshot of a recipe step at the time a batch is started,
 * enriched with runtime progress tracking (started/completed).
 */
export interface BatchStep {
  /** Position of the step within the workflow (0-based). */
  readonly order: number;

  /** High-level brewing step type (mash/boil/whirlpool/fermentation/packaging). */
  readonly type: RecipeStepType;

  /** Editable label snapshot. */
  readonly label: string;

  /** Editable description snapshot. */
  readonly description?: string;

  /** Runtime status during the batch. */
  readonly status: BatchStepStatus;

  /** Timestamp when this step became active. */
  readonly startedAt?: Date;

  /** Timestamp when this step was completed. */
  readonly completedAt?: Date;

  /** Beginner "why" tip for this step (type-level guidance, B1-live). */
  readonly pedagogicalTip?: string;

  /** Default planned duration in minutes; null/undefined when not time-boxed. */
  readonly plannedDurationMin?: number | null;

  /**
   * PRÉP-phase physical gestures + their pedagogical why (F4, brew-day/01+06).
   * Undefined when the type carries none (e.g. packaging — B3 covers it).
   */
  readonly prepActions?: readonly StepPrepAction[];

  /**
   * ACTIF-phase end condition (F5) — when the step is over, one pedagogical
   * sentence. Never gates Complete. Undefined on legacy steps.
   */
  readonly doneWhen?: string;
}
