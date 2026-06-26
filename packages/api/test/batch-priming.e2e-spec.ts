import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';

import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { useContainer } from 'class-validator';

/**
 * B3 — priming endpoint, e2e guard on `GET /batches/:id/priming` query
 * validation.
 *
 * A malformed advanced query (e.g. a negative `targetCo2Vol`) must be a 400
 * (client error) from the ValidationPipe, never a 500 from the calculator
 * throwing a plain `Error` deeper down. The `@Min/@Max` constraints on
 * `GetPrimingQueryDto` are what enforce this.
 */
const TEST_PASSWORD = 'SecurePassword123!'; // NOSONAR

interface RegisterResult {
  token: string;
}

describe('Batch priming (e2e — B3)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override the rate limiter so registration is not throttled — this suite
      // tests query validation, not rate limiting (same pattern as the tasting
      // e2e suite).
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
        email: `priming-e2e-${suffix}@example.com`,
        username: `priming_${suffix}`,
        password: TEST_PASSWORD,
        first_name: 'Priming',
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

  // Sad path — a negative targetCo2Vol is rejected by the ValidationPipe (400),
  // never reaching the calculator (which would otherwise 500 on a plain Error).
  it('rejects a negative targetCo2Vol with 400', async () => {
    const { token } = await register();
    const batchId = await startBatch(token);

    await request(app.getHttpServer())
      .get(`/batches/${batchId}/priming?targetCo2Vol=-1&beerTempC=20`)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
