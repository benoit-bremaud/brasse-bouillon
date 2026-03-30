import { Test, TestingModule } from '@nestjs/testing';

import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { useContainer } from 'class-validator';

/**
 * Safely narrows an unknown value to an object-like record.
 *
 * This helper is used in tests to read properties from HTTP response bodies
 * while preserving strict type safety and avoiding unsafe member access.
 *
 * @param value - Value to narrow.
 * @returns A record when the value is an object, otherwise `null`.
 */
const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as Record<string, unknown>;
};

describe('GET /auth/me (JWT protected)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // NOTE:
    // This e2e test intentionally does not apply global interceptors/filters/pipes
    // configured in main.ts (including response wrapping interceptors). Assertions
    // are therefore made against raw controller responses, consistent with the
    // convention used in test/app.e2e-spec.ts.
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.init();

    jwtService = moduleFixture.get(JwtService);
  });

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow access with a valid token', async () => {
    const suffix = Date.now().toString().slice(-6);
    const email = `protected-valid-${Date.now()}@example.com`;
    const password = 'SecurePassword123!';

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        username: `pv_${suffix}`,
        password,
        first_name: 'Protected',
        last_name: 'Valid',
      })
      .expect(201);

    const registerBody = toRecord(registerResponse.body);
    const accessToken = registerBody?.access_token;
    expect(typeof accessToken).toBe('string');
    if (typeof accessToken !== 'string') {
      throw new Error('Expected access_token to be a string');
    }

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        email,
        is_active: true,
      }),
    );
  });

  it('should deny access with an invalid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.value')
      .expect(401);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
      }),
    );
  });

  it('should deny access with an expired token', async () => {
    const suffix = Date.now().toString().slice(-6);
    const email = `protected-expired-${Date.now()}@example.com`;

    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        username: `pe_${suffix}`,
        password: 'SecurePassword123!',
        first_name: 'Protected',
        last_name: 'Expired',
      })
      .expect(201);

    const registerBody = toRecord(registerResponse.body);
    const userRecord = toRecord(registerBody?.user);
    const userId = userRecord?.id;
    expect(typeof userId).toBe('string');
    if (typeof userId !== 'string') {
      throw new Error('Expected registered user id to be a string');
    }

    const expiredToken = jwtService.sign({ sub: userId }, { expiresIn: -10 });

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
      }),
    );
  });

  it('should deny access when token is missing', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
      }),
    );
  });

  it('should return 429 after too many failed login attempts', async () => {
    const suffix = Date.now().toString().slice(-6);
    const email = `protected-throttle-${Date.now()}@example.com`;
    const password = 'SecurePassword123!';

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        username: `pt_${suffix}`,
        password,
        first_name: 'Protected',
        last_name: 'Throttle',
      })
      .expect(201);

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'WrongPassword!',
        })
        .expect(401);
    }

    const throttledResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        password: 'WrongPassword!',
      })
      .expect(429);

    const throttledBody = toRecord(throttledResponse.body);
    expect(throttledBody).toEqual(
      expect.objectContaining({
        statusCode: 429,
      }),
    );
  });
});
