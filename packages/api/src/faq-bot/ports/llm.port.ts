/**
 * DIP seam for the LLM provider.
 *
 * The FAQ-bot service depends on this port, never on Mistral (or any concrete SDK).
 * `FaqBotModule` binds it to `MistralLlmAdapter`; unit tests inject a fake implementation.
 * Swapping provider = a new adapter, no change to the service. See ADR-0022 / ADR-0002.
 */

/** One-shot completion request assembled by the service (system + user prompt). */
export interface LlmRequest {
  readonly system: string;
  readonly user: string;
  readonly maxTokens: number;
  readonly temperature: number;
}

/** Provider-agnostic completion result: the answer text plus token usage for metrics. */
export interface LlmResult {
  readonly text: string;
  readonly promptTokens: number;
  readonly completionTokens: number;
}

/** The seam the service talks to. Implemented by `MistralLlmAdapter`. */
export interface LlmPort {
  complete(request: LlmRequest): Promise<LlmResult>;
}

/** Injection token — interfaces have no runtime representation for Nest DI. */
export const LLM_PORT = Symbol('LlmPort');
