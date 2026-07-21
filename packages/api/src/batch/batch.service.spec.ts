jest.setTimeout(20000);

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { BatchOrmEntity } from './entities/batch.orm.entity';
import { BatchReminderOrmEntity } from './entities/batch-reminder.orm.entity';
import { BatchReminderStatus } from './domain/enums/batch-reminder-status.enum';
import { BatchService } from './services/batch.service';
import { BatchStatus } from './domain/enums/batch-status.enum';
import { BatchStepOrmEntity } from './entities/batch-step.orm.entity';
import { BatchStepStatus } from './domain/enums/batch-step-status.enum';
import { RecipeStepType } from '../recipe/domain/enums/recipe-step-type.enum';
import { MeasurementOrmEntity } from './entities/measurement.orm.entity';
import { MeasurementType } from './domain/enums/measurement-type.enum';
import { ObservationOrmEntity } from './entities/observation.orm.entity';
import { TastingOrmEntity } from './entities/tasting.orm.entity';
import { RecipeAdditiveOrmEntity } from '../recipe/entities/recipe-additive.orm.entity';
import { RecipeDifficultyService } from '../recipe/services/recipe-difficulty.service';
import { RecipeFermentableOrmEntity } from '../recipe/entities/recipe-fermentable.orm.entity';
import { RecipeHopOrmEntity } from '../recipe/entities/recipe-hop.orm.entity';
import { RecipeOrmEntity } from '../recipe/entities/recipe.orm.entity';
import { RecipeService } from '../recipe/services/recipe.service';
import { RecipeStepOrmEntity } from '../recipe/entities/recipe-step.orm.entity';
import { RecipeVisibility } from '../recipe/domain/enums/recipe-visibility.enum';
import { RecipeWaterOrmEntity } from '../recipe/entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from '../recipe/entities/recipe-yeast.orm.entity';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';

