import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';

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

  async listMine(ownerId: string): Promise<BatchOrmEntity[]> {
    return this.batchRepo.find({
      where: { owner_id: ownerId },
      order: { updated_at: 'DESC' },
    });
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
    await this.getMineBatch(ownerId, batchId);
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
        const clientErrors = new Set([
          'Batch is not in progress',
          'Batch has no current step',
          'Current step is not in progress',
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
    await this.getMineBatch(ownerId, batchId);

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
    await this.getMineBatch(ownerId, batchId);

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
    if (batch.cancelled_at) {
      throw new BadRequestException('Batch is cancelled');
    }
    if (batch.archived_at) {
      throw new BadRequestException('Batch is archived');
    }
  }
}
