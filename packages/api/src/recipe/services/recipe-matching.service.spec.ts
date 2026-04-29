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

    it('happy: blended score = similarity*0.7 + quality*0.3 with renormalization', () => {
      // Style 100 + ABV 100, bitterness/color null → similarity renorm
      // = (100*50 + 100*25)/75 = 100. avg_rating 5 → quality 100,
      // brew_count/recency null → quality renorm = 100. Final =
      // 100*0.7 + 100*0.3 = 100.
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 5,
      });
      expect(service.computeFinalScore(beer, recipe)).toBe(100);
    });

    it('happy: official-recipe shortcut sets similarity=100; quality still varies', () => {
      // Style mismatch + null rating: similarity=100 (shortcut),
      // quality=0 (no rating, no brew_count, no recency).
      // Final = 100*0.7 + 0*0.3 = 70.
      const official = makeRecipe({
        style: 'Pilsner',
        abv_estimated: null,
        avg_rating: null,
        is_official: true,
      });
      expect(service.computeFinalScore(beer, official)).toBeCloseTo(70, 5);
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

      const { rankings, low_confidence } = await service.rankForBeer(beerId, 3);

      expect(rankings).toHaveLength(3);
      expect(rankings[0].recipe.name).toBe('Session IPA Citra');
      // Scores must be strictly decreasing.
      expect(rankings[0].score).toBeGreaterThan(rankings[1].score);
      expect(rankings[1].score).toBeGreaterThanOrEqual(rankings[2].score);
      expect(low_confidence).toBe(false);
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

      const { rankings } = await service.rankForBeer(beerId, 3);
      expect(rankings[0].recipe.name).toBe('Brewer-Endorsed Clone');
      // Similarity = 100 (official shortcut), quality = 0 (no
      // avg_rating, no brew_count, no recency). Final = 100*0.7 = 70.
      expect(rankings[0].score).toBeCloseTo(70, 5);
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

      const { rankings } = await service.rankForBeer(beerId, 5);
      expect(rankings.map((r) => r.recipe.name)).toEqual(['Public IPA']);
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

      const { rankings } = await service.rankForBeer(beerId, 3);
      expect(rankings.map((r) => r.recipe.name)).toEqual([
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

      const { rankings } = await service.rankForBeer(beerId, 100);
      expect(rankings.length).toBe(10);
    });

    // ----------------------------------------------------------------
    // low_confidence flag (Issue #699 brainstorm §3.4 — full algo)
    // ----------------------------------------------------------------

    it('low_confidence: true when the best match scores below 40', async () => {
      // Beer style + ABV totally off the recipes' style + ABV.
      const beerId = await seedBeer(catalogRepo, {
        style: 'Pilsner',
        abv: 4.5,
      });
      // Single recipe far from the beer on every criterion.
      await seedRecipe(recipeRepo, {
        name: 'Imperial Stout',
        style: 'Imperial Stout',
        abv_estimated: 9.5,
        avg_rating: null,
      });

      const { rankings, low_confidence } = await service.rankForBeer(beerId, 3);
      expect(rankings).toHaveLength(1);
      expect(rankings[0].score).toBeLessThan(40);
      expect(low_confidence).toBe(true);
    });

    it('low_confidence: false when the best match scores 40 or above', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'IPA',
        abv: 5.5,
      });
      // Style exact match → similarity ≥ 50 component-wise → final ≥
      // 35 just from style alone, plus ABV boost → final clearly > 40.
      await seedRecipe(recipeRepo, {
        name: 'Spot-on IPA',
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 4,
      });

      const { rankings, low_confidence } = await service.rankForBeer(beerId, 3);
      expect(rankings[0].score).toBeGreaterThanOrEqual(40);
      expect(low_confidence).toBe(false);
    });
  });

  // ------------------------------------------------------------------
  // Bitterness (full algo extension)
  // ------------------------------------------------------------------
  describe('scoreBitterness', () => {
    it('happy: same band scores 100', () => {
      // 30 IBU and 35 IBU both fall in the marked band (20-40).
      expect(service.scoreBitterness(30, 35)).toBe(100);
    });

    it('happy: neighbouring band scores 60', () => {
      // 15 IBU = soft (band 0), 25 IBU = marked (band 1) → distance 1.
      expect(service.scoreBitterness(15, 25)).toBe(60);
    });

    it('sad: two-or-more bands apart scores 0', () => {
      // 10 IBU = soft (band 0), 70 IBU = intense (band 3) → distance 3.
      expect(service.scoreBitterness(10, 70)).toBe(0);
    });

    it('edge: missing values score 0', () => {
      expect(service.scoreBitterness(null, 30)).toBe(0);
      expect(service.scoreBitterness(30, undefined)).toBe(0);
    });
  });

  // ------------------------------------------------------------------
  // Color (full algo extension)
  // ------------------------------------------------------------------
  describe('scoreColor', () => {
    it('happy: same EBC band scores 100', () => {
      // 18 EBC and 25 EBC both ambré (16-30).
      expect(service.scoreColor(18, 25)).toBe(100);
    });

    it('happy: neighbouring band scores 60', () => {
      // 6 EBC = pale (0), 12 EBC = doré (1) → distance 1.
      expect(service.scoreColor(6, 12)).toBe(60);
    });

    it('sad: pale vs noir is two-bands-apart-or-more, scores 0', () => {
      // 4 EBC = pale (0), 80 EBC = noir (4) → distance 4.
      expect(service.scoreColor(4, 80)).toBe(0);
    });

    it('edge: missing values score 0', () => {
      expect(service.scoreColor(null, 18)).toBe(0);
    });
  });

  // ------------------------------------------------------------------
  // Brew count confidence (full algo extension)
  // ------------------------------------------------------------------
  describe('scoreBrewCount', () => {
    it('happy: monotonic anchors — 0→0, 1→30, 5→60, 20→80, 100→95, 500+→100', () => {
      expect(service.scoreBrewCount(0)).toBe(0);
      expect(service.scoreBrewCount(1)).toBe(30);
      expect(service.scoreBrewCount(5)).toBe(60);
      expect(service.scoreBrewCount(20)).toBe(80);
      expect(service.scoreBrewCount(100)).toBe(95);
      expect(service.scoreBrewCount(500)).toBe(100);
      expect(service.scoreBrewCount(10000)).toBe(100);
    });

    it('happy: linear interpolation between anchors', () => {
      // 3 brews → between 1 (30) and 5 (60), at 50% → 45.
      expect(service.scoreBrewCount(3)).toBe(45);
    });

    it('edge: null / negative returns 0', () => {
      expect(service.scoreBrewCount(null)).toBe(0);
      expect(service.scoreBrewCount(-3)).toBe(0);
    });
  });

  // ------------------------------------------------------------------
  // Recency decay (full algo extension)
  // ------------------------------------------------------------------
  describe('scoreRecency', () => {
    const daysAgo = (n: number): Date => {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d;
    };

    it('happy: <30 days → 100', () => {
      expect(service.scoreRecency(daysAgo(10))).toBe(100);
    });

    it('happy: 30-90 days → 80', () => {
      expect(service.scoreRecency(daysAgo(60))).toBe(80);
    });

    it('happy: 90-365 days → 60', () => {
      expect(service.scoreRecency(daysAgo(200))).toBe(60);
    });

    it('happy: 1-2 years → 40', () => {
      expect(service.scoreRecency(daysAgo(500))).toBe(40);
    });

    it('happy: 2+ years → 20', () => {
      expect(service.scoreRecency(daysAgo(1000))).toBe(20);
    });

    it('edge: null returns 0', () => {
      expect(service.scoreRecency(null)).toBe(0);
    });

    it('edge: invalid date string returns 0', () => {
      expect(service.scoreRecency('not-a-date')).toBe(0);
    });
  });

  // ------------------------------------------------------------------
  // Similarity / Quality renormalization (full algo extension)
  // ------------------------------------------------------------------
  describe('computeSimilarity (renormalization)', () => {
    it('renormalizes when bitterness and color are missing — style + ABV split the full 100', () => {
      const beer = makeBeer({ style: 'IPA', abv: 5.5 });
      // Recipe with only style + ABV present (no IBU, no EBC).
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: null,
      });
      // Style 100 weighted 50, ABV 100 weighted 25, others null.
      // Renorm: (100*50 + 100*25) / (50+25) = 100.
      expect(service.computeSimilarity(beer, recipe)).toBe(100);
    });

    it('returns 0 when every similarity component is missing', () => {
      const beer = makeBeer({ style: '', abv: null });
      const recipe = makeRecipe({
        style: null,
        abv_estimated: null,
        avg_rating: null,
      });
      expect(service.computeSimilarity(beer, recipe)).toBe(0);
    });
  });

  describe('computeQuality (renormalization)', () => {
    it('renormalizes when brew_count and recency are missing — avg_rating gets full weight', () => {
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 5,
      });
      // brew_count = 0 (default in helper), last_brewed_at = null → both
      // dropped via maybe* → only avg_rating remains, renorm to 100%.
      // avg_rating 5 → score 100.
      expect(service.computeQuality(recipe)).toBe(100);
    });

    it('returns 0 when every quality component is missing', () => {
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: null,
      });
      expect(service.computeQuality(recipe)).toBe(0);
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
