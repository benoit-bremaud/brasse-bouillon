jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RecipeAdditiveOrmEntity } from './entities/recipe-additive.orm.entity';
import { RecipeAdditiveType } from './domain/enums/recipe-additive-type.enum';
import { RecipeDifficultyLevel } from './domain/enums/recipe-difficulty-level.enum';
import { RecipeDifficultyService } from './services/recipe-difficulty.service';
import { RecipeDto } from './dtos/recipe.dto';
import { RecipeFermentableOrmEntity } from './entities/recipe-fermentable.orm.entity';
import { RecipeFermentableType } from './domain/enums/recipe-fermentable-type.enum';
import { RecipeHopAdditionStage } from './domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopOrmEntity } from './entities/recipe-hop.orm.entity';
import { RecipeHopType } from './domain/enums/recipe-hop-type.enum';
import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeService } from './services/recipe.service';
import { RecipeStepType } from './domain/enums/recipe-step-type.enum';
import { RecipeWaterOrmEntity } from './entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from './entities/recipe-yeast.orm.entity';
import { RecipeYeastType } from './domain/enums/recipe-yeast-type.enum';
import { buildRecipeTestingTypeOrm } from './recipe-testing.module';

/**
 * Integration coverage for the difficulty application service (Tranche B slice
 * 2). The pure scoring rules are unit-tested in
 * `recipe-difficulty.domain.service.spec.ts`; here we exercise the ADAPTER
 * (recipe + sub-entities -> DifficultyInput), the persistence of the computed
 * level + reasons, the multi-yeast reduction and distinct-variety counting, and
 * the author-override preservation — end-to-end against an in-memory SQLite.
 */
