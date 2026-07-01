import { Injectable } from '@nestjs/common';

/**
 * In-memory, anonymous metrics for the FAQ bot (ADR-0022 / RGPD).
 *
 * Counters only — **no conversation content is ever stored**. v1 records aggregate
 * answer/token/error counts and a best-effort spend estimate. Abstention-rate and
 * top-questions (per-chip) are deferred to v2: they need a reliable abstain sentinel
 * and a chip-id channel, neither of which exists in v1 (see ADR-0022 § Observability).
 * Process-local and best-effort in v1 (persisted in v2).
 */

/** Blended EUR per 1M tokens for the small model — used only for the best-effort budget guard. */
const EUR_PER_MILLION_TOKENS = 0.3;

export interface MetricsSnapshot {
  readonly answers: number;
  readonly errors: number;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly estimatedMonthlyEur: number;
}

@Injectable()
export class FaqBotMetrics {
  private answers = 0;
  private errors = 0;
  private promptTokens = 0;
  private completionTokens = 0;

  recordAnswer(promptTokens: number, completionTokens: number): void {
    this.answers += 1;
    this.promptTokens += promptTokens;
    this.completionTokens += completionTokens;
  }

  recordError(): void {
    this.errors += 1;
  }

  /** Best-effort estimated spend since process start (v1 budget guard). */
  estimatedMonthlyEur(): number {
    return (
      ((this.promptTokens + this.completionTokens) / 1_000_000) *
      EUR_PER_MILLION_TOKENS
    );
  }

  snapshot(): MetricsSnapshot {
    return {
      answers: this.answers,
      errors: this.errors,
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      estimatedMonthlyEur: this.estimatedMonthlyEur(),
    };
  }
}
