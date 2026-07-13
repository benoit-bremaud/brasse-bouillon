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
  /**
   * Language lock appended to the user turn RIGHT AFTER the visitor question — not (only)
   * stated in the system prompt. A/B-benched against the real `mistral-small` (2026-07-13,
   * 12 EN + 4 FR runs per variant): system-prompt language rules — even repeated as a final
   * reminder — scored 0/12 on English questions, while this adjacent directive scored 12/12
   * with the French control unaffected (4/4). Small models only reliably obey instructions
   * adjacent to the text they answer. Versioned in `language-directive.md` (prompt-as-spec,
   * ADR-0022); bench methodology in `../evals/AGENT.md`.
   */
  readonly languageDirective: string;
}

/** Injection token for `FaqBotPrompts`. */
export const FAQ_BOT_PROMPTS = Symbol('FaqBotPrompts');
