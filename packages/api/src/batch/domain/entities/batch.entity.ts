import { BatchStatus } from '../enums/batch-status.enum';

import { BatchStep } from './batch-step.entity';

/**
 * Unique identifier type for a Batch aggregate.
 */
export type BatchId = string;

/**
 * Unique identifier type for a User.
 */
export type UserId = string;

/**
 * Unique identifier type for a Recipe.
 */
export type RecipeId = string;

/**
 * Batch
 *
 * Domain representation of a brewing batch (brewing assistant run).
 *
 * A Batch snapshots the recipe steps at start time, then tracks progress
 * through those steps (strict workflow, single in-progress step).
 */
export interface Batch {
  readonly id: BatchId;
  readonly ownerId: UserId;
  readonly recipeId: RecipeId;

  readonly status: BatchStatus;

  /**
   * Order of the step currently in progress.
   * Undefined when the batch is completed.
   */
  readonly currentStepOrder?: number;

  /** Snapshot of recipe steps at batch start. */
  readonly steps: ReadonlyArray<BatchStep>;

  readonly createdAt: Date;
  readonly updatedAt: Date;

  /**
   * Start timestamp for the batch. For a prep draft (`launchedAt` undefined)
   * this is the row-creation instant (the column is NOT NULL); Launch
   * refreshes it to the launch instant, after which both agree.
   */
  readonly startedAt: Date;

  /**
   * Launch timestamp (brew-day/07). Undefined = the batch is a « en
   * préparation » draft: it carries the prep checklist and has no steps yet.
   */
  readonly launchedAt?: Date;

  /**
   * Checked prep-item ids the draft carries (F14 — per-batch checklist state;
   * the items themselves stay derived from the recipe).
   */
  readonly prepCheckedIds?: ReadonlyArray<string>;

  /** Timestamp when fermentation was started. */
  readonly fermentationStartedAt?: Date;

  /** Timestamp when fermentation was completed. */
  readonly fermentationCompletedAt?: Date;

  /** Timestamp when the batch was bottled/closed (B3). */
  readonly bottledAt?: Date;

  /** Completion timestamp when the batch finishes. */
  readonly completedAt?: Date;
}
