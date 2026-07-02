import { faqBotConfig } from './faq-bot.config';

/**
 * The env → `botCheckBypassAllowed` derivation is the security decision that keeps the
 * anti-bot fail-closed outside dev/test — it must be pinned independently of the guard
 * (which only proves it honours an already-set flag).
 */
describe('faqBotConfig — botCheckBypassAllowed derivation', () => {
  const KEYS = ['APP_ENV', 'NODE_ENV'] as const;
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));
  });

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    }
  });

  const setEnv = (appEnv?: string, nodeEnv?: string): void => {
    if (appEnv === undefined) {
      delete process.env.APP_ENV;
    } else {
      process.env.APP_ENV = appEnv;
    }
    if (nodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = nodeEnv;
    }
  };

  it.each(['development', 'test'])(
    'allows the bypass when APP_ENV=%s (happy)',
    (env) => {
      setEnv(env, env);

      expect(faqBotConfig().botCheckBypassAllowed).toBe(true);
    },
  );

  it('forbids the bypass in production (sad)', () => {
    setEnv('production', 'production');

    expect(faqBotConfig().botCheckBypassAllowed).toBe(false);
  });

  it('fails closed when APP_ENV and NODE_ENV are both unset (edge)', () => {
    setEnv(undefined, undefined);

    expect(faqBotConfig().botCheckBypassAllowed).toBe(false);
  });

  it('falls back to NODE_ENV when APP_ENV is unset (edge)', () => {
    setEnv(undefined, 'production');

    expect(faqBotConfig().botCheckBypassAllowed).toBe(false);
  });

  it('normalises case via the canonical resolver (edge)', () => {
    setEnv('TEST', 'test');

    expect(faqBotConfig().botCheckBypassAllowed).toBe(true);
  });

  it('rejects an unknown environment outright (edge — resolver throws)', () => {
    setEnv('staging', undefined);

    expect(() => faqBotConfig()).toThrow(/Invalid APP_ENV/);
  });
});

describe('faqBotConfig — altchaHmacKey parsing', () => {
  const saved = process.env.ALTCHA_HMAC_KEY;

  afterEach(() => {
    if (saved === undefined) {
      delete process.env.ALTCHA_HMAC_KEY;
    } else {
      process.env.ALTCHA_HMAC_KEY = saved;
    }
  });

  it('reads a whitespace-only secret as missing (edge — secrets-UI slip)', () => {
    process.env.APP_ENV = 'test';
    process.env.ALTCHA_HMAC_KEY = '   ';

    // A blank secret must hit the fail-closed guards, not reach altcha-lib.
    expect(faqBotConfig().altchaHmacKey).toBe('');
  });

  it('trims a padded secret to its usable value (happy)', () => {
    process.env.APP_ENV = 'test';
    process.env.ALTCHA_HMAC_KEY = ' real-secret ';

    expect(faqBotConfig().altchaHmacKey).toBe('real-secret');
  });
});
