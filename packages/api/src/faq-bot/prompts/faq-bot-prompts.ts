/**
 * Injected prompt material for the service (decoupled from storage).
 *
 * The service depends on this shape, not on how the text is loaded. `FaqBotModule` provides
 * the concrete strings (from the versioned prompt sources); unit tests inject fakes. This keeps
 * the service testable and independent of the build's asset handling.
 */
export interface FaqBotPrompts {
  /** Persona + guardrails (grown by the eval harness). */
  readonly system: string;
  /** Curated project facts appended to the user turn (manually maintained, no RAG in v1). */
  readonly context: string;
}

/** Injection token for `FaqBotPrompts`. */
export const FAQ_BOT_PROMPTS = Symbol('FaqBotPrompts');
