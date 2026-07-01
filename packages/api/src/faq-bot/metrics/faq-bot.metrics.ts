import { Injectable } from '@nestjs/common';

/**
 * In-memory, anonymous metrics for the FAQ bot (ADR-0022 / RGPD).
 *
 * Counters only — **no conversation content is ever stored**. "Top questions" are limited to
 * the predefined widget chips (safe, no free-text). Free-text questions are counted in
 * aggregate via `recordAnswer` only. Process-local and best-effort in v1 (persisted in v2).
 */

/** Blended EUR per 1M tokens for the small model — used only for the best-effort budget guard. */
const EUR_PER_MILLION_TOKENS = 0.3;

export interface MetricsSnapshot {
  readonly answers: number;
  readonly abstentions: number;
  readonly errors: number;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly estimatedMonthlyEur: number;
  readonly chipCounts: Readonly<Record<string, number>>;
}

@Injectable()
export class FaqBotMetrics {
  private answers = 0;
  private abstentions = 0;
  private errors = 0;
  private promptTokens = 0;
  private completionTokens = 0;
  private readonly chipCounts = new Map<string, number>();

  recordAnswer(promptTokens: number, completionTokens: number): void {
    this.answers += 1;
    this.promptTokens += promptTokens;
    this.completionTokens += completionTokens;
  }

  recordAbstention(): void {
    this.abstentions += 1;
  }

  recordError(): void {
    this.errors += 1;
  }

  /** Count a predefined chip prompt (safe, no free-text). Unknown ids are ignored by the caller. */
  recordChip(chipId: string): void {
    this.chipCounts.set(chipId, (this.chipCounts.get(chipId) ?? 0) + 1);
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
      abstentions: this.abstentions,
      errors: this.errors,
      promptTokens: this.promptTokens,
      completionTokens: this.completionTokens,
      estimatedMonthlyEur: this.estimatedMonthlyEur(),
      chipCounts: Object.fromEntries(this.chipCounts),
    };
  }
}
