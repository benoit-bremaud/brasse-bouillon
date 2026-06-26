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
import { MeasurementOrmEntity } from './entities/measurement.orm.entity';
import { MeasurementType } from './domain/enums/measurement-type.enum';
import { ObservationOrmEntity } from './entities/observation.orm.entity';
import { TastingOrmEntity } from './entities/tasting.orm.entity';
import { RecipeHopOrmEntity } from '../recipe/entities/recipe-hop.orm.entity';
import { RecipeOrmEntity } from '../recipe/entities/recipe.orm.entity';
import { RecipeService } from '../recipe/services/recipe.service';
import { RecipeStepOrmEntity } from '../recipe/entities/recipe-step.orm.entity';
import { RecipeVisibility } from '../recipe/domain/enums/recipe-visibility.enum';
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
          type: 'sqlite',
          database: ':memory:',
          entities: [
            RecipeOrmEntity,
            RecipeStepOrmEntity,
            RecipeHopOrmEntity,
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
          BatchOrmEntity,
          BatchStepOrmEntity,
          BatchReminderOrmEntity,
          MeasurementOrmEntity,
          ObservationOrmEntity,
          TastingOrmEntity,
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
});
