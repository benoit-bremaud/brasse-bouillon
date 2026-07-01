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
      return await verifySolution(payload, this.config.altchaHmacKey);
    } catch {
      // Malformed / unparseable payloads are simply invalid — never throw to the guard.
      return false;
    }
  }
}
