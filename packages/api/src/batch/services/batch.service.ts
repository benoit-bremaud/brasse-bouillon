import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { EntityManager, IsNull, QueryFailedError, Repository } from 'typeorm';

import { RecipeStep } from '../../recipe/domain/entities/recipe-step.entity';
import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';
import { RecipeService } from '../../recipe/services/recipe.service';

import { BatchDomainService } from '../domain/services/batch-domain.service';
import { BatchStep } from '../domain/entities/batch-step.entity';
import { Batch } from '../domain/entities/batch.entity';
import { BatchReminderStatus } from '../domain/enums/batch-reminder-status.enum';
import { BatchStatus } from '../domain/enums/batch-status.enum';
import { BatchStepStatus } from '../domain/enums/batch-step-status.enum';
import { BatchReminderOrmEntity } from '../entities/batch-reminder.orm.entity';
import { BatchOrmEntity } from '../entities/batch.orm.entity';
import { BatchStepOrmEntity } from '../entities/batch-step.orm.entity';
import { MeasurementOrmEntity } from '../entities/measurement.orm.entity';
import { MeasurementType } from '../domain/enums/measurement-type.enum';
import {
  createMeasurement,
  Measurement,
  MeasurementValidationError,
} from '../domain/measurement.factory';
import { ObservationOrmEntity } from '../entities/observation.orm.entity';
import {
  createObservation,
  Observation,
  ObservationValidationError,
} from '../domain/observation.factory';
import { TastingOrmEntity } from '../entities/tasting.orm.entity';
import {
  createTasting,
  Tasting,
  TastingValidationError,
} from '../domain/tasting.factory';
import {
  computePrecisePriming,
  computeSimplePriming,
  PrimingResult,
} from '../domain/services/priming-calculator';

export interface BatchWithSteps {
  batch: BatchOrmEntity;
  steps: BatchStepOrmEntity[];
}

export interface BatchWithCurrentStep {
  batch: BatchOrmEntity;
  currentStep: BatchStepOrmEntity | null;
}

/** Composite key for the (batch_id, step_order) primary key of a batch step. */
function stepKey(batchId: string, stepOrder: number): string {
  return `${batchId}:${stepOrder}`;
}

export interface CreateMeasurementInput {
  type: MeasurementType;
  value: number;
  stepOrder?: number | null;
  unit?: string | null;
  takenAt?: Date;
}

export interface CreateObservationInput {
  freeText: string;
  stepOrder?: number | null;
  photoRefs?: string[] | null;
  moodScore?: number | null;
  observedAt?: Date;
}

export interface CreateBatchReminderInput {
  label: string;
  dueAt: Date;
}

export interface CreateTastingInput {
  rating: number;
  note?: string | null;
}

export interface PrimingOptions {
  targetCo2Vol?: number;
  beerTempC?: number;
}

export interface UpdateBatchReminderInput {
  label?: string;
  dueAt?: Date;
  status?: BatchReminderStatus;
}

@Injectable()
export class BatchService {
  private readonly domain = new BatchDomainService();

  constructor(
    @InjectRepository(BatchOrmEntity)
    private readonly batchRepo: Repository<BatchOrmEntity>,
    @InjectRepository(BatchStepOrmEntity)
    private readonly stepRepo: Repository<BatchStepOrmEntity>,
    @InjectRepository(BatchReminderOrmEntity)
    private readonly reminderRepo: Repository<BatchReminderOrmEntity>,
    @InjectRepository(MeasurementOrmEntity)
    private readonly measurementRepo: Repository<MeasurementOrmEntity>,
    @InjectRepository(ObservationOrmEntity)
    private readonly observationRepo: Repository<ObservationOrmEntity>,
    @InjectRepository(TastingOrmEntity)
    private readonly tastingRepo: Repository<TastingOrmEntity>,
    private readonly recipeService: RecipeService,
  ) {}

