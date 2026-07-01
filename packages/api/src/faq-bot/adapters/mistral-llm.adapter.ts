import { Inject, Injectable, Logger } from '@nestjs/common';

import { FAQ_BOT_CONFIG, type FaqBotConfig } from '../config/faq-bot.config';
import type { LlmPort, LlmRequest, LlmResult } from '../ports/llm.port';

/** Mistral chat completions endpoint (EU). Key travels only in this adapter (ADR-0002). */
const MISTRAL_CHAT_URL = 'https://api.mistral.ai/v1/chat/completions';

/** Minimal slice of the Mistral response we consume. */
interface MistralChatResponse {
  readonly choices?: ReadonlyArray<{
    readonly message?: { readonly content?: unknown };
  }>;
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
  };
}

/**
 * `LlmPort` implementation that calls the Mistral REST API with native `fetch` + an
 * `AbortController` timeout (repo convention, cf. `scan/services/openfoodfacts.client.ts`).
 * The API key is used **only** here and is never logged. Any transport/upstream failure throws;
 * the service turns it into a graceful `FaqBotUnavailableException` (503).
 */
@Injectable()
export class MistralLlmAdapter implements LlmPort {
  private readonly logger = new Logger(MistralLlmAdapter.name);

  constructor(@Inject(FAQ_BOT_CONFIG) private readonly config: FaqBotConfig) {}

  async complete(request: LlmRequest): Promise<LlmResult> {
    if (!this.config.mistralApiKey) {
      // Fail fast on misconfiguration: avoid a guaranteed 401 round-trip to the paid
      // endpoint. The service maps this to a graceful `FaqBotUnavailableException` (503).
      throw new Error('Mistral API key is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await fetch(MISTRAL_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.config.mistralApiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          messages: [
            { role: 'system', content: request.system },
            { role: 'user', content: request.user },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        // Log the status only — never the key, prompt, or question (RGPD, ADR-0022).
        this.logger.warn(`Mistral upstream error: HTTP ${response.status}`);
        throw new Error(`Mistral upstream error: HTTP ${response.status}`);
      }

      const payload = (await response.json()) as MistralChatResponse;
      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || content.length === 0) {
        throw new Error('Mistral returned an empty completion');
      }

      return {
        text: content,
        promptTokens: payload.usage?.prompt_tokens ?? 0,
        completionTokens: payload.usage?.completion_tokens ?? 0,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}
