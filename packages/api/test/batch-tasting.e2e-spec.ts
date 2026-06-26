import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { useContainer } from 'class-validator';

/**
 * B3 — tasting endpoints, e2e regression guards on `POST/GET
 * /batches/:id/tasting`.
 *
 * Pins the tasting contracts against the real TypeORM DataSource (would fail
 * with `EntityMetadataNotFoundError` if `TastingOrmEntity` were not registered
 * in `ormEntities`). Tasting is only allowed once the batch is bottled/closed,
 * so every write path first drives the batch to COMPLETED via the real
 * bottling-close flow:
 *   1. Wiring — a completed batch accepts a 1-5 tasting and returns it on GET.
 *   2. One tasting per batch — a second POST is rejected with 409.
 *   3. Validation — an out-of-range rating is rejected with 400.
 *   4. Lifecycle — a tasting on an in-progress (non-completed) batch is 400.
 */
const TEST_PASSWORD = 'SecurePassword123!'; // NOSONAR

interface RegisterResult {
  token: string;
}

describe('Batch tasting (e2e — B3)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override the rate limiter so the cross-user isolation test can register
      // both users without tripping the 5-registrations-per-minute throttle
      // (same pattern as feedback.e2e-spec.ts) — this suite tests ownership, not
      // rate limiting.
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function register(): Promise<RegisterResult> {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-9);
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `tasting-e2e-${suffix}@example.com`,
        username: `tasting_${suffix}`,
        password: TEST_PASSWORD,
        first_name: 'Tasting',
        last_name: 'E2E',
      })
      .expect(201);

    const body = response.body as { access_token?: unknown };
    if (typeof body.access_token !== 'string') {
      throw new TypeError(
        'Expected register response to carry an access_token',
      );
    }
    return { token: body.access_token };
  }

  async function startBatch(token: string): Promise<string> {
    const recipeRes = await request(app.getHttpServer())
      .post('/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Blonde e2e' })
      .expect(201);
    const recipeId = (recipeRes.body as { id: string }).id;

    const batchRes = await request(app.getHttpServer())
      .post('/batches')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipeId })
      .expect(201);
    return (batchRes.body as { id: string }).id;
  }

  // Drive a freshly started batch through its 5 steps to COMPLETED via the real
  // HTTP flow: advance the 4 steps before PACKAGING, then bottle-and-close (the
  // close auto-completes the batch). Tasting is only allowed once completed.
  async function completeBatch(token: string, batchId: string): Promise<void> {
    for (let i = 0; i < 4; i += 1) {
      await request(app.getHttpServer())
        .post(`/batches/${batchId}/steps/current/complete`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    }
    await request(app.getHttpServer())
      .post(`/batches/${batchId}/bottling/close`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  }

  // Happy path — POST then GET returns the tasting (exercises the real DataSource)
  it('records a tasting and returns it on GET', async () => {
    const { token } = await register();
    const batchId = await startBatch(token);
    await completeBatch(token, batchId);

    const created = await request(app.getHttpServer())
      .post(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, note: 'Belle mousse, finale fruitée.' })
      .expect(201);

    const createdBody = created.body as {
      id: string;
      rating: number;
      note: string;
    };
    expect(typeof createdBody.id).toBe('string');
    expect(createdBody.rating).toBe(4);
    expect(createdBody.note).toBe('Belle mousse, finale fruitée.');

    const fetched = await request(app.getHttpServer())
      .get(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect((fetched.body as { id: string }).id).toBe(createdBody.id);
  });

  // Sad path — a second tasting on the same batch is rejected (409)
  it('rejects a second tasting on the same batch', async () => {
    const { token } = await register();
    const batchId = await startBatch(token);
    await completeBatch(token, batchId);

    await request(app.getHttpServer())
      .post(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 5 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 3 })
      .expect(409);
  });

  // Edge — an out-of-range rating is rejected by validation (400)
  it('rejects an out-of-range rating', async () => {
    const { token } = await register();
    const batchId = await startBatch(token);
    await completeBatch(token, batchId);

    await request(app.getHttpServer())
      .post(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 9 })
      .expect(400);
  });

  // Sad path — a tasting on an in-progress (non-completed) batch is rejected
  // (400): conception places tasting strictly after bottling/closure.
  it('rejects a tasting on an in-progress (non-completed) batch', async () => {
    const { token } = await register();
    const batchId = await startBatch(token);

    await request(app.getHttpServer())
      .post(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4 })
      .expect(400);
  });

  // Edge — GET on a batch without a tasting returns 404
  it('returns 404 when no tasting exists yet', async () => {
    const { token } = await register();
    const batchId = await startBatch(token);

    await request(app.getHttpServer())
      .get(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  // Edge — cross-user isolation: B cannot read or write A's batch tasting (404)
  it('isolates tastings across users (B gets 404 on A’s batch, GET and POST)', async () => {
    const { token: tokenA } = await register();
    const batchId = await startBatch(tokenA);
    await completeBatch(tokenA, batchId);

    // A records a tasting on its own batch.
    await request(app.getHttpServer())
      .post(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ rating: 4, note: 'Private note' })
      .expect(201);

    const { token: tokenB } = await register();

    // B must not see A's batch at all — ownership guard returns 404, not 403,
    // to avoid leaking the existence of another user's batch.
    await request(app.getHttpServer())
      .get(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(`/batches/${batchId}/tasting`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ rating: 5 })
      .expect(404);
  });
});
