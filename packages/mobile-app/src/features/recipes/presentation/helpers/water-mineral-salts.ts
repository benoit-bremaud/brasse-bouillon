import type { WATER_METRIC_LABELS } from "@/features/recipes/presentation/recipe-details.utils";

type WaterMineralKey = keyof typeof WATER_METRIC_LABELS;

type WaterProfileLike = Readonly<Record<WaterMineralKey, number>>;

export type WaterSaltAdditionId = "caso4" | "cacl2" | "nacl";

export type WaterSaltAddition = Readonly<{
  id: WaterSaltAdditionId;
  name: string;
  formula: string;
  grams: number;
  rationale: string;
}>;

/**
 * Computes the practical brewing salts a brewer would add to push a
 * baseline water profile toward a target profile, scaled by batch
 * volume.
 *
 * The model intentionally stays brewer-pragmatic, not lab-grade:
 * - Gypsum (CaSO4·2H2O) covers the calcium + sulfate gap (drives the
 *   classic "hop-forward" character; ~232 ppm Ca and 558 ppm SO4 per
 *   gram per litre).
 * - Calcium chloride (CaCl2·2H2O) covers the chloride gap when SO4
 *   is already on target (rounder, malt-forward profile; ~272 ppm Ca
 *   and ~482 ppm Cl per gram per litre).
 * - Table salt (NaCl) covers a residual sodium + chloride gap when
 *   the chloride deficit is larger than calcium chloride alone can
 *   close (ions in proportion ~393 ppm Na and ~607 ppm Cl per gram
 *   per litre).
 *
 * Negative deltas (the user already has more of a mineral than the
 * recipe needs) are not addressable via additions — those require
 * dilution / reverse-osmosis, which is out of scope for v0.1.
 *
 * The numeric coefficients below are the conventional brewing-water
 * tables (see Palmer, "Water — A Comprehensive Guide for Brewers").
 * They produce ppm increases for one gram of salt dissolved into one
 * litre of water; we divide by `volumeLiters` to keep the maths
 * explicit when scaling to a real batch.
 */
const PPM_PER_GRAM_PER_LITRE = {
  gypsum: { ca: 232, so4: 558 },
  calciumChloride: { ca: 272, cl: 482 },
  tableSalt: { na: 393, cl: 607 },
} as const;

export function computeWaterSaltAdditions(
  target: WaterProfileLike,
  current: WaterProfileLike,
  volumeLiters: number,
): WaterSaltAddition[] {
  if (!Number.isFinite(volumeLiters) || volumeLiters <= 0) {
    return [];
  }

  const deltaCa = Math.max(0, target.ca - current.ca);
  const deltaSo4 = Math.max(0, target.so4 - current.so4);
  const deltaCl = Math.max(0, target.cl - current.cl);

  // Gypsum covers Ca + SO4 first; cap by whichever ion limits.
  const gypsumByCa =
    (deltaCa / PPM_PER_GRAM_PER_LITRE.gypsum.ca) * volumeLiters;
  const gypsumBySo4 =
    (deltaSo4 / PPM_PER_GRAM_PER_LITRE.gypsum.so4) * volumeLiters;
  const gypsumGrams = Math.min(gypsumByCa, gypsumBySo4);

  // Re-derive how much Ca + Cl we still need after the gypsum addition.
  const caUsedByGypsum =
    (gypsumGrams / volumeLiters) * PPM_PER_GRAM_PER_LITRE.gypsum.ca;
  const remainingDeltaCa = Math.max(0, deltaCa - caUsedByGypsum);

  // Calcium chloride covers the residual Ca and dent the Cl gap.
  const ccByCa =
    (remainingDeltaCa / PPM_PER_GRAM_PER_LITRE.calciumChloride.ca) *
    volumeLiters;
  const ccByCl =
    (deltaCl / PPM_PER_GRAM_PER_LITRE.calciumChloride.cl) * volumeLiters;
  const calciumChlorideGrams = Math.min(ccByCa, ccByCl);
  const clUsedByCc =
    (calciumChlorideGrams / volumeLiters) *
    PPM_PER_GRAM_PER_LITRE.calciumChloride.cl;
  const remainingDeltaCl = Math.max(0, deltaCl - clUsedByCc);

  // Table salt cleans up the remaining chloride gap (Na is incidental).
  const tableSaltGrams =
    (remainingDeltaCl / PPM_PER_GRAM_PER_LITRE.tableSalt.cl) * volumeLiters;

  const additions: WaterSaltAddition[] = [
    {
      id: "caso4",
      name: "Sulfate de calcium",
      formula: "CaSO₄ (gypse)",
      grams: roundGrams(gypsumGrams),
      rationale: "Ajoute Ca + SO4 pour le profil hop-forward.",
    },
    {
      id: "cacl2",
      name: "Chlorure de calcium",
      formula: "CaCl₂",
      grams: roundGrams(calciumChlorideGrams),
      rationale: "Ajoute Ca + Cl pour un profil plus malt-forward.",
    },
    {
      id: "nacl",
      name: "Sel de table",
      formula: "NaCl",
      grams: roundGrams(tableSaltGrams),
      rationale: "Complète le chlorure si nécessaire (peu de sodium).",
    },
  ];

  return additions.filter((addition) => addition.grams > 0);
}

function roundGrams(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.round(value * 10) / 10;
}
