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

/**
 * Recipe matching **v2** (ADR-0016). Match strength = weighted, completeness-
 * aware similarity only (style 40 BJCP-graded, colour 22, IBU 18, ABV 14;
 * Gower renorm). A candidate is shown only when matchStrength ≥ SCAN_MATCH_S_MIN
 * (default 45) AND completeness ≥ SCAN_MATCH_C_MIN (default 0.5) — D5. The test
 * fixtures never set IBU/colour, so completeness is 0.54 (style + ABV) or 0.40
 * (style only, which is filtered out by C_min).
 */
describe('RecipeMatchingService (matcher v2, ADR-0016)', () => {
  let module: TestingModule;
  let service: RecipeMatchingService;
  let recipeRepo: Repository<RecipeOrmEntity>;
  let catalogRepo: Repository<ScanCatalogItemOrmEntity>;

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
  // scoreAbv (local similarity, unchanged)
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
  // scoreBitterness (local similarity, unchanged)
  // ---------------------------------------------------------------
  describe('scoreBitterness', () => {
    it('happy: same band scores 100', () => {
      expect(service.scoreBitterness(30, 35)).toBe(100);
    });

    it('happy: neighbouring band scores 60', () => {
      expect(service.scoreBitterness(15, 25)).toBe(60);
    });

    it('sad: two-or-more bands apart scores 0', () => {
      expect(service.scoreBitterness(10, 70)).toBe(0);
    });

    it('edge: missing values score 0', () => {
      expect(service.scoreBitterness(null, 30)).toBe(0);
      expect(service.scoreBitterness(30, undefined)).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // scoreColor (local similarity, unchanged)
  // ---------------------------------------------------------------
  describe('scoreColor', () => {
    it('happy: same EBC band scores 100', () => {
      expect(service.scoreColor(18, 25)).toBe(100);
    });

    it('happy: neighbouring band scores 60', () => {
      expect(service.scoreColor(6, 12)).toBe(60);
    });

    it('sad: pale vs noir is two-bands-apart-or-more, scores 0', () => {
      expect(service.scoreColor(4, 80)).toBe(0);
    });

    it('edge: missing values score 0', () => {
      expect(service.scoreColor(null, 18)).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // computeFinalScore — match strength = similarity only (no quality blend)
  // ---------------------------------------------------------------
  describe('computeFinalScore (match strength)', () => {
    let beer: ScanCatalogItemOrmEntity;
    beforeEach(() => {
      beer = makeBeer({ style: 'IPA', abv: 5.5 });
    });

    it('happy: weighted similarity with renorm — exact style + exact ABV = 100', () => {
      // style 1.0 → 100 (weight 40), ABV 100 (weight 14), IBU/colour absent.
      // matchStrength = (40·100 + 14·100) / 54 = 100. No quality term.
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 5,
      });
      expect(service.computeFinalScore(beer, recipe)).toBe(100);
    });

    it('happy: a same-style official gets the shortcut (matchStrength = 100, no quality)', () => {
      const official = makeRecipe({
        style: 'IPA',
        abv_estimated: null,
        avg_rating: null,
        is_official: true,
      });
      expect(service.computeFinalScore(beer, official)).toBe(100);
    });

    it('happy: a same-FAMILY official also gets the shortcut (≥ 0.7)', () => {
      const pilsnerBeer = makeBeer({ style: 'Pilsner', abv: 5 });
      // Lager is a different canonical but the same Pale Lager family → 0.7.
      const lagerOfficial = makeRecipe({
        style: 'Lager',
        abv_estimated: null,
        avg_rating: null,
        is_official: true,
      });
      expect(service.computeFinalScore(pilsnerBeer, lagerOfficial)).toBe(100);
    });

    it('#1193: a same-tier-only official (IPA for a Blonde) does NOT get the shortcut', () => {
      const blondeBeer = makeBeer({ style: 'Blonde Ale', abv: 5 });
      // IPA vs Blonde Ale: different family, both pale+standard → 0.4 (< 0.7).
      const offFamilyOfficial = makeRecipe({
        style: 'American IPA',
        abv_estimated: 5.5,
        avg_rating: null,
        is_official: true,
      });
      // Same-family non-official (Saison ≈ Blonde, both Pale Ale → 0.7).
      const sameFamilyNonOfficial = makeRecipe({
        style: 'Saison',
        abv_estimated: 5,
        avg_rating: null,
      });
      expect(
        service.computeFinalScore(blondeBeer, offFamilyOfficial),
      ).toBeLessThan(
        service.computeFinalScore(blondeBeer, sameFamilyNonOfficial),
      );
    });

    it('edge: a recipe with no comparable criterion scores 0', () => {
      const empty = makeRecipe({
        style: null,
        abv_estimated: null,
        avg_rating: null,
      });
      expect(service.computeFinalScore(beer, empty)).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // computeSimilarity (Gower renormalization)
  // ---------------------------------------------------------------
  describe('computeSimilarity (renormalization)', () => {
    it('renormalizes when IBU and colour are missing — style + ABV split the present weight', () => {
      const beer = makeBeer({ style: 'IPA', abv: 5.5 });
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: null,
      });
      // style 100 (w40) + ABV 100 (w14), IBU/colour null → (4000 + 1400)/54 = 100.
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

    it('treats a whitespace-only style as absent (renormalised, not a 0 penalty)', () => {
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 4,
      });
      const whitespace = service.computeSimilarity(
        { style: '  ', abv: 5.5 },
        recipe,
      );
      const absent = service.computeSimilarity(
        { style: null, abv: 5.5 },
        recipe,
      );
      expect(whitespace).toBe(absent);
    });
  });

  // ---------------------------------------------------------------
  // computeCompleteness (ADR-0016 D4)
  // ---------------------------------------------------------------
  describe('computeCompleteness', () => {
    it('happy: style + ABV present → 0.54 (of the full 100)', () => {
      const beer = makeBeer({ style: 'IPA', abv: 5.5 });
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: null,
      });
      expect(service.computeCompleteness(beer, recipe)).toBeCloseTo(0.54, 5);
    });

    it('edge: style only → 0.40 (below C_min, so such a match is filtered)', () => {
      const beer = makeBeer({ style: 'IPA', abv: null });
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: null,
        avg_rating: null,
      });
      expect(service.computeCompleteness(beer, recipe)).toBeCloseTo(0.4, 5);
    });

    it('edge: all four criteria present → caps at 0.94 (ingredients weight 6 not compared)', () => {
      const beer = makeBeer({ style: 'IPA', abv: 5 });
      beer.ibu = 30;
      beer.color_ebc = 10;
      const recipe = makeRecipe({
        style: 'IPA',
        abv_estimated: 5,
        avg_rating: null,
      });
      recipe.ibu_target = 30;
      recipe.ebc_target = 10;
      expect(service.computeCompleteness(beer, recipe)).toBeCloseTo(0.94, 5);
    });

    it('edge: no comparable criterion → 0', () => {
      const beer = makeBeer({ style: '', abv: null });
      const recipe = makeRecipe({
        style: null,
        abv_estimated: null,
        avg_rating: null,
      });
      expect(service.computeCompleteness(beer, recipe)).toBe(0);
    });
  });

  // ---------------------------------------------------------------
  // rankForBeer (integration with the in-memory DB)
  // ---------------------------------------------------------------
  describe('rankForBeer (integration)', () => {
    it('happy: keeps the same-style IPAs and orders them, drops the off-family styles (D5)', async () => {
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

      // Only the two IPAs (same canonical → style 100) clear S_min; the Tripel
      // and Stout score 0 on style and ABV → filtered.
      expect(rankings.map((r) => r.recipe.name)).toEqual([
        'Session IPA Citra',
        'NEIPA',
      ]);
      expect(rankings[0].score).toBeGreaterThan(rankings[1].score);
      expect(rankings[0].completeness).toBeCloseTo(0.54, 5);
      expect(low_confidence).toBe(false);
    });

    it('happy: a style-compatible official beats non-official peers and scores 100 (#1193 / D6)', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'Pilsner',
        abv: 5,
      });
      await seedRecipe(recipeRepo, {
        name: 'Random NEIPA',
        style: 'NEIPA', // different family, same pale+standard tier → 0.4
        abv_estimated: 6.5,
        avg_rating: 5,
      });
      await seedRecipe(recipeRepo, {
        name: 'Brewer-Endorsed Pilsner',
        style: 'Pilsner', // same canonical → shortcut applies
        abv_estimated: 9,
        avg_rating: null,
        is_official: true,
      });

      const { rankings } = await service.rankForBeer(beerId, 3);
      expect(rankings[0].recipe.name).toBe('Brewer-Endorsed Pilsner');
      expect(rankings[0].score).toBe(100);
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
      const beerId = await seedBeer(catalogRepo, { style: 'IPA', abv: 5 });
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
        'A-high-rating', // 5★, smaller id (bbbb…)
        'A-high-rating-tie', // 5★, larger id (cccc…)
        'Z-low-rating', // 3★
      ]);
    });

    it('edge: caps the limit at 10 even if a larger value is requested', async () => {
      const beerId = await seedBeer(catalogRepo, { style: 'IPA', abv: 5 });
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
    // Acceptance threshold (ADR-0016 D5) → honest empty state
    // ----------------------------------------------------------------

    it('D5: nothing passes → empty rankings + low_confidence true (no misleading closest match)', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'Pilsner',
        abv: 4.5,
      });
      // Off family AND off ABV → style 0, ABV 0 → matchStrength 0 < S_min.
      await seedRecipe(recipeRepo, {
        name: 'Imperial Stout',
        style: 'Imperial Stout',
        abv_estimated: 9.5,
        avg_rating: null,
      });

      const { rankings, low_confidence } = await service.rankForBeer(beerId, 3);
      expect(rankings).toHaveLength(0);
      expect(low_confidence).toBe(true);
    });

    it('D5: an off-style official is not promoted and is filtered out too', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'Pilsner',
        abv: 4.5,
      });
      await seedRecipe(recipeRepo, {
        name: 'Irrelevant Official Imperial Stout',
        style: 'Imperial Stout',
        abv_estimated: 9.5,
        avg_rating: null,
        is_official: true,
      });

      const { rankings, low_confidence } = await service.rankForBeer(beerId, 3);
      expect(rankings).toHaveLength(0);
      expect(low_confidence).toBe(true);
    });

    it('D5: a strong same-style match passes → low_confidence false', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'IPA',
        abv: 5.5,
      });
      await seedRecipe(recipeRepo, {
        name: 'Spot-on IPA',
        style: 'IPA',
        abv_estimated: 5.5,
        avg_rating: 4,
      });

      const { rankings, low_confidence } = await service.rankForBeer(beerId, 3);
      expect(rankings).toHaveLength(1);
      expect(rankings[0].score).toBeGreaterThanOrEqual(45);
      expect(low_confidence).toBe(false);
    });

    it('D5: a style-only beer (completeness 0.40 < C_min) is filtered even on an exact style', async () => {
      const beerId = await seedBeer(catalogRepo, {
        style: 'IPA',
        abv: null,
      });
      await seedRecipe(recipeRepo, {
        name: 'Exact-style but ABV unknown',
        style: 'IPA',
        abv_estimated: null,
        avg_rating: 4,
      });

      const { rankings, low_confidence } = await service.rankForBeer(beerId, 3);
      expect(rankings).toHaveLength(0);
      expect(low_confidence).toBe(true);
    });
  });

  // ---------------------------------------------------------------
  // rankByCharacteristics — the source-agnostic core (scan cutover #1186)
  // ---------------------------------------------------------------
  describe('rankByCharacteristics (integration — no scan_catalog row)', () => {
    it('happy: ranks the closest recipe from characteristics alone (no beer id)', async () => {
      await Promise.all([
        seedRecipe(recipeRepo, {
          name: 'Session IPA Citra',
          style: 'Session IPA',
          abv_estimated: 4.6,
          avg_rating: 4.7,
        }),
        seedRecipe(recipeRepo, {
          name: 'Belgian Tripel',
          style: 'Belgian Tripel',
          abv_estimated: 8.5,
          avg_rating: 4.8,
        }),
      ]);

      const { rankings, low_confidence } = await service.rankByCharacteristics(
        { style: 'Session IPA', abv: 4.5 },
        3,
      );

      expect(rankings[0].recipe.name).toBe('Session IPA Citra');
      expect(low_confidence).toBe(false);
    });

    it('D5: a style-only query is filtered (completeness 0.40 < C_min) → empty + low confidence', async () => {
      await seedRecipe(recipeRepo, {
        name: 'IPA',
        style: 'IPA',
        abv_estimated: 6,
        avg_rating: 4.5,
      });

      const { rankings, low_confidence } = await service.rankByCharacteristics(
        { style: 'IPA' },
        3,
      );

      expect(rankings).toHaveLength(0);
      expect(low_confidence).toBe(true);
    });

    it('edge: empty characteristics → nothing comparable → empty + low confidence', async () => {
      await seedRecipe(recipeRepo, {
        name: 'Whatever',
        style: 'IPA',
        abv_estimated: 6,
        avg_rating: 4,
      });

      const { rankings, low_confidence } = await service.rankByCharacteristics(
        { style: null },
        3,
      );

      expect(rankings).toHaveLength(0);
      expect(low_confidence).toBe(true);
    });

    it('parity: rankForBeer delegates here — same ranking for the same characteristics', async () => {
      const beerId = await seedBeer(catalogRepo, { style: 'Stout', abv: 5 });
      await Promise.all([
        seedRecipe(recipeRepo, {
          name: 'Dry Stout',
          style: 'Stout',
          abv_estimated: 4.8,
          avg_rating: 4.6,
        }),
        seedRecipe(recipeRepo, {
          name: 'Hazy IPA',
          style: 'NEIPA',
          abv_estimated: 6.5,
          avg_rating: 4.5,
        }),
      ]);

      const viaBeer = await service.rankForBeer(beerId, 3);
      const viaCharacteristics = await service.rankByCharacteristics(
        { style: 'Stout', abv: 5 },
        3,
      );

      expect(viaCharacteristics.rankings.map((r) => r.recipe.name)).toEqual(
        viaBeer.rankings.map((r) => r.recipe.name),
      );
    });

    it('#1193 (the Leffe case): a blonde beer ranks the genuine blonde above an off-family IPA official', async () => {
      await Promise.all([
        seedRecipe(recipeRepo, {
          name: 'Punk IPA (official)',
          style: 'American IPA', // IPA family — same tier as Blonde, not promoted
          abv_estimated: 5.4,
          avg_rating: 4.9,
          is_official: true,
        }),
        seedRecipe(recipeRepo, {
          name: 'Belgian Blonde',
          style: 'Blonde Ale', // exact family → genuine match
          abv_estimated: 6.5,
          avg_rating: 4.2,
        }),
      ]);

      const { rankings } = await service.rankByCharacteristics(
        { style: 'Blonde Ale', abv: 6.6 },
        3,
      );

      expect(rankings[0].recipe.name).toBe('Belgian Blonde');
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
