/**
 * Self-contained typed configuration for the FAQ bot (mirrors `water.config.ts`): parsed from
 * env with safe defaults, provided via `FAQ_BOT_CONFIG`. Kept inside the module (isolation,
 * ADR-0022) rather than added to the central Joi schema. Secrets are read here only.
 */

import { resolveBootstrapEnvironment } from '../../config/environment.config';

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

/**
 * Whether the current environment tolerates skipping the anti-bot check. Reuses the
 * package's canonical resolver (case-normalised, validated — single source of truth for
 * "what is the environment") when any env var is declared; with none at all it assumes
 * production so an undeclared deploy still fails closed.
 */
const isBotCheckBypassAllowed = (): boolean => {
  const declared = Boolean(
    process.env.APP_ENV?.trim() || process.env.NODE_ENV?.trim(),
  );
  const appEnv = declared ? resolveBootstrapEnvironment().appEnv : 'production';
  return appEnv === 'development' || appEnv === 'test';
};

/** Build the config from `process.env` (factory for the `FAQ_BOT_CONFIG` provider). */
export const faqBotConfig = (): FaqBotConfig => {
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
    // Trimmed so a whitespace-only secret (secrets-UI copy-paste slip) reads
    // as missing and hits the fail-closed guards instead of an opaque
    // altcha-lib DataError deep inside challenge issuance/verification.
    altchaHmacKey: process.env.ALTCHA_HMAC_KEY?.trim() ?? '',
    botCheckBypassAllowed: isBotCheckBypassAllowed(),
  };
};
