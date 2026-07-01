import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { FaqBotConfig } from '../config/faq-bot.config';
import { BotChallenge, BotCheckPort } from '../ports/bot-check.port';
import { BotCheckGuard } from './bot-check.guard';

class FakeBotCheck implements BotCheckPort {
  verifyResult = true;
  verifyCalls = 0;

  issueChallenge(): Promise<BotChallenge> {
    return Promise.resolve({
      algorithm: 'SHA-256',
      challenge: 'c',
      maxnumber: 1,
      salt: 's',
      signature: 'sig',
    });
  }

  verify(): Promise<boolean> {
    this.verifyCalls += 1;
    return Promise.resolve(this.verifyResult);
  }
}

function makeConfig(
  altchaHmacKey: string,
  botCheckBypassAllowed = true,
): FaqBotConfig {
  return {
    mistralApiKey: '',
    model: 'mistral-small-latest',
    timeoutMs: 8_000,
    maxAnswerTokens: 400,
    enabled: true,
    monthlyBudgetEur: 20,
    altchaHmacKey,
    botCheckBypassAllowed,
  };
}

function contextWithBody(body: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ body }) }),
  } as unknown as ExecutionContext;
}

describe('BotCheckGuard', () => {
  let botCheck: FakeBotCheck;

  beforeEach(() => {
    botCheck = new FakeBotCheck();
  });

  describe('bypass (no HMAC secret configured — dev/CI)', () => {
    it('allows the request without verifying, even with no payload (edge)', async () => {
      const guard = new BotCheckGuard(botCheck, makeConfig(''));

      await expect(guard.canActivate(contextWithBody({}))).resolves.toBe(true);
      expect(botCheck.verifyCalls).toBe(0);
    });
  });

  describe('fail closed (no HMAC secret outside dev/test)', () => {
    it('refuses with 503 rather than bypassing the paid endpoint (sad)', async () => {
      const guard = new BotCheckGuard(botCheck, makeConfig('', false));

      await expect(
        guard.canActivate(contextWithBody({ altcha: 'anything' })),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(botCheck.verifyCalls).toBe(0);
    });
  });

  describe('strict (HMAC secret configured — prod/staging)', () => {
    it('allows a request with a valid payload (happy)', async () => {
      botCheck.verifyResult = true;
      const guard = new BotCheckGuard(botCheck, makeConfig('secret'));

      await expect(
        guard.canActivate(contextWithBody({ altcha: 'solved' })),
      ).resolves.toBe(true);
      expect(botCheck.verifyCalls).toBe(1);
    });

    it('rejects a missing payload with 400 (sad)', async () => {
      const guard = new BotCheckGuard(botCheck, makeConfig('secret'));

      await expect(
        guard.canActivate(contextWithBody({})),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(botCheck.verifyCalls).toBe(0);
    });

    it('rejects an invalid payload with 403 (sad)', async () => {
      botCheck.verifyResult = false;
      const guard = new BotCheckGuard(botCheck, makeConfig('secret'));

      await expect(
        guard.canActivate(contextWithBody({ altcha: 'forged' })),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
