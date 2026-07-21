import { RecipeStep } from '../../../recipe/domain/entities/recipe-step.entity';
import { RecipeStepType } from '../../../recipe/domain/enums/recipe-step-type.enum';

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
  /**
   * The recipe's boil time (minutes), used as the BOIL step's real planned
   * duration instead of the generic step-guidance default. Null/absent → the
   * default stands.
   */
  boilTimeMin?: number | null;
}

export interface PrepareBatchInput {
  id: BatchId;
  ownerId: UserId;
  recipeId: RecipeId;
}

/**
 * BatchDomainService
 *
 * Pure domain service responsible for:
 * - Preparing a draft batch that carries the mise-en-place (brew-day/07)
 * - Launching it (or starting one directly) from a recipe step snapshot
 * - Tracking strict workflow progress through steps
 *
 * Current MVP behavior:
 * - Step 0 becomes the current step when the batch launches, but opens in the
 *   PRÉP phase (in_progress with no `startedAt`) — the timer only starts once
 *   the brewer activates it via `startCurrentStep` (ACTIF). See brew-day/06.
 * - Completing the current step auto-advances to the next one (also in PRÉP)
 */
export class BatchDomainService {
  constructor(private readonly now: () => Date = () => new Date()) {}

  /**
   * Create a draft « en préparation » batch (brew-day/07, F14/F15): no steps,
   * no `launchedAt` — it exists to carry the per-batch prep checklist until
   * the brewer launches (or discards) it.
   */
  prepareBatch(input: PrepareBatchInput): Batch {
    const createdAt = this.now();

    return {
      id: input.id,
      ownerId: input.ownerId,
      recipeId: input.recipeId,
      status: BatchStatus.IN_PROGRESS,
      currentStepOrder: undefined,
      steps: [],
      createdAt,
      updatedAt: createdAt,
      // The schema keeps started_at NOT NULL: a draft stores its creation
      // instant; launchBatch refreshes it. Clients never see it while draft
      // (the DTO derives startedAt from launchedAt).
      startedAt: createdAt,
      launchedAt: undefined,
      prepCheckedIds: undefined,
      completedAt: undefined,
    };
  }

  /**
   * Launch a draft: snapshot the recipe steps onto the batch and stamp
   * `launchedAt` (the draft → in_progress transition of brew-day/07). The
   * first step opens in PRÉP (no step `startedAt`) per brew-day/06.
   */
  launchBatch(
    batch: Batch,
    recipeSteps: ReadonlyArray<RecipeStep>,
    boilTimeMin?: number | null,
  ): Batch {
    if (batch.launchedAt !== undefined) {
      throw new Error('Batch already launched');
    }
    this.validateRecipeSteps(recipeSteps);

    const now = this.now();

    return {
      ...batch,
      status: BatchStatus.IN_PROGRESS,
      currentStepOrder: 0,
      steps: this.snapshotSteps(recipeSteps, boilTimeMin),
      updatedAt: now,
      startedAt: now,
      launchedAt: now,
    };
  }

  /** Prepare + launch in one shot — the direct POST /batches path. */
  startBatch(input: StartBatchInput): Batch {
    return this.launchBatch(
      this.prepareBatch(input),
      input.steps,
      input.boilTimeMin,
    );
  }

  /**
   * Freeze the recipe steps onto the batch (the launch-time snapshot). Every
   * step starts pending except step 0, which opens as the current step in the
   * PRÉP phase (no `startedAt` until the brewer activates it — F1).
   */
  private snapshotSteps(
    recipeSteps: ReadonlyArray<RecipeStep>,
    boilTimeMin?: number | null,
  ): BatchStep[] {
    const sortedSteps = [...recipeSteps].sort((a, b) => a.order - b.order);
    return sortedSteps.map((step) => {
      const isFirst = step.order === 0;
      const guidance = getStepGuidance(step.type);
      // The BOIL step gets the recipe's real boil time when it carries one
      // (a positive value); otherwise the generic step-guidance default stands.
      const plannedDurationMin =
        step.type === RecipeStepType.BOIL && boilTimeMin && boilTimeMin > 0
          ? boilTimeMin
          : (guidance?.plannedDurationMin ?? undefined);
      return {
        order: step.order,
        type: step.type,
        label: step.label,
        description: step.description,
        status: isFirst ? BatchStepStatus.IN_PROGRESS : BatchStepStatus.PENDING,
        startedAt: undefined,
        completedAt: undefined,
        pedagogicalTip: guidance?.pedagogicalTip,
        plannedDurationMin,
        // An empty list (e.g. PACKAGING — the B3 bottling gate covers it)
        // stays undefined so the column persists null and mobile renders no
        // empty PRÉP block.
        prepActions: guidance?.prepActions.length
          ? guidance.prepActions
          : undefined,
        doneWhen: guidance?.doneWhen,
      };
    });
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
