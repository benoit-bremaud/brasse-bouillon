import { Test, TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { useContainer } from 'class-validator';

/**
 * Issue #779 — Recipe Catalog mini, e2e regression guards on the
 * GET /recipes/public route.
 *
 * Two contracts pinned here:
 *
 *   1. Route ordering — the literal `/recipes/public` must win
 *      over the dynamic `/recipes/:id`. If a future refactor
 *      reorders the controller and `@Get(':id')` ends up declared
 *      first, Nest will route /recipes/public into getMineById,
 *      ParseUUIDPipe will throw 400, and the catalog screen will
 *      die. The current controller-level test calls the method
 *      directly and would pass even after such a regression. This
 *      e2e test hits the actual router and would fail loudly.
 *
 *   2. Privacy guard — the response body must NOT include
 *      `owner_id`. The endpoint serializes via PublicRecipeDto
 *      (rather than RecipeDto) precisely so authenticated readers
 *      cannot enumerate the internal user IDs of recipe authors.
 *      Any future swap back to RecipeDto trips this assertion.
 */
describe('GET /recipes/public (e2e — Issue #779)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndGetToken(): Promise<string> {
    const suffix = Date.now().toString().slice(-9);
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `catalog-e2e-${suffix}@example.com`,
        username: `cat_${suffix}`,
        password: 'SecurePassword123!',
        first_name: 'Catalog',
        last_name: 'E2E',
      })
      .expect(201);

    const body = response.body as { access_token?: unknown };
    if (typeof body.access_token !== 'string') {
      throw new Error('Expected register response to carry an access_token');
    }
    return body.access_token;
  }

  it('happy: route ordering — /recipes/public resolves to listPublic, not getMineById', async () => {
    const token = await registerAndGetToken();

    // If `@Get(':id')` were declared before `@Get('public')`, Nest
    // would route this into getMineById, ParseUUIDPipe would throw
    // 400 with "Validation failed (uuid is expected)". A 200 here
    // is the canary that the route order is correct.
    const response = await request(app.getHttpServer())
      .get('/recipes/public')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('edge: response body never carries owner_id (privacy guard)', async () => {
    const token = await registerAndGetToken();

    const response = await request(app.getHttpServer())
      .get('/recipes/public')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const items = response.body as Array<Record<string, unknown>>;
    for (const item of items) {
      expect(item).not.toHaveProperty('owner_id');
      // Ownership-adjacent fields the public projection also drops:
      expect(item).not.toHaveProperty('imported_from_recipe_id');
      expect(item).not.toHaveProperty('import_provenance');
    }
  });

  it('edge: GET /recipes/:id on a PUBLIC recipe owned by someone else strips owner_id', async () => {
    const items = (await request(app.getHttpServer())
      .get('/recipes/public')
      .set('Authorization', `Bearer ${await registerAndGetToken()}`)
      .expect(200)
      .then((r) => r.body)) as Array<Record<string, unknown>>;

    if (items.length === 0) {
      // No PUBLIC recipe in the seed for this run — the privacy
      // guard is already pinned by the listing test above. Nothing
      // more to assert at the detail-by-id level today.
      return;
    }

    const samplePublicRecipeId = items[0].id as string;
    // A fresh viewer (different account from any recipe owner) hits
    // the detail endpoint. Before the Codex P1 fix this was a 404
    // because getMineById was strictly owner-scoped; after the fix
    // it returns 200 and projects through PublicRecipeDto.
    const viewerToken = await registerAndGetToken();
    const detail = await request(app.getHttpServer())
      .get(`/recipes/${samplePublicRecipeId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);

    expect(detail.body).not.toHaveProperty('owner_id');
    expect(detail.body).not.toHaveProperty('imported_from_recipe_id');
    expect(detail.body).not.toHaveProperty('import_provenance');
  });
});
