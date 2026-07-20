jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { NotFoundException } from '@nestjs/common';
import { RecipeAdditiveOrmEntity } from './entities/recipe-additive.orm.entity';
import { RecipeAdditiveType } from './domain/enums/recipe-additive-type.enum';
import { RecipeDifficultyLevel } from './domain/enums/recipe-difficulty-level.enum';
import { RecipeFermentableOrmEntity } from './entities/recipe-fermentable.orm.entity';
import { RecipeFermentableType } from './domain/enums/recipe-fermentable-type.enum';
import { RecipeHopAdditionStage } from './domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopOrmEntity } from './entities/recipe-hop.orm.entity';
import { RecipeHopType } from './domain/enums/recipe-hop-type.enum';
import { RecipeIbuEstimateDto } from './dtos/recipe-ibu-estimate.dto';
import { RecipeDifficultyService } from './services/recipe-difficulty.service';
import { RecipeIngredientsService } from './services/recipe-ingredients.service';
import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeService } from './services/recipe.service';
import { RecipeStepOrmEntity } from './entities/recipe-step.orm.entity';
import { RecipeStepType } from './domain/enums/recipe-step-type.enum';
import { RecipeVisibility } from './domain/enums/recipe-visibility.enum';
import { RecipeWaterOrmEntity } from './entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from './entities/recipe-yeast.orm.entity';
import { RecipeYeastType } from './domain/enums/recipe-yeast-type.enum';
import { Repository } from 'typeorm';

