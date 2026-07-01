import { INestApplication } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { FAQ_BOT_CONFIG, type FaqBotConfig } from './config/faq-bot.config';
import { FaqBotModule } from './faq-bot.module';
import { LLM_PORT, type LlmPort } from './ports/llm.port';

/**
 * `POST /faq-bot/ask` must throttle abusive callers — rate-limiting is a primary anti-abuse
 * control on a public, anonymous surface (ADR-0022). This boots the real module with a fake LLM
 * and the anti-bot guard bypassed (empty HMAC key = dev/CI mode), then proves the 6th request in
 * the window is rejected with 429 — the deterministic sad/abuse path the ADR calls for.
 */
describe('FaqBot throttling (sad / abuse)', () => {
  let app: INestApplication;

  const fakeLlm: LlmPort = {
    complete: () =>
      Promise.resolve({ text: 'ok', promptTokens: 1, completionTokens: 1 }),
  };

  const config: FaqBotConfig = {
    mistralApiKey: 'test-key',
    model: 'mistral-small-latest',
    timeoutMs: 1_000,
    maxAnswerTokens: 100,
    enabled: true,
    monthlyBudgetEur: 1_000,
    altchaHmacKey: '', // empty → BotCheckGuard bypasses, isolating the throttler under test
    botCheckBypassAllowed: true,
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }]),
        FaqBotModule,
      ],
    })
      .overrideProvider(LLM_PORT)
      .useValue(fakeLlm)
      .overrideProvider(FAQ_BOT_CONFIG)
      .useValue(config)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows 5 requests then returns 429 on the 6th within the window', async () => {
    const ask = () =>
      request(app.getHttpServer())
        .post('/faq-bot/ask')
        .send({ question: 'What is Brasse-Bouillon?' });

    for (let i = 0; i < 5; i += 1) {
      await ask().expect(200);
    }

    await ask().expect(429);
  });
});
