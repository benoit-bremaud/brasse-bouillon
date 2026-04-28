jest.setTimeout(20000);

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RecipeAdditiveOrmEntity } from '../entities/recipe-additive.orm.entity';
import { RecipeFermentableOrmEntity } from '../entities/recipe-fermentable.orm.entity';
import { RecipeHopOrmEntity } from '../entities/recipe-hop.orm.entity';
import { RecipeMatchingService } from './recipe-matching.service';
import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from '../entities/recipe-step.orm.entity';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';
import { RecipeWaterOrmEntity } from '../entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from '../entities/recipe-yeast.orm.entity';
import { ScanCatalogItemOrmEntity } from '../../scan/entities/scan-catalog-item.orm.entity';
import { ScanCatalogSource } from '../../scan/domain/enums/scan-catalog-source.enum';
import { ScanFermentationType } from '../../scan/domain/enums/scan-fermentation-type.enum';

describe('RecipeMatchingService (Issue #699)', () => {
  let module: TestingModule;
  let service: RecipeMatchingService;
  let recipeRepo: Repository<RecipeOrmEntity>;
  let catalogRepo: Repository<ScanCatalogItemOrmEntity>;

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
            ScanCatalogItemOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([RecipeOrmEntity, ScanCatalogItemOrmEntity]),
      ],
      providers: [RecipeMatchingService],
    }).compile();

    service = module.get(RecipeMatchingService);
    recipeRepo = module.get(getRepositoryToken(RecipeOrmEntity));
    catalogRepo = module.get(getRepositoryToken(ScanCatalogItemOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await recipeRepo.clear();
    await catalogRepo.clear();
  });

  // ---------------------------------------------------------------
  // scoreStyle
  // ---------------------------------------------------------------
  describe('scoreStyle', () => {
    it('happy: exact case-insensitive match scores 100', () => {
      expect(service.scoreStyle('IPA', 'IPA')).toBe(100);
      expect(service.scoreStyle('ipa', 'IPA')).toBe(100);
      expect(service.scoreStyle('  Belgian Tripel ', 'belgian tripel')).toBe(
        100,
      );
    });

    it('happy: same-family substring containment scores 70', () => {
      expect(service.scoreStyle('IPA', 'Session IPA')).toBe(70);
      expect(service.scoreStyle('Imperial Stout', 'Stout')).toBe(70);
    });

    it('sad: unrelated styles score 0', () => {
      expect(service.scoreStyle('IPA', 'Belgian Tripel')).toBe(0);
      expect(service.scoreStyle('Pilsner', 'Imperial Stout')).toBe(0);
    });

    it('edge: null / undefined / empty either side scores 0', () => {
      expect(service.scoreStyle(null, 'IPA')).toBe(0);
      expect(service.scoreStyle('IPA', undefined)).toBe(0);
      expect(service.scoreStyle('', 'IPA')).toBe(0);
      expect(service.scoreStyle('   ', 'IPA')).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // scoreAbv
  // ---------------------------------------------------------------
  describe('scoreAbv', () => {
    it('happy: zero gap scores 100', () => {
      expect(service.scoreAbv(5.5, 5.5)).toBe(100);
    });

    it('happy: 2% gap scores 50 (linear decay 25/percent)', () => {
      expect(service.scoreAbv(5, 7)).toBe(50);
      expect(service.scoreAbv(8, 6)).toBe(50);
    });

    it('sad: 4%+ gap clamps to 0', () => {
      expect(service.scoreAbv(4, 8)).toBe(0);
      expect(service.scoreAbv(2, 10)).toBe(0);
    });

    it('edge: missing values on either side score 0', () => {
      expect(service.scoreAbv(null, 5)).toBe(0);
      expect(service.scoreAbv(5, undefined)).toBe(0);
      expect(service.scoreAbv(null, null)).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // scoreQuality
  // ---------------------------------------------------------------
  describe('scoreQuality', () => {
    it('happy: 5.0 maps to 100, 1.0 to 20, 3.0 to 60', () => {
      expect(service.scoreQuality(5)).toBe(100);
      expect(service.scoreQuality(1)).toBe(20);
      expect(service.scoreQuality(3)).toBe(60);
    });

    it('sad: null avg_rating scores 0 (do not crowd out rated peers)', () => {
      expect(service.scoreQuality(null)).toBe(0);
      expect(service.scoreQuality(undefined)).toBe(0);
    });

    it('edge: out-of-range ratings clamp safely', () => {
      // Ratings outside 1..5 are not expected from the schema
      // (numeric(3,2) avg) but the helper must not crash.
      expect(service.scoreQuality(0.5)).toBe(20);
      expect(service.scoreQuality(7)).toBe(100);
    });
  });

  // ---------------------------------------------------------------
  // computeFinalScore
  // ---------------------------------------------------------------
  describe('computeFinalScore', () => {
    let beer: ScanCatalogItemOrmEntity;
    beforeEach(() => {
      beer = makeBeer({ style: 'IPA', abv: 5.5 });
    });

    it('happy: blended score = style*0.5 + ABV*0.25 + quality*0.25', () => {
      // style 100 + ABV 100 + quality 100 → 50 + 25 + 25 = 100
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 5,
      });
      expect(service.computeFinalScore(beer, recipe)).toBe(100);
    });

    it('happy: official-recipe shortcut wins outright (100) regardless of metrics', () => {
      // Style mismatch + null rating would otherwise be ~0.
      const official = makeRecipe({
        style: 'Pilsner',
        abv_estimated: null,
        avg_rating: null,
        is_official: true,
      });
      expect(service.computeFinalScore(beer, official)).toBe(100);
    });

    it('edge: a recipe with no style nor ABV nor rating still scores deterministically (0)', () => {
      const empty = makeRecipe({
        style: null,
        abv_estimated: null,
        avg_rating: null,
      });
      expect(service.computeFinalScore(beer, empty)).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // rankForBeer (integration with the in-memory DB)
  // ---------------------------------------------------------------
  describe('rankForBeer (integration)', () => {
    it('happy: top-3 ordering for an IPA-shaped beer puts the closest IPA on top', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'Session IPA',
        abv: 4.5,
      });
      await Promise.all([
        seedRecipe(recipeRepo, {
          name: 'Session IPA Citra',
          style: 'Session IPA',
          abv_estimated: 4.6,
          avg_rating: 4.7,
        }),
        seedRecipe(recipeRepo, {
          name: 'NEIPA',
          style: 'NEIPA',
          abv_estimated: 6.4,
          avg_rating: 4.5,
        }),
        seedRecipe(recipeRepo, {
          name: 'Belgian Tripel',
          style: 'Belgian Tripel',
          abv_estimated: 8.5,
          avg_rating: 4.8,
        }),
        seedRecipe(recipeRepo, {
          name: 'Imperial Stout',
          style: 'Imperial Stout',
          abv_estimated: 9.5,
          avg_rating: 4.7,
        }),
      ]);

      const ranked = await service.rankForBeer(beerId, 3);

      expect(ranked).toHaveLength(3);
      expect(ranked[0].recipe.name).toBe('Session IPA Citra');
      // Scores must be strictly decreasing.
      expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
      expect(ranked[1].score).toBeGreaterThanOrEqual(ranked[2].score);
    });

    it('happy: an official-flagged recipe beats every non-official peer', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'Pilsner',
        abv: 5,
      });
      await seedRecipe(recipeRepo, {
        name: 'Random NEIPA',
        style: 'NEIPA',
        abv_estimated: 6.5,
        avg_rating: 5,
      });
      await seedRecipe(recipeRepo, {
        name: 'Brewer-Endorsed Clone',
        style: 'Belgian Tripel', // wildly off the beer style
        abv_estimated: 9, // wildly off the beer ABV
        avg_rating: null, // no rating
        is_official: true,
      });

      const ranked = await service.rankForBeer(beerId, 3);
      expect(ranked[0].recipe.name).toBe('Brewer-Endorsed Clone');
      expect(ranked[0].score).toBe(100);
    });

    it('sad: unknown beerId throws NotFoundException', async () => {
      await expect(
        service.rankForBeer('00000000-0000-4000-8000-deadbeefcafe'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: ignores non-PUBLIC recipes (PRIVATE rows must never leak to ranking)', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'IPA',
        abv: 5.5,
      });
      await seedRecipe(recipeRepo, {
        name: 'Public IPA',
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 4,
      });
      await seedRecipe(recipeRepo, {
        name: 'Private Best Match',
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 5,
        visibility: RecipeVisibility.PRIVATE,
      });

      const ranked = await service.rankForBeer(beerId, 5);
      expect(ranked.map((r) => r.recipe.name)).toEqual(['Public IPA']);
    });

    it('edge: equal scores resolve deterministically by avg_rating desc then id asc', async () => {
      // Codex P2 on PR #773 — without explicit tie-breakers the
      // ranking falls back to the DB return order, which is not
      // guaranteed. The contract: same scores → higher avg_rating
      // wins ; same rating → lexicographically smaller id wins.
      const beerId = await seedBeer(catalogRepo, {
        style: 'IPA',
        abv: 5,
      });
      // Three recipes that score identically on similarity (style
      // exact, ABV exact). Differentiate only via avg_rating + id.
      await seedRecipeWithId(
        recipeRepo,
        '00000000-0000-4000-8000-aaaaaaaaaaaa',
        {
          name: 'Z-low-rating',
          style: 'IPA',
          abv_estimated: 5,
          avg_rating: 3,
        },
      );
      await seedRecipeWithId(
        recipeRepo,
        '00000000-0000-4000-8000-bbbbbbbbbbbb',
        {
          name: 'A-high-rating',
          style: 'IPA',
          abv_estimated: 5,
          avg_rating: 5,
        },
      );
      await seedRecipeWithId(
        recipeRepo,
        '00000000-0000-4000-8000-cccccccccccc',
        {
          name: 'A-high-rating-tie',
          style: 'IPA',
          abv_estimated: 5,
          avg_rating: 5,
        },
      );

      const ranked = await service.rankForBeer(beerId, 3);
      expect(ranked.map((r) => r.recipe.name)).toEqual([
        'A-high-rating', // 5★ rating, smaller id (bbbb…)
        'A-high-rating-tie', // 5★ rating, larger id (cccc…)
        'Z-low-rating', // 3★ rating
      ]);
    });

    it('edge: caps the limit at 10 even if a larger value is requested', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'IPA',
        abv: 5,
      });
      // Seed 12 distinct PUBLIC recipes.
      for (let i = 0; i < 12; i += 1) {
        await seedRecipe(recipeRepo, {
          name: `Recipe ${i}`,
          style: 'IPA',
          abv_estimated: 5,
          avg_rating: 4,
        });
      }

      const ranked = await service.rankForBeer(beerId, 100);
      expect(ranked.length).toBe(10);
    });
  });
});

