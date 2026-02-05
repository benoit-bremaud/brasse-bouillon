import { RecipeStepType } from '../../../recipe/domain/enums/recipe-step-type.enum';

import { BatchStepStatus } from '../enums/batch-step-status.enum';

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
}
