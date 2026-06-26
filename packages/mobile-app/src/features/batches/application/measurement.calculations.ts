/**
 * Pure, framework-free brewing calculations for fermentation measurements
 * (B2 — US-0404). No I/O, no UI imports: safe to call from the presentation
 * layer and trivially unit-testable.
 */

/**
 * Standard ABV multiplier for the specific-gravity formula
 * `ABV = (OG - FG) * 131.25` (BJCP/homebrew convention).
 */
const ABV_FACTOR = 131.25;

/**
 * Computes the alcohol by volume (ABV, in % vol) from the original and final
 * specific gravities, rounded to one decimal.
 *
 * Formula (homebrew standard): `ABV = (OG - FG) * 131.25`.
 *
 * @param og - Original gravity / densité initiale (e.g. `1.050`).
 * @param fg - Final gravity / densité finale (e.g. `1.010`).
 * @returns The ABV in % vol, rounded to one decimal (e.g. `5.3`).
 */
export function computeAbv(og: number, fg: number): number {
  const abv = (og - fg) * ABV_FACTOR;
  return Math.round(abv * 10) / 10;
}

/**
 * Result of validating a final-gravity entry against its original gravity.
 *
 * Discriminated on `valid` so the presentation layer can narrow to the
 * `message` only when the entry is rejected.
 */
export type FinalGravityValidation =
  | { valid: true }
  | { valid: false; message: string };

/**
 * Plain-French explanation shown when a final gravity is not strictly below
 * the original gravity (an implausible reading the brewer must re-check).
 */
export const FINAL_GRAVITY_TOO_HIGH_MESSAGE =
  "La densité finale doit être plus basse que la densité initiale : " +
  "la fermentation consomme du sucre, donc la densité descend. " +
  "Vérifie ta lecture (au densimètre, FG est typiquement autour de 1.010).";

/**
 * Validates a final-gravity reading client-side: FG must be strictly lower
 * than OG, since fermentation can only lower the gravity. This guard is
 * distinct from the API's specific-gravity range guard `[0.99, 1.2]`.
 *
 * @param og - Original gravity already recorded for the batch.
 * @param fg - Candidate final gravity entered by the brewer.
 * @returns A {@link FinalGravityValidation} — valid, or invalid with a
 *   plain-French explanation.
 */
export function validateFinalGravity(
  og: number,
  fg: number,
): FinalGravityValidation {
  if (fg >= og) {
    return { valid: false, message: FINAL_GRAVITY_TOO_HIGH_MESSAGE };
  }
  return { valid: true };
}
