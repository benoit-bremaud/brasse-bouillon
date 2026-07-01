import { createChallenge, solveChallenge } from 'altcha-lib/v1';

import { FaqBotConfig } from '../config/faq-bot.config';
import { AltchaBotCheckAdapter } from './altcha-bot-check.adapter';

const HMAC = 'test-hmac-secret';

function makeConfig(altchaHmacKey = HMAC): FaqBotConfig {
  return {
    mistralApiKey: '',
    model: 'mistral-small-latest',
    timeoutMs: 8_000,
    maxAnswerTokens: 400,
    enabled: true,
    monthlyBudgetEur: 20,
    altchaHmacKey,
  };
}

/** Create + solve a small challenge and encode it as the base64 payload the widget submits. */
async function solvedPayload(hmacKey: string): Promise<string> {
  const challenge = await createChallenge({ hmacKey, maxnumber: 2_000 });
  const { promise } = solveChallenge(
    challenge.challenge,
    challenge.salt,
    challenge.algorithm,
    challenge.maxnumber,
  );
  const solution = await promise;
  if (!solution) {
    throw new Error('challenge unexpectedly unsolved');
  }
  const payload = {
    algorithm: challenge.algorithm,
    challenge: challenge.challenge,
    number: solution.number,
    salt: challenge.salt,
    signature: challenge.signature,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

describe('AltchaBotCheckAdapter', () => {
  it('issues a well-formed challenge (happy)', async () => {
    const adapter = new AltchaBotCheckAdapter(makeConfig());

    const challenge = await adapter.issueChallenge();

    expect(challenge.algorithm).toBeTruthy();
    expect(challenge.challenge.length).toBeGreaterThan(0);
    expect(challenge.salt.length).toBeGreaterThan(0);
    expect(challenge.signature.length).toBeGreaterThan(0);
    expect(challenge.maxnumber).toBeGreaterThan(0);
  });

  it('verifies a correctly solved payload (happy)', async () => {
    const adapter = new AltchaBotCheckAdapter(makeConfig());

    await expect(adapter.verify(await solvedPayload(HMAC))).resolves.toBe(true);
  });

  it('rejects a forged / unparseable payload (sad)', async () => {
    const adapter = new AltchaBotCheckAdapter(makeConfig());

    await expect(adapter.verify('not-a-valid-payload')).resolves.toBe(false);
  });

  it('rejects a payload solved under a different HMAC key (sad)', async () => {
    const adapter = new AltchaBotCheckAdapter(makeConfig());

    await expect(
      adapter.verify(await solvedPayload('another-key')),
    ).resolves.toBe(false);
  });
});