describe('BatchService', () => {
  let module: TestingModule;
  let batchService: BatchService;
  let recipeService: RecipeService;
  let batchRepo: Repository<BatchOrmEntity>;
  let batchStepRepo: Repository<BatchStepOrmEntity>;
  let batchReminderRepo: Repository<BatchReminderOrmEntity>;
  let recipeRepo: Repository<RecipeOrmEntity>;
  let recipeStepRepo: Repository<RecipeStepOrmEntity>;
  let measurementRepo: Repository<MeasurementOrmEntity>;
  let observationRepo: Repository<ObservationOrmEntity>;
  let tastingRepo: Repository<TastingOrmEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            RecipeOrmEntity,
            RecipeStepOrmEntity,
            RecipeHopOrmEntity,
            RecipeFermentableOrmEntity,
            RecipeYeastOrmEntity,
            RecipeAdditiveOrmEntity,
            RecipeWaterOrmEntity,
            BatchOrmEntity,
            BatchStepOrmEntity,
            BatchReminderOrmEntity,
            MeasurementOrmEntity,
            ObservationOrmEntity,
            TastingOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          RecipeOrmEntity,
          RecipeStepOrmEntity,
          RecipeHopOrmEntity,
          RecipeFermentableOrmEntity,
          RecipeYeastOrmEntity,
          RecipeAdditiveOrmEntity,
          RecipeWaterOrmEntity,
          BatchOrmEntity,
          BatchStepOrmEntity,
          BatchReminderOrmEntity,
          MeasurementOrmEntity,
          ObservationOrmEntity,
          TastingOrmEntity,
        ]),
      ],
      providers: [RecipeService, RecipeDifficultyService, BatchService],
    }).compile();

    batchService = module.get(BatchService);
    recipeService = module.get(RecipeService);
    batchRepo = module.get(getRepositoryToken(BatchOrmEntity));
    batchStepRepo = module.get(getRepositoryToken(BatchStepOrmEntity));
    batchReminderRepo = module.get(getRepositoryToken(BatchReminderOrmEntity));
    recipeRepo = module.get(getRepositoryToken(RecipeOrmEntity));
    recipeStepRepo = module.get(getRepositoryToken(RecipeStepOrmEntity));
    measurementRepo = module.get(getRepositoryToken(MeasurementOrmEntity));
    observationRepo = module.get(getRepositoryToken(ObservationOrmEntity));
    tastingRepo = module.get(getRepositoryToken(TastingOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await tastingRepo.clear();
    await observationRepo.clear();
    await measurementRepo.clear();
    await batchStepRepo.clear();
    await batchRepo.clear();
    await batchReminderRepo.clear();
    await recipeStepRepo.clear();
    await recipeRepo.clear();
  });

  // Drive a freshly started batch through its 5 steps to COMPLETED via the
  // real bottling-close path (advance 4 steps onto PACKAGING, then close).
  // Tasting is only allowed once the batch is bottled/completed.
  async function completeBatch(
    ownerId: string,
    batchId: string,
  ): Promise<void> {
    await batchService.completeMineCurrentStep(ownerId, batchId);
    await batchService.completeMineCurrentStep(ownerId, batchId);
    await batchService.completeMineCurrentStep(ownerId, batchId);
    await batchService.completeMineCurrentStep(ownerId, batchId);
    await batchService.closeMineBottling(ownerId, batchId);
  }

  it('startMine() should create a batch and snapshot steps', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });

    const { batch, steps } = await batchService.startMine(ownerId, recipe.id);

    expect(batch.owner_id).toBe(ownerId);
    expect(batch.recipe_id).toBe(recipe.id);
    expect(batch.status).toBe(BatchStatus.IN_PROGRESS);
    expect(batch.current_step_order).toBe(0);

    expect(steps).toHaveLength(5);
    expect(steps.map((s) => s.step_order)).toEqual([0, 1, 2, 3, 4]);
    expect(steps[0].status).toBe(BatchStepStatus.IN_PROGRESS);
    expect(steps[1].status).toBe(BatchStepStatus.PENDING);
  });

  it('completeMineCurrentStep() should advance steps and complete batch', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });

    const started = await batchService.startMine(ownerId, recipe.id);

    let updated = await batchService.completeMineCurrentStep(
      ownerId,
      started.batch.id,
    );
    expect(updated.batch.current_step_order).toBe(1);
    expect(updated.steps[0].status).toBe(BatchStepStatus.COMPLETED);
    expect(updated.steps[1].status).toBe(BatchStepStatus.IN_PROGRESS);

    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);

    updated = await batchService.completeMineCurrentStep(
      ownerId,
      started.batch.id,
    );
    expect(updated.batch.status).toBe(BatchStatus.COMPLETED);
    expect(updated.batch.current_step_order).toBeNull();
    expect(updated.batch.completed_at).toBeTruthy();
    expect(updated.steps[4].status).toBe(BatchStepStatus.COMPLETED);

    await expect(
      batchService.completeMineCurrentStep(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);
  });

  it('enriches steps with guidance and preserves it across completion (B1-live)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });

    const started = await batchService.startMine(ownerId, recipe.id);
    // mash (step 0) carries a tip + a default duration
    expect(started.steps[0].pedagogical_tip).toBeTruthy();
    expect(started.steps[0].planned_duration_min).toBe(60);
    // fermentation (step 3) carries a tip but no duration (runs over days)
    expect(started.steps[3].pedagogical_tip).toBeTruthy();
    expect(started.steps[3].planned_duration_min).toBeNull();

    // completing a step must NOT wipe the guidance on the persisted steps
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    const reloaded = await batchStepRepo.find({
      where: { batch_id: started.batch.id },
      order: { step_order: 'ASC' },
    });
    expect(reloaded[0].pedagogical_tip).toBeTruthy();
    expect(reloaded[0].planned_duration_min).toBe(60);
    expect(reloaded[3].pedagogical_tip).toBeTruthy();
    expect(reloaded[3].planned_duration_min).toBeNull();
  });

  it("startMine() uses the recipe's boil time for the BOIL step's planned duration", async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'Long-boil IPA',
      boil_time_min: 90,
    });

    const { steps } = await batchService.startMine(ownerId, recipe.id);
    const boilStep = steps.find((step) => step.type === RecipeStepType.BOIL);

    // Real recipe boil time (90), not the generic step-guidance default (60).
    expect(boilStep?.planned_duration_min).toBe(90);
  });

  it('startMine() falls back to the guidance default when the recipe has no boil time', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'No-boil-time',
    });

    const { steps } = await batchService.startMine(ownerId, recipe.id);
    const boilStep = steps.find((step) => step.type === RecipeStepType.BOIL);

    expect(boilStep?.planned_duration_min).toBe(60);
  });

  it("launchMine() also uses the recipe's boil time on the launched BOIL step", async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'Draft long-boil',
      boil_time_min: 90,
    });
    const { batch: draft } = await batchService.prepareMine(ownerId, recipe.id);

    const { steps } = await batchService.launchMine(ownerId, draft.id);
    const boilStep = steps.find((step) => step.type === RecipeStepType.BOIL);

    expect(boilStep?.planned_duration_min).toBe(90);
  });

  it('getMineById() should enforce ownership', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.getMineById('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  it('deleteMine() should delete owned batch with related steps and reminders', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await batchService.createMineReminder(ownerId, started.batch.id, {
      label: 'Check gravity',
      dueAt: new Date('2026-02-01T10:00:00.000Z'),
    });

    expect(await batchRepo.count({ where: { id: started.batch.id } })).toBe(1);
    expect(
      await batchStepRepo.count({ where: { batch_id: started.batch.id } }),
    ).toBe(5);
    expect(
      await batchReminderRepo.count({ where: { batch_id: started.batch.id } }),
    ).toBe(1);

    await batchService.deleteMine(ownerId, started.batch.id);

    expect(await batchRepo.count({ where: { id: started.batch.id } })).toBe(0);
    expect(
      await batchStepRepo.count({ where: { batch_id: started.batch.id } }),
    ).toBe(0);
    expect(
      await batchReminderRepo.count({ where: { batch_id: started.batch.id } }),
    ).toBe(0);
  });

  it('deleteMine() should enforce ownership and throw NotFoundException', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.deleteMine('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);

    await expect(
      batchService.deleteMine(ownerId, randomUUID()),
    ).rejects.toThrow(NotFoundException);
  });

  it('completeMineCurrentStep() should enforce ownership', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.completeMineCurrentStep('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  it('startMineCurrentStep() should activate the current step (set started_at)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });

    const started = await batchService.startMine(ownerId, recipe.id);
    // PRÉP: the current step is in progress but not yet timed (F1)
    expect(started.steps[0].status).toBe(BatchStepStatus.IN_PROGRESS);
    expect(started.steps[0].started_at).toBeNull();

    const activated = await batchService.startMineCurrentStep(
      ownerId,
      started.batch.id,
    );

    expect(activated.steps[0].status).toBe(BatchStepStatus.IN_PROGRESS);
    expect(activated.steps[0].started_at).toBeTruthy();
    expect(activated.batch.current_step_order).toBe(0);
  });

  it('startMineCurrentStep() should enforce ownership', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.startMineCurrentStep('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  it('startMineCurrentStep() should 409 (not 500) when the step is already active', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    // First activation succeeds (PRÉP -> ACTIF)...
    await batchService.startMineCurrentStep(ownerId, started.batch.id);

    // ...a second one is a normal conflict, surfaced as a client 409, not a 500.
    await expect(
      batchService.startMineCurrentStep(ownerId, started.batch.id),
    ).rejects.toThrow(ConflictException);
  });

  it('listMine() should filter by owner and order by updated_at desc', async () => {
    const ownerId = 'user-1';
    const otherOwner = 'user-2';

    const recipeA = await recipeService.create(ownerId, { name: 'Batch A' });
    const recipeB = await recipeService.create(ownerId, { name: 'Batch B' });
    const recipeOther = await recipeService.create(otherOwner, {
      name: 'Other batch',
    });

    const batchA = await batchService.startMine(ownerId, recipeA.id);
    const batchB = await batchService.startMine(ownerId, recipeB.id);
    await batchService.startMine(otherOwner, recipeOther.id);

    await batchRepo
      .createQueryBuilder()
      .update(BatchOrmEntity)
      .set({ updated_at: new Date('2024-01-01T00:00:00.000Z') })
      .where('id = :id', { id: batchA.batch.id })
      .execute();
    await batchRepo
      .createQueryBuilder()
      .update(BatchOrmEntity)
      .set({ updated_at: new Date('2024-01-02T00:00:00.000Z') })
      .where('id = :id', { id: batchB.batch.id })
      .execute();

    let list = await batchService.listMine(ownerId);
    expect(list).toHaveLength(2);
    expect(list.every((row) => row.batch.owner_id === ownerId)).toBe(true);
    expect(list.map((row) => row.batch.id)).toEqual([
      batchB.batch.id,
      batchA.batch.id,
    ]);

    await batchService.completeMineCurrentStep(ownerId, batchA.batch.id);

    list = await batchService.listMine(ownerId);
    expect(list.map((row) => row.batch.id)).toEqual([
      batchA.batch.id,
      batchB.batch.id,
    ]);
  });

  it('listMine() should preserve cancelled and archived soft lifecycle stamps', async () => {
    const ownerId = 'user-1';
    const recipeA = await recipeService.create(ownerId, {
      name: 'Cancelled batch',
    });
    const recipeB = await recipeService.create(ownerId, {
      name: 'Archived batch',
    });

    const cancelled = await batchService.startMine(ownerId, recipeA.id);
    const archived = await batchService.startMine(ownerId, recipeB.id);
    const cancelledAt = new Date('2026-06-01T10:00:00.000Z');
    const archivedAt = new Date('2026-06-02T10:00:00.000Z');

    await batchRepo.update(
      { id: cancelled.batch.id },
      { cancelled_at: cancelledAt },
    );
    await batchRepo.update(
      { id: archived.batch.id },
      { cancelled_at: cancelledAt, archived_at: archivedAt },
    );

    const list = await batchService.listMine(ownerId);

    expect(list).toHaveLength(2);
    const byId = new Map(list.map((row) => [row.batch.id, row.batch]));
    expect(byId.get(cancelled.batch.id)?.status).toBe(BatchStatus.IN_PROGRESS);
    expect(byId.get(cancelled.batch.id)?.cancelled_at).toEqual(cancelledAt);
    expect(byId.get(cancelled.batch.id)?.archived_at).toBeNull();
    expect(byId.get(archived.batch.id)?.status).toBe(BatchStatus.IN_PROGRESS);
    expect(byId.get(archived.batch.id)?.cancelled_at).toEqual(cancelledAt);
    expect(byId.get(archived.batch.id)?.archived_at).toEqual(archivedAt);
  });

  it('listMine() should return empty array when no batches', async () => {
    const list = await batchService.listMine('user-1');
    expect(list).toEqual([]);
  });

  it('listMine() should attach the current step matching current_step_order', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'Deadline batch',
    });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    const [row] = await batchService.listMine(ownerId);

    expect(row.batch.id).toBe(batch.id);
    expect(row.batch.current_step_order).not.toBeNull();
    expect(row.currentStep).not.toBeNull();
    expect(row.currentStep?.step_order).toBe(row.batch.current_step_order);
  });

  it('listMine() should attach a null current step for an unlaunched draft', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'Draft batch',
    });
    await batchService.prepareMine(ownerId, recipe.id);

    const [row] = await batchService.listMine(ownerId);

    expect(row.batch.current_step_order).toBeNull();
    expect(row.currentStep).toBeNull();
  });

  it('listMine() should attach the right current step to each of two batches sharing a step order', async () => {
    const ownerId = 'user-1';
    const recipeA = await recipeService.create(ownerId, { name: 'Batch A' });
    const recipeB = await recipeService.create(ownerId, { name: 'Batch B' });
    const startedA = await batchService.startMine(ownerId, recipeA.id);
    const startedB = await batchService.startMine(ownerId, recipeB.id);

    const list = await batchService.listMine(ownerId);
    const byId = new Map(list.map((row) => [row.batch.id, row]));
    const rowA = byId.get(startedA.batch.id);
    const rowB = byId.get(startedB.batch.id);

    // Both freshly-started batches sit at the same step order; the composite
    // (batch_id, step_order) key must attach each batch its own step.
    expect(rowA?.batch.current_step_order).toBe(rowB?.batch.current_step_order);
    expect(rowA?.currentStep?.batch_id).toBe(startedA.batch.id);
    expect(rowB?.currentStep?.batch_id).toBe(startedB.batch.id);
  });

  it('cancelMine() should soft-cancel an in-progress batch and keep its journal', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    const cancelled = await batchService.cancelMine(ownerId, started.batch.id);

    expect(cancelled.status).toBe(BatchStatus.IN_PROGRESS);
    expect(cancelled.cancelled_at).toBeTruthy();
    expect(cancelled.archived_at).toBeNull();
    expect(
      await batchStepRepo.count({ where: { batch_id: started.batch.id } }),
    ).toBe(5);
  });

  it('cancelMine() should reject completed, archived, duplicate, and unowned batches', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.cancelMine('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);

    await batchService.cancelMine(ownerId, started.batch.id);
    await expect(
      batchService.cancelMine(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);

    const completedRecipe = await recipeService.create(ownerId, {
      name: 'Completed IPA',
    });
    const completed = await batchService.startMine(ownerId, completedRecipe.id);
    await completeBatch(ownerId, completed.batch.id);
    await expect(
      batchService.cancelMine(ownerId, completed.batch.id),
    ).rejects.toThrow(BadRequestException);

    const archivedRecipe = await recipeService.create(ownerId, {
      name: 'Archived IPA',
    });
    const archived = await batchService.startMine(ownerId, archivedRecipe.id);
    await batchRepo.update(
      { id: archived.batch.id },
      { archived_at: new Date('2026-06-01T10:00:00.000Z') },
    );
    await expect(
      batchService.cancelMine(ownerId, archived.batch.id),
    ).rejects.toThrow(BadRequestException);
  });

  it('archiveMine() should archive completed and cancelled batches', async () => {
    const ownerId = 'user-1';
    const completedRecipe = await recipeService.create(ownerId, {
      name: 'Completed IPA',
    });
    const cancelledRecipe = await recipeService.create(ownerId, {
      name: 'Cancelled IPA',
    });

    const completed = await batchService.startMine(ownerId, completedRecipe.id);
    await completeBatch(ownerId, completed.batch.id);
    const archivedCompleted = await batchService.archiveMine(
      ownerId,
      completed.batch.id,
    );
    expect(archivedCompleted.archived_at).toBeTruthy();

    const cancelled = await batchService.startMine(ownerId, cancelledRecipe.id);
    await batchService.cancelMine(ownerId, cancelled.batch.id);
    const archivedCancelled = await batchService.archiveMine(
      ownerId,
      cancelled.batch.id,
    );
    expect(archivedCancelled.cancelled_at).toBeTruthy();
    expect(archivedCancelled.archived_at).toBeTruthy();
  });

  it('archiveMine() should reject active, duplicate, and unowned batches', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.archiveMine('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);

    await expect(
      batchService.archiveMine(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);

    await batchService.cancelMine(ownerId, started.batch.id);
    await batchService.archiveMine(ownerId, started.batch.id);

    await expect(
      batchService.archiveMine(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);
  });

  it('startMine() should backfill steps for legacy recipes', async () => {
    const ownerId = 'user-1';
    const recipeId = randomUUID();

    await recipeRepo.save(
      recipeRepo.create({
        id: recipeId,
        owner_id: ownerId,
        name: 'Legacy recipe',
        description: null,
        visibility: RecipeVisibility.PRIVATE,
        version: 1,
        root_recipe_id: recipeId,
        parent_recipe_id: null,
      }),
    );

    expect(await recipeStepRepo.count({ where: { recipe_id: recipeId } })).toBe(
      0,
    );

    const { steps } = await batchService.startMine(ownerId, recipeId);
    expect(steps).toHaveLength(5);
    expect(await recipeStepRepo.count({ where: { recipe_id: recipeId } })).toBe(
      5,
    );
  });

  it('startFermentationMine() should set fermentation_started_at', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    const updated = await batchService.startFermentationMine(
      ownerId,
      started.batch.id,
    );

    expect(updated.fermentation_started_at).toBeTruthy();
    await expect(
      batchService.startFermentationMine(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);

    await expect(
      batchService.startFermentationMine('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  it('freezes a cancelled batch against every workflow endpoint (07a guard)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);
    await batchService.cancelMine(ownerId, started.batch.id);

    // A cancelled brew is frozen: no step transition, fermentation, or bottling
    // may reactivate its journal (the timestamp-model cross-endpoint guard).
    await expect(
      batchService.startMineCurrentStep(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);
    await expect(
      batchService.completeMineCurrentStep(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);
    await expect(
      batchService.startFermentationMine(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);
    await expect(
      batchService.closeMineBottling(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);
  });

  it('freezes an archived batch against tasting (07a guard)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);
    await completeBatch(ownerId, started.batch.id);
    await batchService.archiveMine(ownerId, started.batch.id);

    await expect(
      batchService.createMineTasting(ownerId, started.batch.id, { rating: 4 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('reports "archived" (not "cancelled") when a cancelled batch is later archived (07a precedence)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);
    await batchService.cancelMine(ownerId, started.batch.id);
    await batchService.archiveMine(ownerId, started.batch.id);

    // Both stamps are set; the freeze guard mirrors deriveEffectiveStatus and
    // surfaces "archived" (precedence over cancelled), not "Batch is cancelled".
    await expect(
      batchService.startFermentationMine(ownerId, started.batch.id),
    ).rejects.toThrow('Batch is archived');
  });

  it('completeFermentationMine() should require start and set completed_at', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.completeFermentationMine(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);

    await batchService.startFermentationMine(ownerId, started.batch.id);
    const completed = await batchService.completeFermentationMine(
      ownerId,
      started.batch.id,
    );

    expect(completed.fermentation_completed_at).toBeTruthy();
    await expect(
      batchService.completeFermentationMine(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);

    await expect(
      batchService.completeFermentationMine('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  it('reminders should create, list, update, and enforce ownership', async () => {
    const ownerId = 'user-1';
    const otherOwner = 'user-2';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    const dueAt = new Date('2026-02-01T10:00:00.000Z');
    const dueAtLater = new Date('2026-02-02T10:00:00.000Z');

    const reminder = await batchService.createMineReminder(
      ownerId,
      started.batch.id,
      { label: 'Check gravity', dueAt },
    );

    expect(reminder.status).toBe(BatchReminderStatus.PENDING);
    expect(reminder.due_at.toISOString()).toBe(dueAt.toISOString());

    await batchService.createMineReminder(ownerId, started.batch.id, {
      label: 'Dry hop',
      dueAt: dueAtLater,
    });

    const list = await batchService.listMineReminders(
      ownerId,
      started.batch.id,
    );
    expect(list.map((row) => row.label)).toEqual(['Check gravity', 'Dry hop']);

    const updated = await batchService.updateMineReminder(
      ownerId,
      started.batch.id,
      reminder.id,
      { status: BatchReminderStatus.DONE, label: 'Gravity check done' },
    );
    expect(updated.status).toBe(BatchReminderStatus.DONE);
    expect(updated.label).toBe('Gravity check done');

    await expect(
      batchService.updateMineReminder(ownerId, started.batch.id, 'missing-id', {
        status: BatchReminderStatus.DONE,
      }),
    ).rejects.toThrow(NotFoundException);

    await expect(
      batchService.updateMineReminder(
        otherOwner,
        started.batch.id,
        reminder.id,
        { status: BatchReminderStatus.DONE },
      ),
    ).rejects.toThrow(NotFoundException);

    await expect(
      batchService.listMineReminders(otherOwner, started.batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  // #607 — measurement entry (happy path)
  it('createMineMeasurement() persists a reading and listMineMeasurements() returns it', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    const saved = await batchService.createMineMeasurement(ownerId, batch.id, {
      type: MeasurementType.OG,
      value: 1.048,
      stepOrder: 0,
      unit: 'SG',
    });

    expect(saved.id).toBeDefined();
    expect(saved.batch_id).toBe(batch.id);
    expect(saved.type).toBe(MeasurementType.OG);
    expect(saved.value).toBeCloseTo(1.048);

    const list = await batchService.listMineMeasurements(ownerId, batch.id);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(saved.id);
  });

  // #607 — sad path: domain range violation surfaces as 400
  it('createMineMeasurement() rejects an out-of-range value with BadRequest', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.createMineMeasurement(ownerId, batch.id, {
        type: MeasurementType.PH,
        value: 99,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // #607 — edge: ownership enforced on both routes
  it('measurement routes reject a batch the user does not own', async () => {
    const ownerId = 'user-1';
    const otherOwner = 'user-2';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.createMineMeasurement(otherOwner, batch.id, {
        type: MeasurementType.FG,
        value: 1.012,
      }),
    ).rejects.toThrow(NotFoundException);
    await expect(
      batchService.listMineMeasurements(otherOwner, batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  // #607 — observation entry (happy path)
  it('createMineObservation() persists a note and listMineObservations() returns it', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    const saved = await batchService.createMineObservation(ownerId, batch.id, {
      freeText: 'Krausen bien formé, odeur fruitée',
      stepOrder: 2,
      photoRefs: ['photos/1.jpg'],
      moodScore: 4,
    });

    expect(saved.id).toBeDefined();
    expect(saved.batch_id).toBe(batch.id);
    expect(saved.free_text).toBe('Krausen bien formé, odeur fruitée');
    expect(saved.mood_score).toBe(4);

    const list = await batchService.listMineObservations(ownerId, batch.id);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(saved.id);
  });

  // #607 — sad path: domain invariant violation surfaces as 400
  it('createMineObservation() rejects an out-of-range mood with BadRequest', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.createMineObservation(ownerId, batch.id, {
        freeText: 'Looks fine',
        moodScore: 9,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // #607 — edge: ownership enforced on both routes
  it('observation routes reject a batch the user does not own', async () => {
    const ownerId = 'user-1';
    const otherOwner = 'user-2';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.createMineObservation(otherOwner, batch.id, {
        freeText: 'Sneaky note',
      }),
    ).rejects.toThrow(NotFoundException);
    await expect(
      batchService.listMineObservations(otherOwner, batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  // B3 — priming (happy path): uses the recipe volume (ADR-0020)
  it('getMinePriming() returns the simple dose from the recipe volume', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'My Blonde',
      batch_size_l: 20,
    });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    const result = await batchService.getMinePriming(ownerId, batch.id);
    expect(result.volumeL).toBe(20);
    expect(result.sugarGrams).toBe(130); // 20 * 6.5
    expect(result.targetCo2Vol).toBe(2.4);
  });

  // B3 — priming (sad path): missing recipe volume => 400
  it('getMinePriming() rejects when the recipe has no batch volume', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'No volume' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.getMinePriming(ownerId, batch.id),
    ).rejects.toThrow(BadRequestException);
  });

  // B3 — priming (sad path): a zero batch volume => 400 (the <= 0 branch)
  it('getMinePriming() rejects a recipe whose batch volume is 0', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'Zero volume',
      batch_size_l: 0,
    });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.getMinePriming(ownerId, batch.id),
    ).rejects.toThrow(BadRequestException);
  });

  // B3 — priming (edge): both advanced params => precise dose (differs from simple)
  it('getMinePriming() returns the precise dose when both query params are supplied', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'My Blonde',
      batch_size_l: 20,
    });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    const simple = await batchService.getMinePriming(ownerId, batch.id);
    const precise = await batchService.getMinePriming(ownerId, batch.id, {
      targetCo2Vol: 2.4,
      beerTempC: 20,
    });

    expect(precise.volumeL).toBe(20);
    // The temperature-corrected dose differs from the flat simple default.
    expect(precise.sugarGrams).not.toBe(simple.sugarGrams);
  });

  // B3 — priming (edge): ownership enforced
  it('getMinePriming() rejects a batch the user does not own', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, {
      name: 'My Blonde',
      batch_size_l: 20,
    });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.getMinePriming('user-2', batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  // B3 — bottling/close (happy path): sets bottled_at and completes the batch
  it('closeMineBottling() sets bottled_at and auto-COMPLETES on the last step', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const started = await batchService.startMine(ownerId, recipe.id);

    // Advance to the final (PACKAGING) step, then close.
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);

    const { batch, steps } = await batchService.closeMineBottling(
      ownerId,
      started.batch.id,
    );

    expect(batch.bottled_at).toBeTruthy();
    expect(batch.status).toBe(BatchStatus.COMPLETED);
    expect(batch.current_step_order).toBeNull();
    expect(batch.completed_at).toBeTruthy();
    expect(steps[steps.length - 1].status).toBe(BatchStepStatus.COMPLETED);
  });

  // B3 — bottling/close (sad path): closing off the PACKAGING step is rejected
  it('closeMineBottling() rejects when the current step is not packaging', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const started = await batchService.startMine(ownerId, recipe.id);

    // Advance only as far as FERMENTATION (step 3), NOT packaging (step 4).
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);

    await expect(
      batchService.closeMineBottling(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);

    // Closure must NOT have leaked: no bottled_at, still in progress.
    const reloaded = await batchRepo.findOneOrFail({
      where: { id: started.batch.id },
    });
    expect(reloaded.bottled_at).toBeNull();
    expect(reloaded.status).toBe(BatchStatus.IN_PROGRESS);
  });

  // B3 — bottling/close (sad path): a packaging step that is not in progress
  it('closeMineBottling() rejects a packaging step that is not in progress', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const started = await batchService.startMine(ownerId, recipe.id);

    // Advance to the PACKAGING step (step 4, in_progress).
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);

    // Force the packaging step out of IN_PROGRESS while it stays the current
    // step — exercises the new status guard independently of the type guard.
    await batchStepRepo.update(
      { batch_id: started.batch.id, step_order: 4 },
      { status: BatchStepStatus.PENDING },
    );

    await expect(
      batchService.closeMineBottling(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);

    const reloaded = await batchRepo.findOneOrFail({
      where: { id: started.batch.id },
    });
    expect(reloaded.bottled_at).toBeNull();
    expect(reloaded.status).toBe(BatchStatus.IN_PROGRESS);
  });

  // B3 — bottling/close (sad path): an already-completed batch is rejected
  it('closeMineBottling() rejects an already-completed batch', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.completeMineCurrentStep(ownerId, started.batch.id);
    await batchService.closeMineBottling(ownerId, started.batch.id);

    await expect(
      batchService.closeMineBottling(ownerId, started.batch.id),
    ).rejects.toThrow(BadRequestException);
  });

  // B3 — bottling/close (edge): ownership enforced
  it('closeMineBottling() rejects a batch the user does not own', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.closeMineBottling('user-2', started.batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  // B3 — tasting (happy path): create then read back
  it('createMineTasting() persists a rating + note and getMineTasting() returns it', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);
    await completeBatch(ownerId, batch.id);

    const saved = await batchService.createMineTasting(ownerId, batch.id, {
      rating: 4,
      note: 'Belle mousse',
    });

    expect(saved.id).toBeDefined();
    expect(saved.batch_id).toBe(batch.id);
    expect(saved.rating).toBe(4);
    expect(saved.note).toBe('Belle mousse');

    const fetched = await batchService.getMineTasting(ownerId, batch.id);
    expect(fetched?.id).toBe(saved.id);
  });

  // B3 — tasting (sad path): one tasting per batch (409)
  it('createMineTasting() rejects a second tasting on the same batch', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);
    await completeBatch(ownerId, batch.id);

    await batchService.createMineTasting(ownerId, batch.id, { rating: 5 });

    await expect(
      batchService.createMineTasting(ownerId, batch.id, { rating: 3 }),
    ).rejects.toThrow(ConflictException);
  });

  // B3 — tasting (sad path): an out-of-range rating surfaces as 400
  it('createMineTasting() rejects an out-of-range rating with BadRequest', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);
    await completeBatch(ownerId, batch.id);

    await expect(
      batchService.createMineTasting(ownerId, batch.id, { rating: 9 }),
    ).rejects.toThrow(BadRequestException);
  });

  // B3 — tasting (sad path): an in-progress (non-completed) batch is rejected
  it('createMineTasting() rejects a tasting on an in-progress batch with BadRequest', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.createMineTasting(ownerId, batch.id, { rating: 4 }),
    ).rejects.toThrow(BadRequestException);
  });

  // B3 — tasting (edge): ownership enforced, and absent tasting reads as null
  it('tasting routes enforce ownership and return null when none', async () => {
    const ownerId = 'user-1';
    const otherOwner = 'user-2';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.startMine(ownerId, recipe.id);

    expect(await batchService.getMineTasting(ownerId, batch.id)).toBeNull();

    await expect(
      batchService.createMineTasting(otherOwner, batch.id, { rating: 3 }),
    ).rejects.toThrow(NotFoundException);
    await expect(
      batchService.getMineTasting(otherOwner, batch.id),
    ).rejects.toThrow(NotFoundException);
  });

  // Draft « en préparation » lifecycle (brew-day/07, F14/F15)

  it('prepareMine() creates a draft: no steps, no launched_at, empty prep state (happy)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });

    const { batch, steps } = await batchService.prepareMine(ownerId, recipe.id);

    expect(batch.owner_id).toBe(ownerId);
    expect(batch.recipe_id).toBe(recipe.id);
    expect(batch.launched_at).toBeNull();
    expect(batch.prep_checked_ids).toBeNull();
    expect(batch.current_step_order).toBeNull();
    expect(steps).toHaveLength(0);
  });

  it('prepareMine() is idempotent: a second prepare resumes the same draft (happy)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });

    const first = await batchService.prepareMine(ownerId, recipe.id);
    await batchService.updateMinePrepChecklist(ownerId, first.batch.id, [
      'malt-0',
    ]);

    const second = await batchService.prepareMine(ownerId, recipe.id);

    expect(second.batch.id).toBe(first.batch.id);
    expect(second.batch.prep_checked_ids).toEqual(['malt-0']);
  });

  it('prepareMine() resumes the winner draft when a concurrent prepare wins the race (edge)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });

    const existing = await batchService.prepareMine(ownerId, recipe.id);

    // Simulate the race: the pre-insert existence check misses the draft a
    // concurrent request already committed, so the insert hits the partial
    // unique index and the service must resume the winner's row instead.
    const findOneSpy = jest
      .spyOn(batchRepo, 'findOne')
      .mockResolvedValueOnce(null);

    const second = await batchService.prepareMine(ownerId, recipe.id);

    expect(second.batch.id).toBe(existing.batch.id);
    findOneSpy.mockRestore();
  });

  it('prepareMine() creates a fresh draft once the previous one is launched (edge)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });

    const first = await batchService.prepareMine(ownerId, recipe.id);
    await batchService.launchMine(ownerId, first.batch.id);

    const second = await batchService.prepareMine(ownerId, recipe.id);
    expect(second.batch.id).not.toBe(first.batch.id);
  });

  it('prepareMine() rejects a foreign or unknown recipe with NotFound (sad)', async () => {
    const ownerId = 'user-1';
    const otherOwner = 'user-2';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });

    await expect(
      batchService.prepareMine(otherOwner, recipe.id),
    ).rejects.toThrow(NotFoundException);
    await expect(
      batchService.prepareMine(ownerId, randomUUID()),
    ).rejects.toThrow(NotFoundException);
  });

  it('updateMinePrepChecklist() persists deduplicated coches on the draft (happy)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.prepareMine(ownerId, recipe.id);

    const updated = await batchService.updateMinePrepChecklist(
      ownerId,
      batch.id,
      ['malt-0', 'hop-1', 'malt-0'],
    );

    expect(updated.prep_checked_ids).toEqual(['malt-0', 'hop-1']);
  });

  it('updateMinePrepChecklist() rejects a launched batch and enforces ownership (sad)', async () => {
    const ownerId = 'user-1';
    const otherOwner = 'user-2';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.prepareMine(ownerId, recipe.id);

    await expect(
      batchService.updateMinePrepChecklist(otherOwner, batch.id, ['x']),
    ).rejects.toThrow(NotFoundException);

    await batchService.launchMine(ownerId, batch.id);
    await expect(
      batchService.updateMinePrepChecklist(ownerId, batch.id, ['x']),
    ).rejects.toThrow(BadRequestException);
  });

  it('launchMine() snapshots steps, stamps launched_at/started_at and opens step 0 in PRÉP (happy)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const draft = await batchService.prepareMine(ownerId, recipe.id);

    const { batch, steps } = await batchService.launchMine(
      ownerId,
      draft.batch.id,
    );

    expect(batch.id).toBe(draft.batch.id);
    expect(batch.launched_at).toBeTruthy();
    expect(batch.started_at).toEqual(batch.launched_at);
    expect(batch.status).toBe(BatchStatus.IN_PROGRESS);
    expect(batch.current_step_order).toBe(0);
    expect(steps).toHaveLength(5);
    expect(steps[0].status).toBe(BatchStepStatus.IN_PROGRESS);
    expect(steps[0].started_at).toBeNull();
  });

  it('launchMine() persists PRÉP actions and step transitions preserve them (happy/edge, F4)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const draft = await batchService.prepareMine(ownerId, recipe.id);

    const { batch, steps } = await batchService.launchMine(
      ownerId,
      draft.batch.id,
    );

    // Step 0 (mash) carries the gestures, each with its pedagogical why.
    expect(steps[0].prep_actions?.length).toBeGreaterThan(0);
    for (const prep of steps[0].prep_actions ?? []) {
      expect(prep.action.trim().length).toBeGreaterThan(0);
      expect(prep.why.trim().length).toBeGreaterThan(0);
    }
    // Packaging (last step) has none — the B3 bottling gate covers it.
    expect(steps[steps.length - 1].prep_actions).toBeNull();
    // F5: every launched step carries its end condition.
    expect(steps[0].done_when?.trim().length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].done_when?.trim().length).toBeGreaterThan(0);

    // A step transition re-saves the whole snapshot: the guidance must
    // survive the domain round-trip (regression guard against silent drops).
    const started = await batchService.startMineCurrentStep(ownerId, batch.id);
    expect(started.steps[0].prep_actions).toEqual(steps[0].prep_actions);
    expect(started.steps[0].done_when).toBe(steps[0].done_when);
  });

  it('launchMine() rejects a double launch with Conflict-free 400 and keeps the journal intact (sad)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const draft = await batchService.prepareMine(ownerId, recipe.id);
    await batchService.launchMine(ownerId, draft.batch.id);

    await expect(
      batchService.launchMine(ownerId, draft.batch.id),
    ).rejects.toThrow(BadRequestException);
  });

  it('brewing-journal endpoints reject a draft (edge: guards on every surface)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.prepareMine(ownerId, recipe.id);

    // A draft has brewed nothing: no step transitions, no fermentation, no
    // journal entries, and no soft-cancel (a draft is discarded via DELETE).
    await expect(
      batchService.completeMineCurrentStep(ownerId, batch.id),
    ).rejects.toThrow(BadRequestException);
    await expect(
      batchService.startMineCurrentStep(ownerId, batch.id),
    ).rejects.toThrow(BadRequestException);
    await expect(
      batchService.startFermentationMine(ownerId, batch.id),
    ).rejects.toThrow(BadRequestException);
    await expect(
      batchService.createMineMeasurement(ownerId, batch.id, {
        type: MeasurementType.OG,
        value: 1.05,
      }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      batchService.createMineObservation(ownerId, batch.id, {
        freeText: 'note',
      }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      batchService.createMineReminder(ownerId, batch.id, {
        label: 'buy yeast',
        dueAt: new Date(),
      }),
    ).rejects.toThrow(BadRequestException);
    await expect(batchService.cancelMine(ownerId, batch.id)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('a draft is discardable via deleteMine and shows as draft in listMine (edge)', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My Blonde' });
    const { batch } = await batchService.prepareMine(ownerId, recipe.id);

    const rows = await batchService.listMine(ownerId);
    expect(rows.map((row) => row.batch.id)).toContain(batch.id);

    await batchService.deleteMine(ownerId, batch.id);
    const after = await batchService.listMine(ownerId);
    expect(after.map((row) => row.batch.id)).not.toContain(batch.id);
  });
});
