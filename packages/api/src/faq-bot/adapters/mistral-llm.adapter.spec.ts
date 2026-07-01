import { Logger } from '@nestjs/common';

import { FaqBotConfig } from '../config/faq-bot.config';
import { LlmRequest } from '../ports/llm.port';
import { MistralLlmAdapter } from './mistral-llm.adapter';

const REQUEST: LlmRequest = {
  system: 'sys',
  user: 'usr',
  maxTokens: 400,
  temperature: 0.3,
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

describe('MistralLlmAdapter', () => {
  let fetchMock: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('maps a successful completion to an LlmResult and sends the right request (happy)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: 'Salut, curieux !' } }],
          usage: { prompt_tokens: 42, completion_tokens: 7 },
        }),
    });
    const adapter = new MistralLlmAdapter(makeConfig());

    const result = await adapter.complete(REQUEST);

    expect(result).toEqual({
      text: 'Salut, curieux !',
      promptTokens: 42,
      completionTokens: 7,
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('api.mistral.ai');
    const body = JSON.parse(init.body as string) as {
      model: string;
      messages: unknown;
    };
    expect(body.model).toBe('mistral-small-latest');
    expect(body.messages).toEqual([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'usr' },
    ]);
  });

  it('fails fast without calling upstream when the API key is unset (sad)', async () => {
    const adapter = new MistralLlmAdapter(makeConfig({ mistralApiKey: '' }));

    await expect(adapter.complete(REQUEST)).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws on a non-2xx upstream response (sad)', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });
    const adapter = new MistralLlmAdapter(makeConfig());

    await expect(adapter.complete(REQUEST)).rejects.toThrow();
  });

  it('throws on an empty completion (edge)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ choices: [] }),
    });
    const adapter = new MistralLlmAdapter(makeConfig());

    await expect(adapter.complete(REQUEST)).rejects.toThrow();
  });

  it('never logs the API key nor the question (no secret / PII in logs — invariant)', async () => {
    const warnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: () => Promise.resolve({}),
    });
    const adapter = new MistralLlmAdapter(
      makeConfig({ mistralApiKey: 'super-secret-key' }),
    );

    await expect(
      adapter.complete({
        ...REQUEST,
        user: 'contact me at jane.doe@example.com',
      }),
    ).rejects.toThrow();

    const logged = warnSpy.mock.calls.flat().join(' ');
    expect(logged).not.toContain('super-secret-key');
    expect(logged).not.toContain('jane.doe@example.com');
  });
});