// -----------------------------------------------------------------
// Test fixtures
// -----------------------------------------------------------------

interface MakeBeerOpts {
  style: string;
  abv?: number | null;
}

function makeBeer(opts: MakeBeerOpts): ScanCatalogItemOrmEntity {
  const beer = new ScanCatalogItemOrmEntity();
  beer.id = randomUuidish();
  beer.barcode = '0000000000000';
  beer.name = 'Test Beer';
  beer.brewery = 'Test Brewery';
  beer.style = opts.style;
  beer.abv = opts.abv ?? null;
  beer.fermentation_type = ScanFermentationType.UNKNOWN;
  beer.is_abv_estimated = false;
  beer.is_ibu_estimated = false;
  beer.is_color_ebc_estimated = false;
  beer.is_style_estimated = false;
  beer.source = ScanCatalogSource.SEED;
  return beer;
}

async function seedBeer(
  repo: Repository<ScanCatalogItemOrmEntity>,
  opts: MakeBeerOpts,
): Promise<string> {
  const beer = makeBeer(opts);
  await repo.save(beer);
  return beer.id;
}

interface MakeRecipeOpts {
  name: string;
  style: string | null;
  abv_estimated: number | null;
  avg_rating: number | null;
  visibility?: RecipeVisibility;
  is_official?: boolean;
}

