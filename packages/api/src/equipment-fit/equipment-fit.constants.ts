/**
 * Equipment capacity fit-check constants (ADR-0026).
 */

/**
 * Fraction of the fermenter's total volume reserved as headspace (krausen +
 * blow-off), subtracted before comparing to the recipe's batch volume:
 * `fermenterUsableL = fermenter_volume_l × (1 − HEADSPACE_RATIO)`.
 *
 * Defaulted to **0.10** — deliberately below the 20–25 % krausen norm so the
 * shipped guided first brew (`Blonde Facile`, `batch_size_l 4.3` in a 5 L
 * demijohn → usable 4.5 L) reads `FITS`, not `TOO_LARGE`. Per-style headspace is
 * a deferred refinement (ADR-0026 § Consequences). Calibratable constant, not a
 * per-profile field yet.
 */
export const HEADSPACE_RATIO = 0.1;
