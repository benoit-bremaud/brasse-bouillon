import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { EntityManager, Repository } from 'typeorm';

import { RecipeStep } from '../../recipe/domain/entities/recipe-step.entity';
import { RecipeService } from '../../recipe/services/recipe.service';

import { BatchDomainService } from '../domain/services/batch-domain.service';
import { BatchStep } from '../domain/entities/batch-step.entity';
import { Batch } from '../domain/entities/batch.entity';
import { BatchReminderStatus } from '../domain/enums/batch-reminder-status.enum';
import { BatchStatus } from '../domain/enums/batch-status.enum';
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
    return this.batchRepo.manager.transaction(async (manager) => {
      const batchRepo = manager.getRepository(BatchOrmEntity);
      const stepRepo = manager.getRepository(BatchStepOrmEntity);

      const batch = await batchRepo.findOne({
        where: { id: batchId, owner_id: ownerId },
      });
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }
      if (batch.status === BatchStatus.COMPLETED) {
        throw new BadRequestException('Batch already completed');
      }

      const steps = await stepRepo.find({
        where: { batch_id: batch.id },
        order: { step_order: 'ASC' },
      });

      const domainBatch = this.toDomain(batch, steps);
      const updated = this.domain.completeCurrentStep(domainBatch);

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
}
