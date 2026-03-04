jest.setTimeout(20000);

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { RecipeHopAdditionStage } from './domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopOrmEntity } from './entities/recipe-hop.orm.entity';
import { RecipeHopType } from './domain/enums/recipe-hop-type.enum';
import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeService } from './services/recipe.service';
import { RecipeStepOrmEntity } from './entities/recipe-step.orm.entity';
import { RecipeStepType } from './domain/enums/recipe-step-type.enum';
import { RecipeVisibility } from './domain/enums/recipe-visibility.enum';
import { randomUUID } from 'crypto';

describe('RecipeService (steps)', () => {
  let module: TestingModule;
  let service: RecipeService;
  let dataSource: DataSource;
  let hopRepo: Repository<RecipeHopOrmEntity>;
  let recipeRepo: Repository<RecipeOrmEntity>;
  let stepRepo: Repository<RecipeStepOrmEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [RecipeOrmEntity, RecipeStepOrmEntity, RecipeHopOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          RecipeOrmEntity,
          RecipeStepOrmEntity,
          RecipeHopOrmEntity,
        ]),
      ],
      providers: [RecipeService],
    }).compile();

    service = module.get(RecipeService);
    dataSource = module.get(DataSource);
    hopRepo = module.get(getRepositoryToken(RecipeHopOrmEntity));
    recipeRepo = module.get(getRepositoryToken(RecipeOrmEntity));
    stepRepo = module.get(getRepositoryToken(RecipeStepOrmEntity));

    await dataSource.query('PRAGMA foreign_keys = ON');
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS "batches_test" (
        "id" varchar PRIMARY KEY NOT NULL,
        "recipe_id" varchar NOT NULL,
        CONSTRAINT "FK_batches_test_recipe_id" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await dataSource.query('DELETE FROM "batches_test"');
    await hopRepo.clear();
    await stepRepo.clear();
    await recipeRepo.clear();
  });

  it('create() should persist the default workflow steps', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, { name: 'My IPA' });

    const steps = await stepRepo.find({
      where: { recipe_id: recipe.id },
      order: { step_order: 'ASC' },
    });

    expect(steps).toHaveLength(5);
    expect(steps.map((s) => s.step_order)).toEqual([0, 1, 2, 3, 4]);
    expect(steps.map((s) => s.type)).toEqual<RecipeStepType[]>([
      RecipeStepType.MASH,
      RecipeStepType.BOIL,
      RecipeStepType.WHIRLPOOL,
      RecipeStepType.FERMENTATION,
      RecipeStepType.PACKAGING,
    ]);
  });

  it('listMineSteps() should lazy-backfill default steps for legacy recipes', async () => {
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

    expect(await stepRepo.count({ where: { recipe_id: recipeId } })).toBe(0);

    const first = await service.listMineSteps(ownerId, recipeId);
    expect(first).toHaveLength(5);

    const second = await service.listMineSteps(ownerId, recipeId);
    expect(second).toHaveLength(5);

    expect(await stepRepo.count({ where: { recipe_id: recipeId } })).toBe(5);
  });

  it('updateMineStep() should update step label/description', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, { name: 'My IPA' });

    const saved = await service.updateMineStep(ownerId, recipe.id, 0, {
      label: 'Mash (updated)',
      description: null,
    });

    expect(saved.step_order).toBe(0);
    expect(saved.label).toBe('Mash (updated)');
    expect(saved.description).toBeNull();

    const fromDb = await stepRepo.findOne({
      where: { recipe_id: recipe.id, step_order: 0 },
    });
    expect(fromDb?.label).toBe('Mash (updated)');
    expect(fromDb?.description).toBeNull();
  });

  it("listMineSteps() should not allow other users' recipes", async () => {
    const recipe = await service.create('owner-1', { name: 'My IPA' });

    await expect(service.listMineSteps('owner-2', recipe.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it("updateMineStep() should not allow other users' recipes", async () => {
    const recipe = await service.create('owner-1', { name: 'My IPA' });

    await expect(
      service.updateMineStep('owner-2', recipe.id, 0, { label: 'Hack' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deleteMine() should delete associated steps', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, { name: 'My IPA' });

    expect(await stepRepo.count({ where: { recipe_id: recipe.id } })).toBe(5);

    await service.deleteMine(ownerId, recipe.id);

    expect(await stepRepo.count({ where: { recipe_id: recipe.id } })).toBe(0);
  });

  it('deleteMine() should throw BadRequestException when recipe is referenced by a batch', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, { name: 'Protected recipe' });

    await dataSource.query(
      'INSERT INTO "batches_test" ("id", "recipe_id") VALUES (?, ?)',
      [randomUUID(), recipe.id],
    );

    await expect(service.deleteMine(ownerId, recipe.id)).rejects.toThrow(
      new BadRequestException(
        'Recipe cannot be deleted because it is referenced by at least one batch',
      ),
    );
  });

  it('updateMineStep() should reject negative order values', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, { name: 'My IPA' });

    await expect(
      service.updateMineStep(ownerId, recipe.id, -1, { label: 'Invalid' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updateMineStep() should reject non-integer order values', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, { name: 'My IPA' });

    await expect(
      service.updateMineStep(ownerId, recipe.id, 1.5, { label: 'Invalid' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('updateMineStep() should throw when step order does not exist', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, { name: 'My IPA' });

    await expect(
      service.updateMineStep(ownerId, recipe.id, 99, { label: 'Nope' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('estimateMineIbu() should return zero when recipe has no hops', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, {
      name: 'No hops recipe',
      batch_size_l: 20,
      og_target: 1.05,
      boil_time_min: 60,
    });

    const result = await service.estimateMineIbu(ownerId, recipe.id);

    expect(result.recipe_id).toBe(recipe.id);
    expect(result.ibu).toBe(0);
    expect(result.breakdown).toEqual([]);
  });

  it('estimateMineIbu() should return zero breakdown when required metrics are missing', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, {
      name: 'Missing OG',
      batch_size_l: 20,
      boil_time_min: 60,
    });

    const hop = await hopRepo.save(
      hopRepo.create({
        recipe_id: recipe.id,
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 28,
        alpha_acid_percent: 5.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      }),
    );

    const result = await service.estimateMineIbu(ownerId, recipe.id);

    expect(result.ibu).toBe(0);
    expect(result.breakdown).toHaveLength(1);
    expect(result.breakdown[0]).toEqual(
      expect.objectContaining({
        hop_id: hop.id,
        utilization: 0,
        ibu: 0,
      }),
    );
  });

  it('estimateMineIbu() should compute Tinseth IBU with breakdown', async () => {
    const ownerId = 'user-1';
    const recipe = await service.create(ownerId, {
      name: 'Tinseth IPA',
      batch_size_l: 20,
      og_target: 1.05,
      boil_time_min: 60,
    });

    const boilHop = await hopRepo.save(
      hopRepo.create({
        recipe_id: recipe.id,
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 28,
        alpha_acid_percent: 5.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      }),
    );

    await hopRepo.save(
      hopRepo.create({
        recipe_id: recipe.id,
        variety: 'Citra',
        type: RecipeHopType.PELLET,
        weight_g: 40,
        alpha_acid_percent: 12,
        addition_stage: RecipeHopAdditionStage.DRY_HOP,
        addition_time_min: 0,
      }),
    );

    const result = await service.estimateMineIbu(ownerId, recipe.id);

    expect(result.ibu).toBe(19.54);
    expect(result.breakdown).toHaveLength(2);
    expect(result.breakdown[0]).toEqual(
      expect.objectContaining({
        hop_id: boilHop.id,
        variety: 'Cascade',
        utilization: 0.2537,
        ibu: 19.54,
      }),
    );
    expect(result.breakdown[1].ibu).toBe(0);
  });

  it('estimateMineIbu() should enforce ownership', async () => {
    const recipe = await service.create('owner-1', {
      name: 'Protected recipe',
      batch_size_l: 20,
      og_target: 1.05,
      boil_time_min: 60,
    });

    await expect(service.estimateMineIbu('owner-2', recipe.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
