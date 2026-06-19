import { Test, TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { useContainer } from 'class-validator';

import { RecipeOrmEntity } from '../src/recipe/entities/recipe.orm.entity';
import { RecipeVisibility } from '../src/recipe/domain/enums/recipe-visibility.enum';

/**
 * e2e regression guard for the matcher v2 (ADR-0016) over the real HTTP
 * endpoint `POST /recipes/match` (#1232, epic #1230).
 *
 * Pins the behaviour the v2 redesign fixed — the "Leffe Blonde returned a
 * Saison / NEIPA" bug — by asserting the BJCP-family-graded ordering against
 * persisted PUBLIC recipes:
 *
 *   same canonical style (1.0) > same family (0.7) > same colour+strength
 *   tier (0.4)
 *
 * The three candidates share identical ABV / IBU / colour with the queried
 * beer, so **style grade is the only differentiator** — the ordering therefore
 * proves the graded style similarity, not numeric proximity. The candidates'
 * `avg_rating` is deliberately inverted (the worst style match has the best
 * rating) to also prove that rating is only a tie-break, never a driver
 * (ADR-0016).
 *
 * The recipe `style` column is not settable through `POST /recipes`
 * (CreateRecipeDto omits it), so the candidates are seeded directly via the
 * TypeORM repository of the booted app — the endpoint, scorer and DB are all
 * real.
 */

// Local test fixture password — never gates a real account.
const TEST_USER_PASSWORD = 'SecurePassword123!'; // NOSONAR

// The queried beer: a Blonde Ale (BJCP Pale Ale family, pale/standard).
const BLONDE_BEER = { style: 'Blonde Ale', abv: 5.2, ibu: 25, colorEbc: 8 };

describe('POST /recipes/match (e2e — matcher v2, ADR-0016, #1232)', () => {
  let app: INestApplication<App>;
  let recipeRepo: Repository<RecipeOrmEntity>;

  let ownerId: string; // a real user — recipes.owner_id has a FK to users.id
  let blondeId: string; // same canonical style as the beer -> 1.0
  let saisonId: string; // same family (Pale Ale) -> 0.7
  let neipaId: string; // different family (IPA), same tier -> 0.4

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();

    recipeRepo = app.get<Repository<RecipeOrmEntity>>(
      getRepositoryToken(RecipeOrmEntity),
    );

    // recipes.owner_id has a FK to users.id — seed under a real registered user.
    ownerId = (await register()).userId;

    // Identical numerics with BLONDE_BEER -> style grade is the sole driver.
    blondeId = await seedPublicRecipe('Blonde Ale', 4);
    saisonId = await seedPublicRecipe('Saison', 4.5);
    neipaId = await seedPublicRecipe('NEIPA', 4.8);
  });

  afterAll(async () => {
    const ids = [blondeId, saisonId, neipaId].filter(Boolean);
    if (recipeRepo && ids.length > 0) {
      await recipeRepo.delete(ids);
    }
    await app.close();
  });

  async function seedPublicRecipe(
    style: string,
    avgRating: number,
  ): Promise<string> {
    const id = randomUUID();
    await recipeRepo.save({
      id,
      owner_id: ownerId,
      root_recipe_id: id,
      name: `${style} — match e2e`,
      visibility: RecipeVisibility.PUBLIC,
      version: 1,
      brew_count: 0,
      is_official: false,
      style,
      abv_estimated: BLONDE_BEER.abv,
      ibu_target: BLONDE_BEER.ibu,
      ebc_target: BLONDE_BEER.colorEbc,
      avg_rating: avgRating,
    });
    return id;
  }

  async function register(): Promise<{ token: string; userId: string }> {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-9);
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `match-e2e-${suffix}@example.com`,
        username: `match_${suffix}`,
        password: TEST_USER_PASSWORD,
        first_name: 'Match',
        last_name: 'E2E',
      })
      .expect(201);

    const body = response.body as {
      access_token?: unknown;
      user?: { id?: unknown };
    };
    if (typeof body.access_token !== 'string') {
      throw new TypeError(
        'Expected register response to carry an access_token',
      );
    }
    if (typeof body.user?.id !== 'string') {
      throw new TypeError('Expected register response to carry user.id');
    }
    return { token: body.access_token, userId: body.user.id };
  }

  interface RankingItem {
    recipe: { id: string };
    score: number;
    completeness: number;
  }

  async function match(
    token: string,
    payload: Record<string, unknown>,
  ): Promise<{ rankings: RankingItem[]; low_confidence: boolean }> {
    const response = await request(app.getHttpServer())
      .post('/recipes/match')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(200);
    return response.body as {
      rankings: RankingItem[];
      low_confidence: boolean;
    };
  }

  const positionOf = (rankings: RankingItem[], id: string): number =>
    rankings.findIndex((r) => r.recipe.id === id);

  it('happy: graded style ranks blonde (1.0) > saison (0.7) > neipa (0.4)', async () => {
    const { token } = await register();
    const { rankings, low_confidence } = await match(token, BLONDE_BEER);

    expect(low_confidence).toBe(false);

    const blonde = positionOf(rankings, blondeId);
    const saison = positionOf(rankings, saisonId);
    const neipa = positionOf(rankings, neipaId);

    // All three cleared the acceptance thresholds (numerics match exactly).
    expect(blonde).toBeGreaterThanOrEqual(0);
    expect(saison).toBeGreaterThanOrEqual(0);
    expect(neipa).toBeGreaterThanOrEqual(0);

    // Order is driven by style grade, not by avg_rating (which is inverted).
    expect(blonde).toBeLessThan(saison);
    expect(saison).toBeLessThan(neipa);

    const score = (id: string): number =>
      rankings[positionOf(rankings, id)].score;
    expect(score(blondeId)).toBeGreaterThan(score(saisonId));
    expect(score(saisonId)).toBeGreaterThan(score(neipaId));

    // Exact-style + exact-numerics candidate is a (near-)perfect match.
    expect(score(blondeId)).toBeGreaterThanOrEqual(90);
    // Full picture compared (style+colour+ibu+abv) -> completeness ~0.94.
    expect(
      rankings[positionOf(rankings, blondeId)].completeness,
    ).toBeGreaterThan(0.9);
  });

  it('edge: a sparse beer (style + abv only) still ranks, with lower completeness', async () => {
    const { token } = await register();
    const { rankings, low_confidence } = await match(token, {
      style: BLONDE_BEER.style,
      abv: BLONDE_BEER.abv,
    });

    expect(low_confidence).toBe(false);
    const blonde = positionOf(rankings, blondeId);
    expect(blonde).toBeGreaterThanOrEqual(0);
    expect(blonde).toBeLessThan(positionOf(rankings, saisonId));

    // Only style (40) + abv (14) were comparable -> completeness ~0.54,
    // honestly below the full-picture 0.94 of the happy path.
    const completeness = rankings[blonde].completeness;
    expect(completeness).toBeGreaterThanOrEqual(0.5);
    expect(completeness).toBeLessThan(0.7);
  });

  it('sad: a beer with no comparable criteria yields the honest empty state', async () => {
    const { token } = await register();
    const { rankings, low_confidence } = await match(token, {});

    // Nothing is comparable -> nothing clears the thresholds -> the mobile
    // renders "no reliable equivalent" rather than a misleading closest match.
    expect(rankings).toHaveLength(0);
    expect(low_confidence).toBe(true);
  });
});
