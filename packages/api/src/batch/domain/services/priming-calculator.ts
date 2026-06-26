/**
 * PrimingCalculator (B3) — pure, stateless priming-sugar domain service.
 *
 * Bottle conditioning carbonates the beer by feeding the remaining yeast a
 * measured dose of fermentable sugar. Too little = flat beer; **too much =
 * over-pressure = a bottle can literally explode**. This service computes the
 * beginner-safe dose for a given beer volume; it never sources the volume
 * itself (the volume comes from the batch / recipe, per ADR-0020).
 *
 * Two modes (KISS, ADR-0001):
 * - `computeSimplePriming` — the zero-input default: a flat ~6.5 g/L of table
 *   sugar for a friendly ~2.4 CO2 volumes. This is what a novice gets.
 * - `computePrecisePriming` — the advanced option: the standard residual-CO2
 *   formula taking a target CO2 volume and the beer temperature into account.
 *
 * No entity, no state — trivially unit-testable.
 */

/** Default simple dose, in grams of table sugar per litre of beer. */
export const DEFAULT_G_PER_L = 6.5;

/** Default target carbonation, in volumes of CO2 (friendly for most styles). */
export const DEFAULT_TARGET_CO2_VOL = 2.4;

/**
 * Grams of sucrose per litre needed to raise carbonation by one CO2 volume.
 * Used by the precise formula once the residual CO2 is subtracted.
 */
export const SUCROSE_G_PER_L_PER_VOL = 4.13;

/**
 * Priming sugar type. Table sugar (sucrose) is the beginner default; dextrose
 * is the advanced alternative. v1 computes doses against sucrose; the enum is
 * carried on the result so the mobile app can label the dose correctly.
 */
export enum SugarType {
  TABLE_SUGAR = 'table_sugar',
  DEXTROSE = 'dextrose',
}

/**
 * Safety warning surfaced with every priming result (French — shown to the
 * brewer). Over-priming is the only real physical danger of the novice
 * journey: exceeding the dose builds excess pressure and a bottle can burst,
 * which is an eye-injury hazard. Weigh the sugar; do not improvise.
 */
export const SAFETY_WARNING =
  'Sécurité : ne dépassez jamais la dose de sucre indiquée. Un sur-sucrage ' +
  'crée une surpression dans la bouteille qui peut la faire EXPLOSER ' +
  '(danger pour les yeux). Pesez le sucre à la balance, ne dosez jamais à ' +
  "l'œil et n'improvisez pas.";

/** Result of a priming computation (value object served by GET /priming). */
export interface PrimingResult {
  sugarGrams: number;
  sugarType: SugarType;
  targetCo2Vol: number;
  volumeL: number;
}

/** Round to a fixed number of decimals without floating-point drift. */
function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function assertVolume(volumeL: number): void {
  if (!Number.isFinite(volumeL) || volumeL < 0) {
    throw new Error('volumeL must be a non-negative finite number');
  }
}

/**
 * Simple priming — the zero-input default. A flat `DEFAULT_G_PER_L` of table
 * sugar for `DEFAULT_TARGET_CO2_VOL` CO2 volumes.
 *
 * @param volumeL beer volume to bottle, in litres (from the recipe, ADR-0020)
 * @returns the priming result (table sugar, ~2.4 CO2 vol)
 */
export function computeSimplePriming(volumeL: number): PrimingResult {
  assertVolume(volumeL);
  return {
    sugarGrams: round(volumeL * DEFAULT_G_PER_L, 1),
    sugarType: SugarType.TABLE_SUGAR,
    targetCo2Vol: DEFAULT_TARGET_CO2_VOL,
    volumeL,
  };
}

/**
 * Precise priming — the advanced option. Subtracts the CO2 the beer already
 * holds (a function of its temperature) from the target, then sizes the sucrose
 * dose for the remaining volumes.
 *
 * Residual CO2 (volumes) = 3.0378 − 0.050062·Tf + 0.00026555·Tf², Tf in °F.
 * The remaining carbonation is clamped at 0 (never a negative dose).
 *
 * @param volumeL beer volume to bottle, in litres (from the recipe, ADR-0020)
 * @param targetCo2Vol desired carbonation, in CO2 volumes
 * @param beerTempC current beer temperature, in °C
 * @returns the priming result (table sugar, at the requested CO2 vol)
 */
export function computePrecisePriming(
  volumeL: number,
  targetCo2Vol: number,
  beerTempC: number,
): PrimingResult {
  assertVolume(volumeL);
  if (!Number.isFinite(targetCo2Vol) || targetCo2Vol < 0) {
    throw new Error('targetCo2Vol must be a non-negative finite number');
  }
  if (!Number.isFinite(beerTempC)) {
    throw new Error('beerTempC must be a finite number');
  }

  const tempF = beerTempC * (9 / 5) + 32;
  const residualVols = 3.0378 - 0.050062 * tempF + 0.00026555 * tempF * tempF;
  const remainingVols = Math.max(0, targetCo2Vol - residualVols);

  return {
    sugarGrams: round(volumeL * SUCROSE_G_PER_L_PER_VOL * remainingVols, 1),
    sugarType: SugarType.TABLE_SUGAR,
    targetCo2Vol,
    volumeL,
  };
}
