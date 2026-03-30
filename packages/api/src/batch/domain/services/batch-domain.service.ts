import { RecipeStep } from '../../../recipe/domain/entities/recipe-step.entity';

import { BatchStatus } from '../enums/batch-status.enum';
import { BatchStepStatus } from '../enums/batch-step-status.enum';
import { BatchStep } from '../entities/batch-step.entity';
import { Batch, BatchId, RecipeId, UserId } from '../entities/batch.entity';

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
 * - Step 0 is auto-started when the batch starts
 * - Completing the current step auto-advances to the next one
 */
export class BatchDomainService {
  constructor(private readonly now: () => Date = () => new Date()) {}

  startBatch(input: StartBatchInput): Batch {
    this.validateRecipeSteps(input.steps);

    const createdAt = this.now();

    const sortedSteps = [...input.steps].sort((a, b) => a.order - b.order);
    const steps: BatchStep[] = sortedSteps.map((step) => {
      const isFirst = step.order === 0;
      return {
        order: step.order,
        type: step.type,
        label: step.label,
        description: step.description,
        status: isFirst ? BatchStepStatus.IN_PROGRESS : BatchStepStatus.PENDING,
        startedAt: isFirst ? createdAt : undefined,
        completedAt: undefined,
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
        return { ...step, status: BatchStepStatus.IN_PROGRESS, startedAt: now };
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