describe('RecipeDifficultyService (integration)', () => {
  let module: TestingModule;
  let difficulty: RecipeDifficultyService;
  let recipes: RecipeService;
  let recipeRepo: Repository<RecipeOrmEntity>;
  let yeastRepo: Repository<RecipeYeastOrmEntity>;
  let hopRepo: Repository<RecipeHopOrmEntity>;
  let fermentableRepo: Repository<RecipeFermentableOrmEntity>;
  let additiveRepo: Repository<RecipeAdditiveOrmEntity>;
  let waterRepo: Repository<RecipeWaterOrmEntity>;

  const OWNER = 'owner-difficulty';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [...buildRecipeTestingTypeOrm()],
      providers: [RecipeService, RecipeDifficultyService],
    }).compile();

    difficulty = module.get(RecipeDifficultyService);
    recipes = module.get(RecipeService);
    recipeRepo = module.get(getRepositoryToken(RecipeOrmEntity));
    yeastRepo = module.get(getRepositoryToken(RecipeYeastOrmEntity));
    hopRepo = module.get(getRepositoryToken(RecipeHopOrmEntity));
    fermentableRepo = module.get(
      getRepositoryToken(RecipeFermentableOrmEntity),
    );
    additiveRepo = module.get(getRepositoryToken(RecipeAdditiveOrmEntity));
    waterRepo = module.get(getRepositoryToken(RecipeWaterOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  const addYeast = (
    recipeId: string,
    type: RecipeYeastType,
    temperatureMaxC?: number,
  ) =>
    yeastRepo.save(
      yeastRepo.create({
        recipe_id: recipeId,
        name: `${type}-strain`,
        type,
        amount_g: 11,
        temperature_max_c: temperatureMaxC ?? null,
      }),
    );

  const addHop = (recipeId: string, variety: string) =>
    hopRepo.save(
      hopRepo.create({
        recipe_id: recipeId,
        variety,
        type: RecipeHopType.PELLET,
        weight_g: 20,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 15,
      }),
    );

  const addFermentable = (recipeId: string, name: string) =>
    fermentableRepo.save(
      fermentableRepo.create({
        recipe_id: recipeId,
        name,
        type: RecipeFermentableType.GRAIN,
        weight_g: 1000,
      }),
    );

  const reload = (id: string) => recipeRepo.findOneByOrFail({ id });

  // happy: create() computes + stores Facile with the positive reason for a
  // bare, easy recipe (no ingredients yet).
  it('stores Facile with a positive reason on create for a bare easy recipe', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Blonde SMaSH',
      og_target: 1.046,
      ebc_target: 8,
    });

    const saved = await reload(recipe.id);
    expect(saved.difficulty_computed).toBe(RecipeDifficultyLevel.FACILE);
    const reasons = saved.difficulty_reasons ?? [];
    expect(reasons).toHaveLength(1);
    expect(reasons[0]).toMatchObject({ factor: 'facile', tier: 0 });
    expect(typeof reasons[0].sentence).toBe('string');
  });

  // happy: adding a pale lager yeast recomputes to Avancé (F3 fault-tolerance).
  it('recomputes to Avancé when a pale lager yeast is added (F3)', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Bohemian Pilsner',
      og_target: 1.05,
      ebc_target: 6,
    });
    await addYeast(recipe.id, RecipeYeastType.LAGER, 12);

    const result = await difficulty.recomputeForRecipe(recipe.id);

    expect(result?.computed).toBe(RecipeDifficultyLevel.AVANCE);
    const saved = await reload(recipe.id);
    expect(saved.difficulty_computed).toBe(RecipeDifficultyLevel.AVANCE);
    expect(
      (saved.difficulty_reasons ?? []).some((r) => r.factor === 'F3'),
    ).toBe(true);
  });

  // edge: multiple yeasts reduce to the worst-case culture — a Brett secondary
  // dominates an ale primary → wild → Avancé (F1).
  it('reduces multiple yeasts to the worst-case culture (wild dominates)', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Brett Saison',
      og_target: 1.05,
    });
    await addYeast(recipe.id, RecipeYeastType.ALE, 22);
    await addYeast(recipe.id, RecipeYeastType.BRETT, 24);

    const result = await difficulty.recomputeForRecipe(recipe.id);

    expect(result?.computed).toBe(RecipeDifficultyLevel.AVANCE);
    expect(result?.reasons.some((r) => r.factor === 'F1' && r.tier === 2)).toBe(
      true,
    );
  });

  // edge: many hop rows of the SAME variety count as one (F6 counts distinct
  // varieties, case-insensitively) — a single-hop bill is not "complex".
  it('counts distinct hop varieties case-insensitively (F6 not over-counted)', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Single-hop APA',
      og_target: 1.05,
    });
    for (const variety of ['Citra', 'citra', 'CITRA', 'Citra ', 'citra']) {
      await addHop(recipe.id, variety);
    }

    const result = await difficulty.recomputeForRecipe(recipe.id);

    expect(result?.computed).toBe(RecipeDifficultyLevel.FACILE);
    expect(result?.reasons.some((r) => r.factor === 'F6')).toBe(false);
  });

  // sad/edge: a genuinely kitchen-sink bill (> 7 distinct items) fires F6.
  it('fires F6 for a bill with more than 7 distinct items', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Kitchen sink',
      og_target: 1.05,
    });
    for (let i = 0; i < 8; i++) {
      await addFermentable(recipe.id, `Malt ${i}`);
    }

    const result = await difficulty.recomputeForRecipe(recipe.id);

    expect(result?.reasons.some((r) => r.factor === 'F6')).toBe(true);
    expect(result?.computed).toBe(RecipeDifficultyLevel.INTERMEDIAIRE);
  });

  // happy: a real water target (pH) fires F4.
  it('fires F4 when the water profile carries a pH target', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Watered',
      og_target: 1.05,
    });
    await waterRepo.save(
      waterRepo.create({
        recipe_id: recipe.id,
        mash_volume_l: 15,
        sparge_volume_l: 10,
        ph_target: 5.4,
      }),
    );

    const result = await difficulty.recomputeForRecipe(recipe.id);

    expect(result?.reasons.some((r) => r.factor === 'F4')).toBe(true);
  });

  // sad: a lone water row with no treatment target does NOT fire F4.
  it('does not fire F4 for a volumes-only water row', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Volumes only',
      og_target: 1.05,
    });
    await waterRepo.save(
      waterRepo.create({
        recipe_id: recipe.id,
        mash_volume_l: 15,
        sparge_volume_l: 10,
      }),
    );

    const result = await difficulty.recomputeForRecipe(recipe.id);

    expect(result?.reasons.some((r) => r.factor === 'F4')).toBe(false);
  });

  // edge: an additive counts toward complexity via its own count.
  it('counts additives toward the complexity factor', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Spiced',
      og_target: 1.05,
    });
    await additiveRepo.save(
      additiveRepo.create({
        recipe_id: recipe.id,
        name: 'Coriander',
        type: RecipeAdditiveType.SPICE,
        amount_g: 10,
        addition_step: RecipeStepType.BOIL,
      }),
    );

    // One additive alone is not enough to fire F6 (≤ 7) — the recipe stays Facile.
    const result = await difficulty.recomputeForRecipe(recipe.id);
    expect(result?.computed).toBe(RecipeDifficultyLevel.FACILE);
  });

  // sad: recompute never overwrites the author override; the effective level in
  // the DTO reflects the override while the computed value keeps updating.
  it('preserves the author override while recomputing the computed value', async () => {
    const recipe = await recipes.create(OWNER, {
      name: 'Overridden',
      og_target: 1.05,
      difficulty_override: RecipeDifficultyLevel.AVANCE,
    });

    // Sanity: create() kept the override and computed Facile (no ingredients).
    let saved = await reload(recipe.id);
    expect(saved.difficulty_override).toBe(RecipeDifficultyLevel.AVANCE);
    expect(saved.difficulty_computed).toBe(RecipeDifficultyLevel.FACILE);

    // A recompute must not touch the override.
    await difficulty.recomputeForRecipe(recipe.id);
    saved = await reload(recipe.id);
    expect(saved.difficulty_override).toBe(RecipeDifficultyLevel.AVANCE);

    // The DTO exposes the override as the effective level.
    expect(RecipeDto.fromEntity(saved).difficulty_effective).toBe(
      RecipeDifficultyLevel.AVANCE,
    );
  });

  // sad: a missing recipe is a no-op, not a throw.
  it('returns null and no-ops for a missing recipe', async () => {
    await expect(
      difficulty.recomputeForRecipe('does-not-exist'),
    ).resolves.toBeNull();
  });
});
