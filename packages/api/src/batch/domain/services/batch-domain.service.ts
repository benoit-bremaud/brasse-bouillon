import { RecipeStep } from '../../../recipe/domain/entities/recipe-step.entity';

import { BatchStatus } from '../enums/batch-status.enum';
import { BatchStepStatus } from '../enums/batch-step-status.enum';
import { BatchStep } from '../entities/batch-step.entity';
import { Batch, BatchId, RecipeId, UserId } from '../entities/batch.entity';
import { getStepGuidance } from './step-guidance';

export interface StartBatchInput {
  id: BatchId;
  ownerId: UserId;
  recipeId: RecipeId;
  steps: ReadonlyArray<RecipeStep>;
}

/**
 * BatchDomainService
 *
 * Pure domain service responsible for:
 * - Starting a new brewing batch from a recipe step snapshot
 * - Tracking strict workflow progress through steps
 *
 * Current MVP behavior:
 * - Step 0 becomes the current step when the batch starts, but opens in the
 *   PRÉP phase (in_progress with no `startedAt`) — the timer only starts once
 *   the brewer activates it via `startCurrentStep` (ACTIF). See brew-day/06.
 * - Completing the current step auto-advances to the next one (also in PRÉP)
 */
export class BatchDomainService {
  constructor(private readonly now: () => Date = () => new Date()) {}

  startBatch(input: StartBatchInput): Batch {
    this.validateRecipeSteps(input.steps);

    const createdAt = this.now();

    const sortedSteps = [...input.steps].sort((a, b) => a.order - b.order);
    const steps: BatchStep[] = sortedSteps.map((step) => {
      const isFirst = step.order === 0;
      const guidance = getStepGuidance(step.type);
      return {
        order: step.order,
        type: step.type,
        label: step.label,
        description: step.description,
        status: isFirst ? BatchStepStatus.IN_PROGRESS : BatchStepStatus.PENDING,
        // PRÉP phase: the current step has no `startedAt` until the brewer
        // activates it (ACTIF). This keeps the countdown from running before
        // the physical prep is done (novice-journey friction F1).
        startedAt: undefined,
        completedAt: undefined,
        pedagogicalTip: guidance?.pedagogicalTip,
        plannedDurationMin: guidance?.plannedDurationMin ?? undefined,
      };
    });

    return {
      id: input.id,
      ownerId: input.ownerId,
      recipeId: input.recipeId,
      status: BatchStatus.IN_PROGRESS,
      currentStepOrder: 0,
      steps,
      createdAt,
      updatedAt: createdAt,
      startedAt: createdAt,
      completedAt: undefined,
    };
  }

  completeCurrentStep(batch: Batch): Batch {
    if (batch.status !== BatchStatus.IN_PROGRESS) {
      throw new Error('Batch is not in progress');
    }

    const currentOrder = this.getCurrentStepOrder(batch);
    if (currentOrder === undefined) {
      throw new Error('Batch has no current step');
    }

    const current = batch.steps.find((step) => step.order === currentOrder);
    if (!current) {
      throw new Error(`Current step ${String(currentOrder)} not found`);
    }
    if (current.status !== BatchStepStatus.IN_PROGRESS) {
      throw new Error('Current step is not in progress');
    }

    const now = this.now();

    const hasNext = batch.steps.some((s) => s.order === currentOrder + 1);
    const nextOrder = hasNext ? currentOrder + 1 : undefined;

    const steps: BatchStep[] = batch.steps.map((step) => {
      if (step.order === currentOrder) {
        return { ...step, status: BatchStepStatus.COMPLETED, completedAt: now };
      }
      if (step.order === nextOrder) {
        // Next step opens in PRÉP (no `startedAt`) — activated later (F1).
        return { ...step, status: BatchStepStatus.IN_PROGRESS };
      }
      return step;
    });

    if (nextOrder !== undefined) {
      return {
        ...batch,
        steps,
        currentStepOrder: nextOrder,
        updatedAt: now,
      };
    }

    return {
      ...batch,
      steps,
      status: BatchStatus.COMPLETED,
      currentStepOrder: undefined,
      updatedAt: now,
      completedAt: now,
    };
  }

  /**
   * Activate the current step: PRÉP → ACTIF (brew-day/06).
   *
   * Sets `startedAt` on the current in-progress step, which is the anchor the
   * countdown keys off. Idempotency is the caller's concern: activating an
   * already-active step (one that already has `startedAt`) is rejected.
   */
  startCurrentStep(batch: Batch): Batch {
    if (batch.status !== BatchStatus.IN_PROGRESS) {
      throw new Error('Batch is not in progress');
    }

    const currentOrder = this.getCurrentStepOrder(batch);
    if (currentOrder === undefined) {
      throw new Error('Batch has no current step');
    }

    const current = batch.steps.find((step) => step.order === currentOrder);
    if (!current) {
      throw new Error(`Current step ${String(currentOrder)} not found`);
    }
    if (current.status !== BatchStepStatus.IN_PROGRESS) {
      throw new Error('Current step is not in progress');
    }
    if (current.startedAt !== undefined) {
      throw new Error('Current step is already active');
    }

    const now = this.now();

    const steps: BatchStep[] = batch.steps.map((step) =>
      step.order === currentOrder ? { ...step, startedAt: now } : step,
    );

    return { ...batch, steps, updatedAt: now };
  }

  private getCurrentStepOrder(batch: Batch): number | undefined {
    if (typeof batch.currentStepOrder === 'number') {
      return batch.currentStepOrder;
    }

    const current = batch.steps.find(
      (step) => step.status === BatchStepStatus.IN_PROGRESS,
    );
    return current?.order;
  }

  private validateRecipeSteps(steps: ReadonlyArray<RecipeStep>): void {
    if (steps.length === 0) {
      throw new Error('Batch must include at least one step');
    }

    const orders = steps.map((step) => step.order);
    for (const order of orders) {
      if (!Number.isInteger(order) || order < 0) {
        throw new Error('Step order must be a non-negative integer');
      }
    }

    if (new Set(orders).size !== orders.length) {
      throw new Error('Step orders must be unique');
    }

    const sortedOrders = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i) {
        throw new Error('Step orders must start at 0 and be continuous');
      }
    }

    for (const step of steps) {
      if (!step.label || step.label.trim().length === 0) {
        throw new Error('Step label must not be empty');
      }
    }
  }
}
