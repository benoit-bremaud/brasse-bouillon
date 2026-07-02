import { FaqBotConfig } from './config/faq-bot.config';
import { FaqBotMetrics } from './metrics/faq-bot.metrics';
import { FaqBotService } from './faq-bot.service';
import { FaqBotUnavailableException } from './exceptions/faq-bot-unavailable.exception';
import { BotChallenge, BotCheckPort } from './ports/bot-check.port';
import { LlmPort, LlmRequest, LlmResult } from './ports/llm.port';
import { FaqBotPrompts } from './prompts/faq-bot-prompts';

/** Fake LLM boundary: records the request and returns a canned result (or throws). */
class FakeLlm implements LlmPort {
  lastRequest?: LlmRequest;
  result: LlmResult = {
    text: '  Brasse-Bouillon aide les novices a brasser.  ',
    promptTokens: 120,
    completionTokens: 25,
  };
  shouldThrow = false;

  complete(request: LlmRequest): Promise<LlmResult> {
    this.lastRequest = request;
    if (this.shouldThrow) {
      return Promise.reject(new Error('provider down'));
    }
    return Promise.resolve(this.result);
  }
}

/** Fake bot-check boundary. */
class FakeBotCheck implements BotCheckPort {
  challenge: BotChallenge = {
    algorithm: 'SHA-256',
    challenge: 'abc',
    maxnumber: 100_000,
    salt: 'salt',
    signature: 'sig',
  };

  issueChallenge(): Promise<BotChallenge> {
    return Promise.resolve(this.challenge);
  }

  verify(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

const PROMPTS: FaqBotPrompts = {
  system:
    'You are the Brasse-Bouillon FAQ chatbot. Stay on the project. Tutoie.',
  context: 'Brasse-Bouillon is a homebrewing companion app.',
};

function makeConfig(overrides: Partial<FaqBotConfig> = {}): FaqBotConfig {
  return {
    mistralApiKey: 'test-key',
    model: 'mistral-small-latest',
    timeoutMs: 8_000,
    maxAnswerTokens: 400,
    enabled: true,
    monthlyBudgetEur: 20,
    altchaHmacKey: '',
    botCheckBypassAllowed: true,
    ...overrides,
  };
}

describe('FaqBotService', () => {
  let llm: FakeLlm;
  let botCheck: FakeBotCheck;
  let metrics: FaqBotMetrics;

  beforeEach(() => {
    llm = new FakeLlm();
    botCheck = new FakeBotCheck();
    metrics = new FaqBotMetrics();
  });

  const build = (config: FaqBotConfig = makeConfig()): FaqBotService =>
    new FaqBotService(llm, botCheck, config, PROMPTS, metrics);

  describe('ask — happy path', () => {
    it('assembles system prompt + context + question, returns the trimmed answer, counts it', async () => {
      const service = build();

      const result = await service.ask('C’est quoi brasse-bouillon ?');

      expect(result.answer).toBe('Brasse-Bouillon aide les novices a brasser.');
      expect(llm.lastRequest?.system).toContain('FAQ chatbot');
      expect(llm.lastRequest?.user).toContain(
        'Brasse-Bouillon is a homebrewing companion app.',
      );
      expect(llm.lastRequest?.user).toContain('C’est quoi brasse-bouillon ?');
      expect(llm.lastRequest?.maxTokens).toBe(400);
      expect(metrics.snapshot().answers).toBe(1);
      expect(metrics.snapshot().promptTokens).toBe(120);
    });
  });

  describe('ask — sad paths', () => {
    it('throws FaqBotUnavailable when the kill-switch is off (no LLM call)', async () => {
      const service = build(makeConfig({ enabled: false }));

      await expect(service.ask('hello')).rejects.toBeInstanceOf(
        FaqBotUnavailableException,
      );
      expect(llm.lastRequest).toBeUndefined();
    });

    it('throws FaqBotUnavailable when the monthly budget is exhausted', async () => {
      const service = build(makeConfig({ monthlyBudgetEur: 0 }));

      await expect(service.ask('hello')).rejects.toBeInstanceOf(
        FaqBotUnavailableException,
      );
      expect(llm.lastRequest).toBeUndefined();
    });

    it('maps a provider failure to FaqBotUnavailable and records an error', async () => {
      llm.shouldThrow = true;
      const service = build();

      await expect(service.ask('hello')).rejects.toBeInstanceOf(
        FaqBotUnavailableException,
      );
      expect(metrics.snapshot().errors).toBe(1);
    });
  });

  describe('issueChallenge', () => {
    it('delegates to the bot-check port when the HMAC secret is set (happy)', async () => {
      const service = build(makeConfig({ altchaHmacKey: 'test-secret' }));

      await expect(service.issueChallenge()).resolves.toEqual(
        botCheck.challenge,
      );
    });

    it('fails closed with 503 when the HMAC secret is missing (sad)', async () => {
      // Without this guard, altcha-lib rejects the zero-length key with an
      // opaque unhandled 500 instead of a clean unavailable signal.
      const service = build(makeConfig({ altchaHmacKey: '' }));

      const error: unknown = await service
        .issueChallenge()
        .then(() => null)
        .catch((thrown: unknown) => thrown);

      expect(error).toBeInstanceOf(FaqBotUnavailableException);
      // Pin the actual HTTP status: exception type alone would keep passing
      // if the status ever regressed.
      expect((error as FaqBotUnavailableException).getStatus()).toBe(503);
    });
  });
});
