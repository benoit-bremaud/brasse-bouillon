/**
 * Self-contained typed configuration for the FAQ bot (mirrors `water.config.ts`): parsed from
 * env with safe defaults, provided via `FAQ_BOT_CONFIG`. Kept inside the module (isolation,
 * ADR-0022) rather than added to the central Joi schema. Secrets are read here only.
 */

export interface FaqBotConfig {
  /** Mistral API key — server-side only, used exclusively by `MistralLlmAdapter`. */
  readonly mistralApiKey: string;
  /** Chat model id (small/eco tier). */
  readonly model: string;
  /** Per-request timeout for the LLM call (ms). */
  readonly timeoutMs: number;
  /** Upper bound on generated answer tokens (cost/abuse control). */
  readonly maxAnswerTokens: number;
  /** Kill-switch: when false the bot returns "unavailable". */
  readonly enabled: boolean;
  /** Monthly budget cap (EUR); past it the bot disables (v1: in-memory best-effort). */
  readonly monthlyBudgetEur: number;
  /** ALTCHA HMAC secret; empty string means "bot-check bypassed" (dev/CI). */
  readonly altchaHmacKey: string;
  /**
   * Whether the anti-bot check may be safely skipped when no HMAC secret is set.
   * True only in local dev / test; false everywhere else so a misconfigured
   * staging/prod fails closed instead of leaving the paid endpoint unprotected (ADR-0022).
   */
  readonly botCheckBypassAllowed: boolean;
}

/** Injection token for `FaqBotConfig`. */
export const FAQ_BOT_CONFIG = Symbol('FaqBotConfig');

const DEFAULT_MODEL = 'mistral-small-latest';
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_ANSWER_TOKENS = 400;
const DEFAULT_MONTHLY_BUDGET_EUR = 20;

function parsePositiveInteger(
  raw: string | undefined,
  fallback: number,
): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  return raw === 'true' || raw === '1';
}

/** Build the config from `process.env` (factory for the `FAQ_BOT_CONFIG` provider). */
export const faqBotConfig = (): FaqBotConfig => {
  // Default to a production-like posture when unset so a misconfigured deploy fails closed.
  const env =
    process.env.APP_ENV?.trim() || process.env.NODE_ENV?.trim() || 'production';
  return {
    mistralApiKey: process.env.MISTRAL_API_KEY ?? '',
    model: process.env.MISTRAL_MODEL?.trim() || DEFAULT_MODEL,
    timeoutMs: parsePositiveInteger(
      process.env.MISTRAL_TIMEOUT_MS,
      DEFAULT_TIMEOUT_MS,
    ),
    maxAnswerTokens: parsePositiveInteger(
      process.env.FAQ_BOT_MAX_ANSWER_TOKENS,
      DEFAULT_MAX_ANSWER_TOKENS,
    ),
    enabled: parseBoolean(process.env.FAQ_BOT_ENABLED, true),
    monthlyBudgetEur: parsePositiveInteger(
      process.env.FAQ_BOT_MONTHLY_BUDGET_EUR,
      DEFAULT_MONTHLY_BUDGET_EUR,
    ),
    altchaHmacKey: process.env.ALTCHA_HMAC_KEY ?? '',
    botCheckBypassAllowed: env === 'development' || env === 'test',
  };
};
