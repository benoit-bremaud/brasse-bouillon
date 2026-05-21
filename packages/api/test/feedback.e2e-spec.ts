import { Test, TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { useContainer } from 'class-validator';

/**
 * Issue #1027 — feedback ingestion endpoint, e2e regression guards on
 * `POST /feedback`.
 *
 * Two contracts pinned here:
 *
 *   1. Wiring — a valid payload persists and returns 201. This exercises
 *      the real TypeORM DataSource and would fail with
 *      `EntityMetadataNotFoundError` if the `Feedback` entity were not
 *      registered in `ormEntities` (the bug Codex/Copilot flagged on the
 *      first revision). Unit tests mock the repository and cannot catch it.
 *   2. Validation — `forbidNonWhitelisted` + field rules reject malformed
 *      bodies with 400 (short message, unknown extra field, bad pairing).
 *
 * The ThrottlerGuard is overridden so the rate limit never interferes.
 */
function validPayload(): Record<string, unknown> {
  return {
    projectId: 'brasse-bouillon-website',
    category: 'bug',
    subCategory: 'broken-feature',
    message: 'The download button does nothing on Android 13.',
    url: 'https://brasse-bouillon.com/download',
    referrer: null,
    userAgent: 'Mozilla/5.0',
    viewport: { w: 1280, h: 800 },
    locale: 'fr-FR',
    timestamp: '2026-05-21T10:15:00.000Z',
    widgetVersion: '0.2.0',
    scrollDepth: 0.42,
    sessionId: 'sess_e2e',
  };
}

describe('POST /feedback (e2e — Issue #1027)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    // Apply the same input validation as main.ts so the 400 contracts hold.
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Happy path — valid payload persists (exercises the real DataSource)
  it('accepts a valid submission and returns 201 with an acknowledgement', async () => {
    const res = await request(app.getHttpServer())
      .post('/feedback')
      .send(validPayload())
      .expect(201);

    const body = res.body as { id?: unknown; category?: unknown };
    expect(typeof body.id).toBe('string');
    expect(body.category).toBe('bug');
  });

  // Edge — 'other' category with a null sub-category is accepted
  it('accepts the "other" category with a null sub-category', async () => {
    await request(app.getHttpServer())
      .post('/feedback')
      .send({ ...validPayload(), category: 'other', subCategory: null })
      .expect(201);
  });

  // Sad — message shorter than the minimum length → 400
  it('rejects a message shorter than the minimum length', async () => {
    await request(app.getHttpServer())
      .post('/feedback')
      .send({ ...validPayload(), message: 'too short' })
      .expect(400);
  });

  // Sad — unknown extra field → 400 (forbidNonWhitelisted)
  it('rejects an unknown extra field', async () => {
    await request(app.getHttpServer())
      .post('/feedback')
      .send({ ...validPayload(), reporterName: 'Anon' })
      .expect(400);
  });

  // Sad — sub-category that does not match the category → 400
  it('rejects a sub-category that does not match the category', async () => {
    await request(app.getHttpServer())
      .post('/feedback')
      .send({ ...validPayload(), category: 'typo', subCategory: 'crash' })
      .expect(400);
  });
});