  async startMine(ownerId: string, recipeId: string): Promise<BatchWithSteps> {
    const recipeSteps = await this.recipeService.listMineSteps(
      ownerId,
      recipeId,
    );

    const snapshotSteps: RecipeStep[] = recipeSteps.map((step) => ({
      order: step.step_order,
      type: step.type,
      label: step.label,
      description: step.description ?? undefined,
    }));

    const batch = this.domain.startBatch({
      id: randomUUID(),
      ownerId,
      recipeId,
      steps: snapshotSteps,
    });

    return this.batchRepo.manager.transaction(async (manager) => {
      const { batch: savedBatch, steps } = await this.persistBatch(
        manager,
        batch,
      );
      return { batch: savedBatch, steps };
    });
  }

  /**
   * Create (or resume) the draft « en préparation » batch for a recipe
   * (brew-day/07, F14/F15). Idempotent: if the owner already has an unlaunched
   * draft for this recipe it is returned as-is — « Préparer » twice resumes
   * the same prep instead of piling up phantom drafts. To start over, discard
   * the draft (DELETE) and prepare again.
   */
  async prepareMine(
    ownerId: string,
    recipeId: string,
  ): Promise<BatchWithSteps> {
    const existingDraft = await this.batchRepo.findOne({
      where: { owner_id: ownerId, recipe_id: recipeId, launched_at: IsNull() },
    });
    if (existingDraft) {
      return { batch: existingDraft, steps: [] };
    }

    // Validates ownership/existence (404 on a foreign or unknown recipe) and
    // fails fast on an un-brewable recipe: a stepless draft could never launch.
    const recipeSteps = await this.recipeService.listMineSteps(
      ownerId,
      recipeId,
    );
    if (recipeSteps.length === 0) {
      throw new BadRequestException('Recipe has no steps');
    }

    const draft = this.domain.prepareBatch({
      id: randomUUID(),
      ownerId,
      recipeId,
    });

    try {
      return await this.batchRepo.manager.transaction(async (manager) => {
        return this.persistBatch(manager, draft);
      });
    } catch (error) {
      // A concurrent prepare won the race on the one-draft-per-owner+recipe
      // unique index between our findOne above and this insert — honour the
      // idempotency contract by resuming the winner's draft.
      if (error instanceof QueryFailedError) {
        const winner = await this.batchRepo.findOne({
          where: {
            owner_id: ownerId,
            recipe_id: recipeId,
            launched_at: IsNull(),
          },
        });
        if (winner) {
          return { batch: winner, steps: [] };
        }
      }
      throw error;
    }
  }