describe('RecipeIngredientsService', () => {
  let module: TestingModule;
  let service: RecipeIngredientsService;
  let recipeService: RecipeService;
  let recipeRepo: Repository<RecipeOrmEntity>;

  const OWNER = 'user-1';
  const OTHER = 'user-2';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
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
      providers: [
        RecipeService,
        RecipeIngredientsService,
        RecipeDifficultyService,
      ],
    }).compile();

    service = module.get(RecipeIngredientsService);
    recipeService = module.get(RecipeService);
    recipeRepo = module.get(getRepositoryToken(RecipeOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Clean all ingredient tables then recipe tables
    await module
      .get<
        Repository<RecipeFermentableOrmEntity>
      >(getRepositoryToken(RecipeFermentableOrmEntity))
      .clear();
    await module
      .get<
        Repository<RecipeHopOrmEntity>
      >(getRepositoryToken(RecipeHopOrmEntity))
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
    await module
      .get<
        Repository<RecipeStepOrmEntity>
      >(getRepositoryToken(RecipeStepOrmEntity))
      .clear();
    await recipeRepo.clear();
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  async function createRecipe(ownerId = OWNER) {
    return recipeService.create(ownerId, { name: 'Test IPA' });
  }

  // ─── Fermentables ───────────────────────────────────────────────────────────

  describe('Fermentables', () => {
    it('should add and list fermentables', async () => {
      const recipe = await createRecipe();

      const f = await service.addFermentable(OWNER, recipe.id, {
        name: 'Pale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 4500,
        potential_gravity: 1.037,
        color_ebc: 4,
      });

      expect(f.id).toBeDefined();
      expect(f.name).toBe('Pale Malt');
      expect(f.recipe_id).toBe(recipe.id);

      const list = await service.listFermentables(OWNER, recipe.id);
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(f.id);
    });

    it('should update a fermentable', async () => {
      const recipe = await createRecipe();
      const f = await service.addFermentable(OWNER, recipe.id, {
        name: 'Pale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 4500,
      });

      const updated = await service.updateFermentable(OWNER, recipe.id, f.id, {
        weight_g: 5000,
        name: 'Pilsner Malt',
      });

      expect(updated.weight_g).toBe(5000);
      expect(updated.name).toBe('Pilsner Malt');
    });

    it('should remove a fermentable', async () => {
      const recipe = await createRecipe();
      const f = await service.addFermentable(OWNER, recipe.id, {
        name: 'Pale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 4500,
      });

      await service.removeFermentable(OWNER, recipe.id, f.id);

      const list = await service.listFermentables(OWNER, recipe.id);
      expect(list).toHaveLength(0);
    });

    it('should enforce ownership on fermentables', async () => {
      const recipe = await createRecipe();
      await expect(service.listFermentables(OTHER, recipe.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw when removing a non-existent fermentable', async () => {
      const recipe = await createRecipe();
      await expect(
        service.removeFermentable(OWNER, recipe.id, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Hops ───────────────────────────────────────────────────────────────────

  describe('Hops', () => {
    it('should add and list hops', async () => {
      const recipe = await createRecipe();

      const h = await service.addHop(OWNER, recipe.id, {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 28,
        alpha_acid_percent: 5.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      });

      expect(h.variety).toBe('Cascade');
      const list = await service.listHops(OWNER, recipe.id);
      expect(list).toHaveLength(1);
    });

    it('should update a hop', async () => {
      const recipe = await createRecipe();
      const h = await service.addHop(OWNER, recipe.id, {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 28,
        addition_stage: RecipeHopAdditionStage.BOIL,
      });

      const updated = await service.updateHop(OWNER, recipe.id, h.id, {
        weight_g: 56,
        addition_time_min: 30,
      });

      expect(updated.weight_g).toBe(56);
      expect(updated.addition_time_min).toBe(30);
    });

    it('should remove a hop', async () => {
      const recipe = await createRecipe();
      const h = await service.addHop(OWNER, recipe.id, {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 28,
        addition_stage: RecipeHopAdditionStage.BOIL,
      });

      await service.removeHop(OWNER, recipe.id, h.id);
      expect(await service.listHops(OWNER, recipe.id)).toHaveLength(0);
    });

    it('should enforce ownership on hops', async () => {
      const recipe = await createRecipe();
      await expect(service.listHops(OTHER, recipe.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should expose IBU estimate from recipe service when hops are present', async () => {
      const recipe = await createRecipe();

      await service.addHop(OWNER, recipe.id, {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 28,
        alpha_acid_percent: 5.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      });

      await recipeService.updateMine(OWNER, recipe.id, {
        batch_size_l: 20,
        og_target: 1.05,
        boil_time_min: 60,
      });

      const estimate: RecipeIbuEstimateDto =
        await recipeService.estimateMineIbu(OWNER, recipe.id);

      expect(estimate.recipe_id).toBe(recipe.id);
      expect(estimate.ibu).toBe(19.54);
      expect(estimate.breakdown).toHaveLength(1);
      expect(estimate.breakdown[0]).toEqual(
        expect.objectContaining({
          variety: 'Cascade',
          utilization: 0.2537,
          ibu: 19.54,
        }),
      );
    });
  });

  // ─── Yeasts ─────────────────────────────────────────────────────────────────

  describe('Yeasts', () => {
    it('should add, update, remove and enforce ownership', async () => {
      const recipe = await createRecipe();

      const y = await service.addYeast(OWNER, recipe.id, {
        name: 'Safale US-05',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 77,
      });

      expect(y.name).toBe('Safale US-05');

      const updated = await service.updateYeast(OWNER, recipe.id, y.id, {
        amount_g: 23,
      });
      expect(updated.amount_g).toBe(23);

      await service.removeYeast(OWNER, recipe.id, y.id);
      expect(await service.listYeasts(OWNER, recipe.id)).toHaveLength(0);

      await expect(service.listYeasts(OTHER, recipe.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Difficulty recompute wiring (slice 2) ───────────────────────────────────

  describe('Difficulty recompute (slice 2)', () => {
    it('recomputes UP when a pale lager yeast is added, then DOWN when it is removed', async () => {
      const recipe = await recipeService.create(OWNER, {
        name: 'Pilsner',
        og_target: 1.05,
        ebc_target: 6,
      });
      // Baseline: no ingredients yet → Facile.
      expect(
        (await recipeRepo.findOneByOrFail({ id: recipe.id }))
          .difficulty_computed,
      ).toBe(RecipeDifficultyLevel.FACILE);

      // Adding a pale lager yeast through the real mutation must recompute UP.
      const yeast = await service.addYeast(OWNER, recipe.id, {
        name: 'W-34/70',
        type: RecipeYeastType.LAGER,
        amount_g: 11,
        temperature_max_c: 12,
      });
      let saved = await recipeRepo.findOneByOrFail({ id: recipe.id });
      expect(saved.difficulty_computed).toBe(RecipeDifficultyLevel.AVANCE);
      expect(
        (saved.difficulty_reasons ?? []).some((r) => r.factor === 'F3'),
      ).toBe(true);

      // Removing the last yeast must recompute back DOWN.
      await service.removeYeast(OWNER, recipe.id, yeast.id);
      saved = await recipeRepo.findOneByOrFail({ id: recipe.id });
      expect(saved.difficulty_computed).toBe(RecipeDifficultyLevel.FACILE);
    });

    it('recomputes when a water treatment target is upserted (F4)', async () => {
      const recipe = await recipeService.create(OWNER, {
        name: 'Watered',
        og_target: 1.05,
      });

      await service.upsertWater(OWNER, recipe.id, {
        mash_volume_l: 15,
        sparge_volume_l: 10,
        ph_target: 5.4,
      });

      const saved = await recipeRepo.findOneByOrFail({ id: recipe.id });
      expect(
        (saved.difficulty_reasons ?? []).some((r) => r.factor === 'F4'),
      ).toBe(true);
    });
  });

  // ─── Additives ──────────────────────────────────────────────────────────────

  describe('Additives', () => {
    it('should add, update, remove and enforce ownership', async () => {
      const recipe = await createRecipe();

      const a = await service.addAdditive(OWNER, recipe.id, {
        name: 'Irish Moss',
        type: RecipeAdditiveType.FINING,
        amount_g: 5,
        addition_step: RecipeStepType.BOIL,
        addition_time_min: 15,
      });

      expect(a.name).toBe('Irish Moss');

      const updated = await service.updateAdditive(OWNER, recipe.id, a.id, {
        amount_g: 10,
      });
      expect(updated.amount_g).toBe(10);

      await service.removeAdditive(OWNER, recipe.id, a.id);
      expect(await service.listAdditives(OWNER, recipe.id)).toHaveLength(0);

      await expect(service.listAdditives(OTHER, recipe.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Water Profile ──────────────────────────────────────────────────────────

  describe('Water profile (1:1)', () => {
    it('should upsert (create then update) the water profile', async () => {
      const recipe = await createRecipe();

      // Create
      const w1 = await service.upsertWater(OWNER, recipe.id, {
        mash_volume_l: 17,
        sparge_volume_l: 12,
        mash_temperature_c: 67,
        ph_target: 5.4,
      });
      expect(w1.mash_volume_l).toBe(17);
      expect(w1.ph_target).toBe(5.4);

      // Update (upsert again)
      const w2 = await service.upsertWater(OWNER, recipe.id, {
        mash_volume_l: 20,
        sparge_volume_l: 15,
      });
      expect(w2.mash_volume_l).toBe(20);
      expect(w2.ph_target).toBeNull();

      // Get
      const fetched = await service.getWater(OWNER, recipe.id);
      expect(fetched?.mash_volume_l).toBe(20);
    });

    it('should remove the water profile', async () => {
      const recipe = await createRecipe();

      await service.upsertWater(OWNER, recipe.id, {
        mash_volume_l: 17,
        sparge_volume_l: 12,
      });

      await service.removeWater(OWNER, recipe.id);

      const w = await service.getWater(OWNER, recipe.id);
      expect(w).toBeNull();
    });

    it('should throw when removing a non-existent water profile', async () => {
      const recipe = await createRecipe();
      await expect(service.removeWater(OWNER, recipe.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should enforce ownership on water', async () => {
      const recipe = await createRecipe();
      await expect(service.getWater(OTHER, recipe.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── Public-readable reads (#1134) ──────────────────────────────────────────

  describe('public-readable reads (#1134)', () => {
    async function makePublic(recipeId: string) {
      await recipeRepo.update(recipeId, {
        visibility: RecipeVisibility.PUBLIC,
      });
    }

    it('lets a non-owner read the ingredients of a PUBLIC recipe', async () => {
      const recipe = await createRecipe();
      await service.addFermentable(OWNER, recipe.id, {
        name: 'Maris Otter',
        type: RecipeFermentableType.GRAIN,
        weight_g: 5000,
      });
      await makePublic(recipe.id);

      // Owner-seeded fermentable is visible to the non-owner viewer, and the
      // other (empty) ingredient reads no longer throw for a public recipe.
      await expect(
        service.listFermentables(OTHER, recipe.id),
      ).resolves.toHaveLength(1);
      await expect(service.listHops(OTHER, recipe.id)).resolves.toEqual([]);
      await expect(service.listYeasts(OTHER, recipe.id)).resolves.toEqual([]);
      await expect(service.listAdditives(OTHER, recipe.id)).resolves.toEqual(
        [],
      );
      await expect(service.getWater(OTHER, recipe.id)).resolves.toBeNull();
    });

    it("still hides a PRIVATE recipe's ingredients from a non-owner", async () => {
      const recipe = await createRecipe(); // private by default
      await service.addFermentable(OWNER, recipe.id, {
        name: 'Secret Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 1000,
      });

      await expect(service.listFermentables(OTHER, recipe.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('keeps writes owner-only even on a PUBLIC recipe', async () => {
      const recipe = await createRecipe();
      await makePublic(recipe.id);

      await expect(
        service.addFermentable(OTHER, recipe.id, {
          name: 'Sneaky Malt',
          type: RecipeFermentableType.GRAIN,
          weight_g: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
