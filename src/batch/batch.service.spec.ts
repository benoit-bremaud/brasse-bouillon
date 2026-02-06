jest.setTimeout(20000);

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { RecipeVisibility } from '../recipe/domain/enums/recipe-visibility.enum';
import { RecipeOrmEntity } from '../recipe/entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from '../recipe/entities/recipe-step.orm.entity';
import { RecipeService } from '../recipe/services/recipe.service';

import { BatchStatus } from './domain/enums/batch-status.enum';
import { BatchReminderStatus } from './domain/enums/batch-reminder-status.enum';
import { BatchStepStatus } from './domain/enums/batch-step-status.enum';
import { BatchReminderOrmEntity } from './entities/batch-reminder.orm.entity';
import { BatchOrmEntity } from './entities/batch.orm.entity';
import { BatchStepOrmEntity } from './entities/batch-step.orm.entity';
import { BatchService } from './services/batch.service';

describe('BatchService', () => {
  let module: TestingModule;
  let batchService: BatchService;
  let recipeService: RecipeService;
  let batchRepo: Repository<BatchOrmEntity>;
  let batchStepRepo: Repository<BatchStepOrmEntity>;
  let batchReminderRepo: Repository<BatchReminderOrmEntity>;
  let recipeRepo: Repository<RecipeOrmEntity>;
  let recipeStepRepo: Repository<RecipeStepOrmEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            RecipeOrmEntity,
            RecipeStepOrmEntity,
            BatchOrmEntity,
            BatchStepOrmEntity,
            BatchReminderOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          RecipeOrmEntity,
          RecipeStepOrmEntity,
          BatchOrmEntity,
          BatchStepOrmEntity,
          BatchReminderOrmEntity,
        ]),
      ],
      providers: [RecipeService, BatchService],
    }).compile();

    batchService = module.get(BatchService);
    recipeService = module.get(RecipeService);
    batchRepo = module.get(getRepositoryToken(BatchOrmEntity));
    batchStepRepo = module.get(getRepositoryToken(BatchStepOrmEntity));
    batchReminderRepo = module.get(getRepositoryToken(BatchReminderOrmEntity));
    recipeRepo = module.get(getRepositoryToken(RecipeOrmEntity));
    recipeStepRepo = module.get(getRepositoryToken(RecipeStepOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await batchStepRepo.clear();
    await batchRepo.clear();
    await batchReminderRepo.clear();
    await recipeStepRepo.clear();
    await recipeRepo.clear();
  });

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

  it('getMineById() should enforce ownership', async () => {
    const ownerId = 'user-1';
    const recipe = await recipeService.create(ownerId, { name: 'My IPA' });
    const started = await batchService.startMine(ownerId, recipe.id);

    await expect(
      batchService.getMineById('user-2', started.batch.id),
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
    expect(list.every((batch) => batch.owner_id === ownerId)).toBe(true);
    expect(list.map((b) => b.id)).toEqual([batchB.batch.id, batchA.batch.id]);

    await batchService.completeMineCurrentStep(ownerId, batchA.batch.id);

    list = await batchService.listMine(ownerId);
    expect(list.map((b) => b.id)).toEqual([batchA.batch.id, batchB.batch.id]);
  });

  it('listMine() should return empty array when no batches', async () => {
    const list = await batchService.listMine('user-1');
    expect(list).toEqual([]);
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
});
