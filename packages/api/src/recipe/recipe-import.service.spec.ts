jest.setTimeout(20000);

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RecipeAdditiveOrmEntity } from './entities/recipe-additive.orm.entity';
import { RecipeFermentableOrmEntity } from './entities/recipe-fermentable.orm.entity';
import { RecipeHopAdditionStage } from './domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopOrmEntity } from './entities/recipe-hop.orm.entity';
import { RecipeHopType } from './domain/enums/recipe-hop-type.enum';
import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeService } from './services/recipe.service';
import { RecipeStepOrmEntity } from './entities/recipe-step.orm.entity';
import { RecipeStepType } from './domain/enums/recipe-step-type.enum';
import { RecipeVisibility } from './domain/enums/recipe-visibility.enum';
import { RecipeWaterOrmEntity } from './entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from './entities/recipe-yeast.orm.entity';

describe('RecipeService.importFromCommunity (Issue #601)', () => {
  let module: TestingModule;
  let service: RecipeService;
  let recipeRepo: Repository<RecipeOrmEntity>;

  const SOURCE_OWNER = 'source-author-id';
  const IMPORTING_USER = 'importing-user-id';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            RecipeOrmEntity,
            RecipeStepOrmEntity,
            RecipeFermentableOrmEntity,
            RecipeHopOrmEntity,
            RecipeYeastOrmEntity,
            RecipeAdditiveOrmEntity,
            RecipeWaterOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          RecipeOrmEntity,
          RecipeStepOrmEntity,
          RecipeFermentableOrmEntity,
          RecipeHopOrmEntity,
          RecipeYeastOrmEntity,
          RecipeAdditiveOrmEntity,
          RecipeWaterOrmEntity,
        ]),
      ],
      providers: [RecipeService],
    }).compile();

    service = module.get(RecipeService);
    recipeRepo = module.get(getRepositoryToken(RecipeOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await module
      .get<
        Repository<RecipeStepOrmEntity>
      >(getRepositoryToken(RecipeStepOrmEntity))
      .clear();
    await module
      .get<
        Repository<RecipeHopOrmEntity>
      >(getRepositoryToken(RecipeHopOrmEntity))
      .clear();
    await module
      .get<
        Repository<RecipeFermentableOrmEntity>
      >(getRepositoryToken(RecipeFermentableOrmEntity))
      .clear();
    await module
      .get<
        Repository<RecipeYeastOrmEntity>
      >(getRepositoryToken(RecipeYeastOrmEntity))
      .clear();
    await module
      .get<
        Repository<RecipeAdditiveOrmEntity>
      >(getRepositoryToken(RecipeAdditiveOrmEntity))
      .clear();
    await module
      .get<
        Repository<RecipeWaterOrmEntity>
      >(getRepositoryToken(RecipeWaterOrmEntity))
      .clear();
    await recipeRepo.clear();
  });

  async function seedSourceRecipe(
    visibility: RecipeVisibility,
    options: { withHop?: boolean; withStep?: boolean } = {},
  ): Promise<RecipeOrmEntity> {
    const source = recipeRepo.create({
      id: 'source-recipe-id',
      owner_id: SOURCE_OWNER,
      name: 'Punk IPA Clone',
      description: 'Iconic 5.4% session IPA, citrus-forward.',
      visibility,
      version: 1,
      root_recipe_id: 'source-recipe-id',
      parent_recipe_id: null,
      batch_size_l: 20,
      boil_time_min: 60,
      og_target: 1.054,
      fg_target: 1.012,
      abv_estimated: 5.4,
      ibu_target: 35,
      ebc_target: 14,
      efficiency_target: 75,
      avg_rating: 4.5,
      brew_count: 23,
      last_brewed_at: new Date('2026-04-01'),
      is_official: false,
    });
    await recipeRepo.save(source);

    if (options.withStep) {
      const stepRepo = module.get<Repository<RecipeStepOrmEntity>>(
        getRepositoryToken(RecipeStepOrmEntity),
      );
      await stepRepo.save(
        stepRepo.create({
          recipe_id: source.id,
          step_order: 0,
          type: RecipeStepType.MASH,
          label: 'Mash',
          description: '67°C for 60 min',
        }),
      );
    }

    if (options.withHop) {
      const hopRepo = module.get<Repository<RecipeHopOrmEntity>>(
        getRepositoryToken(RecipeHopOrmEntity),
      );
      await hopRepo.save(
        hopRepo.create({
          recipe_id: source.id,
          variety: 'Citra',
          type: RecipeHopType.PELLET,
          weight_g: 25,
          alpha_acid_percent: 12,
          addition_stage: RecipeHopAdditionStage.BOIL,
          addition_time_min: 60,
        }),
      );
    }

    return source;
  }

  describe('happy path', () => {
    it('imports a PUBLIC recipe, transferring ownership to the current user', async () => {
      const source = await seedSourceRecipe(RecipeVisibility.PUBLIC);

      const imported = await service.importFromCommunity(
        IMPORTING_USER,
        source.id,
      );

      expect(imported.id).not.toBe(source.id);
      expect(imported.owner_id).toBe(IMPORTING_USER);
      expect(imported.visibility).toBe(RecipeVisibility.PRIVATE);
      expect(imported.imported_from_recipe_id).toBe(source.id);
      expect(imported.import_provenance).toMatch(
        /Importée de "Punk IPA Clone"/,
      );
      expect(imported.import_provenance).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('also accepts UNLISTED source recipes', async () => {
      const source = await seedSourceRecipe(RecipeVisibility.UNLISTED);

      const imported = await service.importFromCommunity(
        IMPORTING_USER,
        source.id,
      );

      expect(imported.imported_from_recipe_id).toBe(source.id);
    });

    it('resets community-tracking fields on the new recipe', async () => {
      const source = await seedSourceRecipe(RecipeVisibility.PUBLIC);

      const imported = await service.importFromCommunity(
        IMPORTING_USER,
        source.id,
      );

      expect(imported.brew_count).toBe(0);
      expect(imported.avg_rating).toBeNull();
      expect(imported.last_brewed_at).toBeNull();
      expect(imported.version).toBe(1);
      expect(imported.root_recipe_id).toBe(imported.id);
      expect(imported.parent_recipe_id).toBeNull();
    });

    it('copies recipe metrics from the source (batch volume, OG, IBU…)', async () => {
      const source = await seedSourceRecipe(RecipeVisibility.PUBLIC);

      const imported = await service.importFromCommunity(
        IMPORTING_USER,
        source.id,
      );

      expect(imported.batch_size_l).toBe(20);
      expect(imported.og_target).toBe(1.054);
      expect(imported.ibu_target).toBe(35);
      expect(imported.ebc_target).toBe(14);
      expect(imported.abv_estimated).toBe(5.4);
    });
  });

  describe('sad path — visibility', () => {
    it('refuses to import a PRIVATE recipe (ForbiddenException)', async () => {
      const source = await seedSourceRecipe(RecipeVisibility.PRIVATE);

      await expect(
        service.importFromCommunity(IMPORTING_USER, source.id),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('sad path — not found', () => {
    it('throws NotFoundException when the source id does not exist', async () => {
      await expect(
        service.importFromCommunity(IMPORTING_USER, 'unknown-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('edge cases — satellite copies', () => {
    it('deep-copies recipe steps with the new recipe_id', async () => {
      const source = await seedSourceRecipe(RecipeVisibility.PUBLIC, {
        withStep: true,
      });

      const imported = await service.importFromCommunity(
        IMPORTING_USER,
        source.id,
      );

      const stepRepo = module.get<Repository<RecipeStepOrmEntity>>(
        getRepositoryToken(RecipeStepOrmEntity),
      );
      const newSteps = await stepRepo.find({
        where: { recipe_id: imported.id },
      });
      const oldSteps = await stepRepo.find({
        where: { recipe_id: source.id },
      });
      expect(newSteps).toHaveLength(1);
      expect(oldSteps).toHaveLength(1);
      expect(newSteps[0].label).toBe('Mash');
      expect(newSteps[0].recipe_id).toBe(imported.id);
    });

    it('deep-copies hops with new ids and the target recipe_id', async () => {
      const source = await seedSourceRecipe(RecipeVisibility.PUBLIC, {
        withHop: true,
      });

      const imported = await service.importFromCommunity(
        IMPORTING_USER,
        source.id,
      );

      const hopRepo = module.get<Repository<RecipeHopOrmEntity>>(
        getRepositoryToken(RecipeHopOrmEntity),
      );
      const newHops = await hopRepo.find({
        where: { recipe_id: imported.id },
      });
      const oldHops = await hopRepo.find({
        where: { recipe_id: source.id },
      });

      expect(newHops).toHaveLength(1);
      expect(oldHops).toHaveLength(1);
      expect(newHops[0].variety).toBe('Citra');
      expect(newHops[0].id).not.toBe(oldHops[0].id);
      expect(newHops[0].recipe_id).toBe(imported.id);
    });

    it('does nothing when the source has no satellites (empty recipe)', async () => {
      const source = await seedSourceRecipe(RecipeVisibility.PUBLIC);

      const imported = await service.importFromCommunity(
        IMPORTING_USER,
        source.id,
      );

      const stepRepo = module.get<Repository<RecipeStepOrmEntity>>(
        getRepositoryToken(RecipeStepOrmEntity),
      );
      const hopRepo = module.get<Repository<RecipeHopOrmEntity>>(
        getRepositoryToken(RecipeHopOrmEntity),
      );

      const steps = await stepRepo.find({
        where: { recipe_id: imported.id },
      });
      const hops = await hopRepo.find({ where: { recipe_id: imported.id } });

      expect(steps).toHaveLength(0);
      expect(hops).toHaveLength(0);
    });
  });
});
