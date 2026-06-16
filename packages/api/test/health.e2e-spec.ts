import { Test, TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import request from 'supertest';

/**
 * Liveness healthcheck e2e — pins the `GET /health` contract that the
 * Docker HEALTHCHECK relies on.
 *
 * This probe replaces the previous dependency on the incidental root route
 * `GET /`. The container HEALTHCHECK only checks for a 2xx status, so the
 * load-bearing assertion is the 200 status code. The body shape is pinned
 * too, exercised through the global response envelope (the interceptor is
 * applied to mirror `main.ts`).
 *
 * There is intentionally no sad path: liveness takes no input and touches
 * no database, so it cannot fail while the process serves HTTP. The edge
 * case asserts the route surface — only GET is exposed, POST is a 404.
 */
describe('GET /health (e2e — liveness probe)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirror main.ts so the response envelope is exercised end-to-end.
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Happy path + public contract — the probe returns 200 with the ok
  // acknowledgement and requires NO Authorization header (the orchestrator
  // must be able to reach liveness without credentials). This request sends
  // no auth header, so it also guards against a future accidental guard.
  it('is public and returns 200 with an ok status in the response envelope', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);

    const body = res.body as { data?: { status?: unknown } };
    expect(body.data?.status).toBe('ok');
  });

  // Edge — only GET is exposed; POST /health is not a route → 404.
  it('exposes only GET — POST /health is a 404', async () => {
    await request(app.getHttpServer()).post('/health').expect(404);
  });
});
