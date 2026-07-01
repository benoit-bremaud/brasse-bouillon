/**
 * DIP seam for the anti-bot provider (ALTCHA in v1, self-hosted).
 *
 * The `BotCheckGuard` depends on this port, never on `altcha-lib` directly.
 * `FaqBotModule` binds it to `AltchaBotCheckAdapter`; unit tests inject a fake.
 * Keeping the seam lets us swap to a stronger anti-bot later without touching the guard.
 * See ADR-0022 (EU-sovereign, no third-party call).
 */

/**
 * Proof-of-work challenge served to the widget. Shape mirrors the ALTCHA challenge JSON
 * (the widget solves it client-side); the service returns it verbatim from `GET /challenge`.
 */
export interface BotChallenge {
  readonly algorithm: string;
  readonly challenge: string;
  readonly maxnumber: number;
  readonly salt: string;
  readonly signature: string;
}

/** The seam the guard and service talk to. Implemented by `AltchaBotCheckAdapter`. */
export interface BotCheckPort {
  /** Issue a fresh challenge (signed server-side with our HMAC secret). */
  issueChallenge(): Promise<BotChallenge>;
  /** Verify the solved payload the widget submits. Returns `true` when it is valid. */
  verify(payload: string): Promise<boolean>;
}

/** Injection token — interfaces have no runtime representation for Nest DI. */
export const BOT_CHECK_PORT = Symbol('BotCheckPort');