  /**
   * Persist the draft's prep-checklist state (F14 — the coches live on the
   * batch, not the recipe). Only the checked ids are stored; the checklist
   * items themselves stay derived from the recipe on the client.
   */
  async updateMinePrepChecklist(
    ownerId: string,
    batchId: string,
    checkedIds: string[],
  ): Promise<BatchOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);
    this.assertMutable(batch);
    this.assertDraft(batch);

    batch.prep_checked_ids = [...new Set(checkedIds)];
    return this.batchRepo.save(batch);
  }

  /**
   * Launch a draft: the draft → in_progress transition of brew-day/07. The
   * recipe steps are snapshotted onto the batch NOW (not at prepare time) so
   * the brew always runs the recipe as it stands at launch.
   */
  async launchMine(ownerId: string, batchId: string): Promise<BatchWithSteps> {
    const batch = await this.getMineBatch(ownerId, batchId);
    this.assertMutable(batch);
    this.assertDraft(batch);

    const recipeSteps = await this.recipeService.listMineSteps(
      ownerId,
      batch.recipe_id,
    );
    const snapshotSteps: RecipeStep[] = recipeSteps.map((step) => ({
      order: step.step_order,
      type: step.type,
      label: step.label,
      description: step.description ?? undefined,
    }));

    const launched = this.runStepTransition(
      (draft) => this.domain.launchBatch(draft, snapshotSteps),
      this.toDomain(batch, []),
    );

    return this.batchRepo.manager.transaction(async (manager) => {
      return this.persistBatch(manager, launched);
    });
  }

  async listMine(ownerId: string): Promise<BatchWithCurrentStep[]> {
    const batches = await this.batchRepo.find({
      where: { owner_id: ownerId },
      order: { updated_at: 'DESC' },
    });

    const currentSteps = await this.loadCurrentSteps(batches);
    return batches.map((batch) => ({
      batch,
      currentStep:
        batch.current_step_order != null
          ? (currentSteps.get(stepKey(batch.id, batch.current_step_order)) ??
            null)
          : null,
    }));
  }

  /**
   * Loads, in a single query, the current step of each batch that has one.
   * Keyed by `batchId:stepOrder` so batches sharing a step order don't
   * collide — avoids an N+1 over the batch list.
   */
  private async loadCurrentSteps(
    batches: BatchOrmEntity[],
  ): Promise<Map<string, BatchStepOrmEntity>> {
    const conditions = batches
      .filter((batch) => batch.current_step_order != null)
      .map((batch) => ({
        batch_id: batch.id,
        step_order: batch.current_step_order as number,
      }));

    if (conditions.length === 0) {
      return new Map();
    }

    const steps = await this.stepRepo.find({ where: conditions });
    return new Map(
      steps.map((step) => [stepKey(step.batch_id, step.step_order), step]),
    );
  }

  async getMineById(ownerId: string, id: string): Promise<BatchWithSteps> {
    const batch = await this.batchRepo.findOne({
      where: { id, owner_id: ownerId },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const steps = await this.stepRepo.find({
      where: { batch_id: batch.id },
      order: { step_order: 'ASC' },
    });

    return { batch, steps };
  }

  async deleteMine(ownerId: string, id: string): Promise<void> {
    await this.batchRepo.manager.transaction(async (manager) => {
      const batchRepo = manager.getRepository(BatchOrmEntity);
      const stepRepo = manager.getRepository(BatchStepOrmEntity);
      const reminderRepo = manager.getRepository(BatchReminderOrmEntity);

      const batch = await batchRepo.findOne({
        where: { id, owner_id: ownerId },
      });
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }

      await reminderRepo.delete({ batch_id: batch.id });
      await stepRepo.delete({ batch_id: batch.id });
      await batchRepo.delete({ id: batch.id, owner_id: ownerId });
    });
  }

  async startFermentationMine(
    ownerId: string,
    batchId: string,
  ): Promise<BatchOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);
    this.assertMutable(batch);
    this.assertLaunched(batch);
    if (batch.status === BatchStatus.COMPLETED) {
      throw new BadRequestException('Batch already completed');
    }
    if (batch.fermentation_started_at) {
      throw new BadRequestException('Fermentation already started');
    }

    batch.fermentation_started_at = new Date();
    return this.batchRepo.save(batch);
  }

  async completeFermentationMine(
    ownerId: string,
    batchId: string,
  ): Promise<BatchOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);
    this.assertMutable(batch);
    this.assertLaunched(batch);
    if (batch.status === BatchStatus.COMPLETED) {
      throw new BadRequestException('Batch already completed');
    }
    if (!batch.fermentation_started_at) {
      throw new BadRequestException('Fermentation not started');
    }
    if (batch.fermentation_completed_at) {
      throw new BadRequestException('Fermentation already completed');
    }

    batch.fermentation_completed_at = new Date();
    return this.batchRepo.save(batch);
  }

  /**
   * Cancel a launched brew (F16). Soft: sets `cancelled_at`, keeps the journal
   * (steps/measurements) — distinct from the hard `deleteMine`. Only an
   * in-progress brew can be cancelled.
   */
  async cancelMine(ownerId: string, batchId: string): Promise<BatchOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);
    if (batch.archived_at) {
      throw new BadRequestException('Batch is archived');
    }
    if (batch.cancelled_at) {
      throw new BadRequestException('Batch already cancelled');
    }
    // A draft's raw status is already in_progress, so the status check alone
    // would let a draft be cancelled — a draft is discarded (DELETE), not
    // cancelled (brew-day/07).
    this.assertLaunched(batch);
    if (batch.status !== BatchStatus.IN_PROGRESS) {
      throw new BadRequestException('Only a launched brew can be cancelled');
    }

    batch.cancelled_at = new Date();
    return this.batchRepo.save(batch);
  }

  /**
   * Archive a finished or cancelled brew (F25). Soft-hides it from the active
   * « Mes brassins » list without deleting its journal.
   */
  async archiveMine(ownerId: string, batchId: string): Promise<BatchOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);
    if (batch.archived_at) {
      throw new BadRequestException('Batch already archived');
    }
    const isCompleted = batch.status === BatchStatus.COMPLETED;
    const isCancelled = Boolean(batch.cancelled_at);
    if (!isCompleted && !isCancelled) {
      throw new BadRequestException(
        'Only a finished or cancelled brew can be archived',
      );
    }

    batch.archived_at = new Date();
    return this.batchRepo.save(batch);
  }

  async listMineReminders(
    ownerId: string,
    batchId: string,
  ): Promise<BatchReminderOrmEntity[]> {
    await this.getMineBatch(ownerId, batchId);
    return this.reminderRepo.find({
      where: { batch_id: batchId },
      order: { due_at: 'ASC' },
    });
  }

  async createMineReminder(
    ownerId: string,
    batchId: string,
    input: CreateBatchReminderInput,
  ): Promise<BatchReminderOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);
    this.assertLaunched(batch);
    const reminder = this.reminderRepo.create({
      id: randomUUID(),
      batch_id: batchId,
      label: input.label,
      due_at: input.dueAt,
      status: BatchReminderStatus.PENDING,
    });
    return this.reminderRepo.save(reminder);
  }

  async updateMineReminder(
    ownerId: string,
    batchId: string,
    reminderId: string,
    input: UpdateBatchReminderInput,
  ): Promise<BatchReminderOrmEntity> {
    await this.getMineBatch(ownerId, batchId);
    const reminder = await this.reminderRepo.findOne({
      where: { id: reminderId, batch_id: batchId },
    });
    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    if (input.label !== undefined) reminder.label = input.label;
    if (input.dueAt !== undefined) reminder.due_at = input.dueAt;
    if (input.status !== undefined) reminder.status = input.status;

    return this.reminderRepo.save(reminder);
  }

  async completeMineCurrentStep(
    ownerId: string,
    batchId: string,
  ): Promise<BatchWithSteps> {
    return this.applyCurrentStepTransition(ownerId, batchId, (batch) =>
      this.domain.completeCurrentStep(batch),
    );
  }

  async startMineCurrentStep(
    ownerId: string,
    batchId: string,
  ): Promise<BatchWithSteps> {
    return this.applyCurrentStepTransition(ownerId, batchId, (batch) =>
      this.domain.startCurrentStep(batch),
    );
  }

  /**
   * Run a pure domain step-transition and translate its state-guard rejections
   * into HTTP-meaningful errors. The domain throws plain `Error`s for invalid
   * transitions; without this they would surface as HTTP 500 for what are in
   * fact normal client-side conflicts (e.g. a double-tap on « Démarrer »).
   * Unknown errors are re-thrown untouched so genuine bugs still fail loud.
   */
  private runStepTransition(
    transition: (batch: Batch) => Batch,
    batch: Batch,
  ): Batch {
    try {
      return transition(batch);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Current step is already active') {
          throw new ConflictException(error.message);
        }
        // NB: the domain's own 'Batch already launched' guard is unreachable
        // here — launchMine pre-guards with assertDraft (400) — so it is
        // deliberately unmapped: if a future path reaches it, it fails loud.
        const clientErrors = new Set([
          'Batch is not in progress',
          'Batch has no current step',
          'Current step is not in progress',
          // Launch-time snapshot validation (the recipe was edited into an
          // un-brewable state between prepare and launch).
          'Batch must include at least one step',
          'Step order must be a non-negative integer',
          'Step orders must be unique',
          'Step orders must start at 0 and be continuous',
          'Step label must not be empty',
        ]);
        if (clientErrors.has(error.message)) {
          throw new BadRequestException(error.message);
        }
      }
      throw error;
    }
  }

  /**
   * Load the owner's batch, run a pure domain transition on it, and persist the
   * result in a single transaction. Shared by the current-step transitions
   * (activate PRÉP → ACTIF, complete). The domain function is the only variable
   * part; loading, ownership/completed guards, and persistence are common.
   */
  private async applyCurrentStepTransition(
    ownerId: string,
    batchId: string,
    transition: (batch: Batch) => Batch,
  ): Promise<BatchWithSteps> {
    return this.batchRepo.manager.transaction(async (manager) => {
      const batchRepo = manager.getRepository(BatchOrmEntity);
      const stepRepo = manager.getRepository(BatchStepOrmEntity);

      const batch = await batchRepo.findOne({
        where: { id: batchId, owner_id: ownerId },
      });
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
      this.assertMutable(batch);
      // A draft has no steps to transition — reject it explicitly rather than
      // via the opaque "no current step" domain error.
      this.assertLaunched(batch);
      if (batch.status === BatchStatus.COMPLETED) {
        throw new BadRequestException('Batch already completed');
      }

      const steps = await stepRepo.find({
        where: { batch_id: batch.id },
        order: { step_order: 'ASC' },
      });

      const domainBatch = this.toDomain(batch, steps);
      const updated = this.runStepTransition(transition, domainBatch);

      batch.status = updated.status;
      batch.current_step_order = updated.currentStepOrder ?? null;
      batch.completed_at = updated.completedAt ?? null;

      const savedBatch = await batchRepo.save(batch);

      const stepPayloads = updated.steps.map((step) =>
        stepRepo.create({
          batch_id: savedBatch.id,
          step_order: step.order,
          type: step.type,
          label: step.label,
          description: step.description ?? null,
          status: step.status,
          started_at: step.startedAt ?? null,
          completed_at: step.completedAt ?? null,
          planned_duration_min: step.plannedDurationMin ?? null,
          pedagogical_tip: step.pedagogicalTip ?? null,
          prep_actions: step.prepActions ? [...step.prepActions] : null,
          done_when: step.doneWhen ?? null,
        }),
      );

      const savedSteps = await stepRepo.save(stepPayloads);
      savedSteps.sort((a, b) => a.step_order - b.step_order);

      return { batch: savedBatch, steps: savedSteps };
    });
  }

  private async persistBatch(
    manager: EntityManager,
    batch: Batch,
  ): Promise<BatchWithSteps> {
    const batchRepo = manager.getRepository(BatchOrmEntity);
    const stepRepo = manager.getRepository(BatchStepOrmEntity);

    const batchEntity = batchRepo.create({
      id: batch.id,
      owner_id: batch.ownerId,
      recipe_id: batch.recipeId,
      status: batch.status,
      current_step_order: batch.currentStepOrder ?? null,
      started_at: batch.startedAt,
      launched_at: batch.launchedAt ?? null,
      prep_checked_ids: batch.prepCheckedIds ? [...batch.prepCheckedIds] : null,
      completed_at: batch.completedAt ?? null,
    });

    const savedBatch = await batchRepo.save(batchEntity);

    const stepEntities = batch.steps.map((step) =>
      stepRepo.create({
        batch_id: savedBatch.id,
        step_order: step.order,
        type: step.type,
        label: step.label,
        description: step.description ?? null,
        status: step.status,
        started_at: step.startedAt ?? null,
        completed_at: step.completedAt ?? null,
        planned_duration_min: step.plannedDurationMin ?? null,
        pedagogical_tip: step.pedagogicalTip ?? null,
        prep_actions: step.prepActions ? [...step.prepActions] : null,
        done_when: step.doneWhen ?? null,
      }),
    );

    const savedSteps = await stepRepo.save(stepEntities);
    savedSteps.sort((a, b) => a.step_order - b.step_order);

    return { batch: savedBatch, steps: savedSteps };
  }

  private toDomain(batch: BatchOrmEntity, steps: BatchStepOrmEntity[]): Batch {
    return {
      id: batch.id,
      ownerId: batch.owner_id,
      recipeId: batch.recipe_id,
      status: batch.status,
      currentStepOrder: batch.current_step_order ?? undefined,
      steps: steps.map((step) => this.toDomainStep(step)),
      createdAt: batch.created_at,
      updatedAt: batch.updated_at,
      startedAt: batch.started_at,
      launchedAt: batch.launched_at ?? undefined,
      prepCheckedIds: batch.prep_checked_ids ?? undefined,
      fermentationStartedAt: batch.fermentation_started_at ?? undefined,
      fermentationCompletedAt: batch.fermentation_completed_at ?? undefined,
      bottledAt: batch.bottled_at ?? undefined,
      completedAt: batch.completed_at ?? undefined,
    };
  }

  private toDomainStep(step: BatchStepOrmEntity): BatchStep {
    return {
      order: step.step_order,
      type: step.type,
      label: step.label,
      description: step.description ?? undefined,
      status: step.status,
      startedAt: step.started_at ?? undefined,
      completedAt: step.completed_at ?? undefined,
      pedagogicalTip: step.pedagogical_tip ?? undefined,
      plannedDurationMin: step.planned_duration_min ?? undefined,
      // Round-trip matters: step transitions re-save the full snapshot, so a
      // missing mapping here would silently drop prep_actions on first use.
      prepActions: step.prep_actions ?? undefined,
      doneWhen: step.done_when ?? undefined,
    };
  }

  async listMineMeasurements(
    ownerId: string,
    batchId: string,
  ): Promise<MeasurementOrmEntity[]> {
    await this.getMineBatch(ownerId, batchId);
    return this.measurementRepo.find({
      where: { batch_id: batchId },
      order: { taken_at: 'ASC' },
    });
  }

  async createMineMeasurement(
    ownerId: string,
    batchId: string,
    input: CreateMeasurementInput,
  ): Promise<MeasurementOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);
    this.assertLaunched(batch);

    // The domain factory enforces per-type range invariants the DTO can't
    // express; surface a violation as a 400 rather than a 500.
    let normalised: Measurement;
    try {
      normalised = createMeasurement({
        batchId,
        type: input.type,
        value: input.value,
        stepOrder: input.stepOrder,
        unit: input.unit,
        takenAt: input.takenAt,
      });
    } catch (error) {
      if (error instanceof MeasurementValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const measurement = this.measurementRepo.create({
      id: randomUUID(),
      batch_id: batchId,
      step_order: normalised.stepOrder,
      type: normalised.type,
      value: normalised.value,
      unit: normalised.unit,
      taken_at: normalised.takenAt,
    });
    return this.measurementRepo.save(measurement);
  }

  async listMineObservations(
    ownerId: string,
    batchId: string,
  ): Promise<ObservationOrmEntity[]> {
    await this.getMineBatch(ownerId, batchId);
    return this.observationRepo.find({
      where: { batch_id: batchId },
      order: { observed_at: 'ASC' },
    });
  }

  async createMineObservation(
    ownerId: string,
    batchId: string,
    input: CreateObservationInput,
  ): Promise<ObservationOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);
    this.assertLaunched(batch);

    let normalised: Observation;
    try {
      normalised = createObservation({
        batchId,
        freeText: input.freeText,
        stepOrder: input.stepOrder,
        photoRefs: input.photoRefs,
        moodScore: input.moodScore,
        observedAt: input.observedAt,
      });
    } catch (error) {
      if (error instanceof ObservationValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const observation = this.observationRepo.create({
      id: randomUUID(),
      batch_id: batchId,
      step_order: normalised.stepOrder,
      free_text: normalised.freeText,
      photo_refs: normalised.photoRefs,
      mood_score: normalised.moodScore,
      observed_at: normalised.observedAt,
    });
    return this.observationRepo.save(observation);
  }

  /**
   * Compute the priming-sugar dose for a batch (B3). Owner-guarded. The beer
   * volume comes from the linked recipe's `batch_size_l` (ADR-0020) — never
   * recomputed here.
   *
   * Mode follows the founder decision "simple par défaut, précise en option":
   * with no options it returns the beginner-safe simple ~6.5 g/L dose; when
   * BOTH `targetCo2Vol` and `beerTempC` are supplied it returns the precise,
   * temperature-corrected dose. Partial options fall back to the simple default.
   */
  async getMinePriming(
    ownerId: string,
    batchId: string,
    options: PrimingOptions = {},
  ): Promise<PrimingResult> {
    const batch = await this.getMineBatch(ownerId, batchId);

    const recipe = await this.recipeService.getReadableById(
      ownerId,
      batch.recipe_id,
    );
    const volumeL = recipe.batch_size_l;
    if (volumeL == null || !Number.isFinite(volumeL) || volumeL <= 0) {
      throw new BadRequestException(
        'Cannot compute priming: the recipe has no batch volume (batch_size_l)',
      );
    }

    const { targetCo2Vol, beerTempC } = options;
    if (targetCo2Vol != null && beerTempC != null) {
      return computePrecisePriming(volumeL, targetCo2Vol, beerTempC);
    }

    return computeSimplePriming(volumeL);
  }

  /**
   * Close a batch at bottling (B3). Sets `bottled_at` AND drives the PACKAGING
   * step to completion through the proven step engine
   * (`BatchDomainService.completeCurrentStep`), which auto-COMPLETES the batch.
   * Does not duplicate completion logic. Owner-guarded.
   */
  async closeMineBottling(
    ownerId: string,
    batchId: string,
  ): Promise<BatchWithSteps> {
    return this.batchRepo.manager.transaction(async (manager) => {
      const batchRepo = manager.getRepository(BatchOrmEntity);
      const stepRepo = manager.getRepository(BatchStepOrmEntity);

      const batch = await batchRepo.findOne({
        where: { id: batchId, owner_id: ownerId },
      });
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
      this.assertMutable(batch);
      if (batch.status === BatchStatus.COMPLETED) {
        throw new BadRequestException('Batch already completed');
      }

      const steps = await stepRepo.find({
        where: { batch_id: batch.id },
        order: { step_order: 'ASC' },
      });

      // Closing = bottling: only valid when the brewer is actually ON the
      // PACKAGING step AND that step is in progress, otherwise
      // completeCurrentStep would complete an earlier step (e.g. FERMENTATION)
      // and set bottled_at prematurely.
      const currentStep = steps.find(
        (step) => step.step_order === batch.current_step_order,
      );
      if (
        !currentStep ||
        currentStep.type !== RecipeStepType.PACKAGING ||
        currentStep.status !== BatchStepStatus.IN_PROGRESS
      ) {
        throw new BadRequestException(
          'Batch is not at the bottling (packaging) step',
        );
      }

      const domainBatch = this.toDomain(batch, steps);
      // The step engine enforces its own preconditions; translate a domain
      // precondition failure into a 400 (client error) rather than a 500.
      let updated: Batch;
      try {
        updated = this.domain.completeCurrentStep(domainBatch);
      } catch (error) {
        if (error instanceof Error) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }

      batch.bottled_at = new Date();
      batch.status = updated.status;
      batch.current_step_order = updated.currentStepOrder ?? null;
      batch.completed_at = updated.completedAt ?? null;

      const savedBatch = await batchRepo.save(batch);

      const stepPayloads = updated.steps.map((step) =>
        stepRepo.create({
          batch_id: savedBatch.id,
          step_order: step.order,
          type: step.type,
          label: step.label,
          description: step.description ?? null,
          status: step.status,
          started_at: step.startedAt ?? null,
          completed_at: step.completedAt ?? null,
          planned_duration_min: step.plannedDurationMin ?? null,
          pedagogical_tip: step.pedagogicalTip ?? null,
          prep_actions: step.prepActions ? [...step.prepActions] : null,
          done_when: step.doneWhen ?? null,
        }),
      );

      const savedSteps = await stepRepo.save(stepPayloads);
      savedSteps.sort((a, b) => a.step_order - b.step_order);

      return { batch: savedBatch, steps: savedSteps };
    });
  }

  /**
   * Get the (single) tasting of a batch, or null if none yet (B3).
   * Owner-guarded.
   */
  async getMineTasting(
    ownerId: string,
    batchId: string,
  ): Promise<TastingOrmEntity | null> {
    await this.getMineBatch(ownerId, batchId);
    return this.tastingRepo.findOne({ where: { batch_id: batchId } });
  }

  /**
   * Record the first tasting of a batch (B3). One tasting per batch in v1:
   * rejects with 409 if one already exists. Owner-guarded; the domain factory
   * enforces the 1-5 rating invariant (surfaced as 400).
   */
  async createMineTasting(
    ownerId: string,
    batchId: string,
    input: CreateTastingInput,
  ): Promise<TastingOrmEntity> {
    const batch = await this.getMineBatch(ownerId, batchId);

    // Conception places tasting AFTER closure (the UI only exposes it from the
    // closure view): a batch can only be tasted once it is bottled (completed).
    this.assertMutable(batch);
    if (batch.status !== BatchStatus.COMPLETED) {
      throw new BadRequestException(
        'Tasting can only be recorded once the batch is bottled (completed)',
      );
    }

    const existing = await this.tastingRepo.findOne({
      where: { batch_id: batchId },
    });
    if (existing) {
      throw new ConflictException('Batch already has a tasting');
    }

    let normalised: Tasting;
    try {
      normalised = createTasting({
        batchId,
        rating: input.rating,
        note: input.note,
      });
    } catch (error) {
      if (error instanceof TastingValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const tasting = this.tastingRepo.create({
      id: randomUUID(),
      batch_id: batchId,
      rating: normalised.rating,
      note: normalised.note,
    });
    try {
      return await this.tastingRepo.save(tasting);
    } catch (error) {
      // The findOne above is best-effort; the unique index on `batch_id` is the
      // real backstop. A concurrent duplicate insert must surface as the same
      // 409 as the read path, not a 500.
      if (
        error instanceof QueryFailedError &&
        this.isUniqueConstraintViolation(error)
      ) {
        throw new ConflictException('Batch already has a tasting');
      }
      throw error;
    }
  }

  /**
   * Detects a unique-constraint violation across the SQLite (tests) and
   * Postgres (prod) drivers — mirrors the recipe service's detection so a
   * concurrent duplicate maps to a 409 rather than a 500.
   */
  private isUniqueConstraintViolation(error: QueryFailedError): boolean {
    const driverError = error.driverError as {
      code?: string | number;
      message?: string;
    };
    const code =
      typeof driverError.code === 'string'
        ? driverError.code
        : typeof driverError.code === 'number'
          ? String(driverError.code)
          : '';
    const message = (driverError.message ?? error.message).toLowerCase();

    return (
      code === '23505' ||
      code === 'ER_DUP_ENTRY' ||
      code === 'SQLITE_CONSTRAINT_PRIMARYKEY' ||
      code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      message.includes('unique constraint failed')
    );
  }

  private async getMineBatch(
    ownerId: string,
    batchId: string,
  ): Promise<BatchOrmEntity> {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId, owner_id: ownerId },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return batch;
  }

  /**
   * Guard against mutating a soft-closed batch. A cancelled or archived brew is
   * frozen: its journal must not be reactivated by any workflow-advancing
   * endpoint (fermentation, step transitions, bottling close, tasting). The raw
   * `status` column stays in_progress/completed on a cancelled batch, so those
   * endpoints check the soft-lifecycle stamps here (brew-day/07 timestamp model).
   */
  private assertMutable(batch: BatchOrmEntity): void {
    // Archived takes precedence over cancelled (same order as
    // deriveEffectiveStatus): an archive-after-cancel batch reports "archived".
    if (batch.archived_at) {
      throw new BadRequestException('Batch is archived');
    }
    if (batch.cancelled_at) {
      throw new BadRequestException('Batch is cancelled');
    }
  }

  /**
   * Guard for draft-only operations (prep checklist, launch): the raw
   * `status` column of a draft is already in_progress (CHECK constraint), so
   * draftness is the absence of the `launched_at` stamp (brew-day/07).
   */
  private assertDraft(batch: BatchOrmEntity): void {
    if (batch.launched_at) {
      throw new BadRequestException('Batch already launched');
    }
  }

  /**
   * Guard for brewing-journal operations (fermentation, measurements,
   * observations, reminders, cancel): a draft has not brewed anything yet, so
   * these endpoints must reject it — its raw `status` alone cannot tell
   * (in_progress covers both draft and launched, brew-day/07).
   */
  private assertLaunched(batch: BatchOrmEntity): void {
    if (!batch.launched_at) {
      throw new BadRequestException('Batch not launched');
    }
  }
}
