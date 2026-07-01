import { Inject, Injectable } from '@nestjs/common';
import { createChallenge, verifySolution } from 'altcha-lib/v1';

import { FAQ_BOT_CONFIG, type FaqBotConfig } from '../config/faq-bot.config';
import type { BotChallenge, BotCheckPort } from '../ports/bot-check.port';

/** Upper bound on the proof-of-work counter (client effort). Balanced for an invisible check. */
const MAX_NUMBER = 200_000;
/** Challenge validity window (ms). */
const EXPIRES_MS = 10 * 60 * 1_000;

/**
 * `BotCheckPort` implementation backed by the self-hosted `altcha-lib` (v1 challenge format,
 * widget-compatible). The challenge is created and the solution verified **in-process** with our
 * own HMAC secret — no third-party call, EU-sovereign (ADR-0022). This is the only file that
 * knows about ALTCHA; the guard and service depend on `BotCheckPort`, never on this adapter.
 */
@Injectable()
export class AltchaBotCheckAdapter implements BotCheckPort {
  /**
   * Challenges already spent, mapped to their eviction timestamp (ms). A solved proof is
   * single-use: replaying it before expiry is rejected so the proof-of-work is actually
   * paid per request. In-memory + best-effort (mono-instance, v1) — mirrors the monthly
   * budget counter. Entries are pruned `EXPIRES_MS` after consumption (a finite bound —
   * slightly wider than the proof's own signed expiry, which `verifySolution` enforces
   * anyway, so over-retention can only over-block a replay, never under-block).
   */
  private readonly consumed = new Map<string, number>();

  constructor(@Inject(FAQ_BOT_CONFIG) private readonly config: FaqBotConfig) {}

  async issueChallenge(): Promise<BotChallenge> {
    const challenge = await createChallenge({
      hmacKey: this.config.altchaHmacKey,
      maxnumber: MAX_NUMBER,
      expires: new Date(Date.now() + EXPIRES_MS),
    });
    return {
      algorithm: challenge.algorithm,
      challenge: challenge.challenge,
      maxnumber: challenge.maxnumber ?? MAX_NUMBER,
      salt: challenge.salt,
      signature: challenge.signature,
    };
  }

  async verify(payload: string): Promise<boolean> {
    try {
      if (!(await verifySolution(payload, this.config.altchaHmacKey))) {
        return false;
      }
      // Single-use: reject a proof whose challenge was already spent (replay defence).
      // INVARIANT: everything from here to `set` is synchronous (no await), so the
      // check-and-claim is atomic in the event loop — concurrent verifies of the same
      // proof cannot both pass (pinned by the concurrent-replay spec).
      const id = this.challengeId(payload);
      if (id === undefined) {
        return false;
      }
      const now = Date.now();
      this.pruneExpired(now);
      if (this.consumed.has(id)) {
        return false;
      }
      this.consumed.set(id, now + EXPIRES_MS);
      return true;
    } catch {
      // Malformed / unparseable payloads are simply invalid — never throw to the guard.
      return false;
    }
  }

  /**
   * Unique challenge string from the base64-JSON ALTCHA payload (dedup key for replay).
   * Throws on malformed base64/JSON — `verify`'s try/catch maps that to "invalid".
   */
  private challengeId(payload: string): string | undefined {
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64').toString('utf8'),
    ) as { challenge?: unknown };
    return typeof decoded.challenge === 'string'
      ? decoded.challenge
      : undefined;
  }

  /** Drop consumed entries past their expiry so the map stays bounded. */
  private pruneExpired(now: number): void {
    for (const [id, expiry] of this.consumed) {
      if (expiry <= now) {
        this.consumed.delete(id);
      }
    }
  }
}