function makeRecipe(opts: MakeRecipeOpts): RecipeOrmEntity {
  const recipe = new RecipeOrmEntity();
  recipe.id = randomUuidish();
  recipe.owner_id = '00000000-0000-4000-8000-000000000000';
  recipe.name = opts.name;
  recipe.visibility = opts.visibility ?? RecipeVisibility.PUBLIC;
  recipe.version = 1;
  recipe.root_recipe_id = recipe.id;
  recipe.parent_recipe_id = null;
  recipe.style = opts.style;
  recipe.abv_estimated = opts.abv_estimated;
  recipe.avg_rating = opts.avg_rating;
  recipe.brew_count = 0;
  recipe.is_official = opts.is_official ?? false;
  return recipe;
}

async function seedRecipe(
  repo: Repository<RecipeOrmEntity>,
  opts: MakeRecipeOpts,
): Promise<string> {
  const recipe = makeRecipe(opts);
  await repo.save(recipe);
  return recipe.id;
}

async function seedRecipeWithId(
  repo: Repository<RecipeOrmEntity>,
  id: string,
  opts: MakeRecipeOpts,
): Promise<string> {
  const recipe = makeRecipe(opts);
  recipe.id = id;
  recipe.root_recipe_id = id;
  await repo.save(recipe);
  return recipe.id;
}

let counter = 0;
function randomUuidish(): string {
  counter += 1;
  const hex = counter.toString(16).padStart(12, '0');
  return `00000000-0000-4000-8000-${hex}`;
}
