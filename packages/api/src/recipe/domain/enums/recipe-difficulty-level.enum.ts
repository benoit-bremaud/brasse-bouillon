/**
 * Brewing-difficulty level of a recipe (how hard it is to brew), distinct from
 * the user's declared skill level. Computed by the backend from objective recipe
 * signals and optionally overridden by the author. See ADR-0024 and
 * `docs/architecture/specs/recipe-difficulty-algorithm.md`.
 */
export enum RecipeDifficultyLevel {
  /** Green — accessible to a first-time brewer. */
  FACILE = 'facile',
  /** Amber — a step up; reachable after a first brew. */
  INTERMEDIAIRE = 'intermediaire',
  /** Red — demanding (cold/wild fermentation, high gravity, exacting styles…). */
  AVANCE = 'avance',
}
