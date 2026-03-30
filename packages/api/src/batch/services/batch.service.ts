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

export interface BatchWithSteps {
  batch: BatchOrmEntity;
  steps: BatchStepOrmEntity[];
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
    };
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
