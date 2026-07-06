import {
  getCommunesByPostalCode,
  getLiveWaterProfile,
} from "@/features/recipes/data/water-profile.api";

import type {
  Commune,
  LiveWaterProfile,
} from "@/features/recipes/domain/water-profile.types";

/** French metropolitan + DROM postal codes are 5 digits. */
export function isValidPostalCode(postalCode: string): boolean {
  return /^\d{5}$/.test(postalCode.trim());
}

/**
 * Resolves a postal code to its candidate communes. Returns `[]` for an unknown
 * postal code (the UI surfaces an "unknown postal code" state); the caller
 * disambiguates when more than one commune is returned.
 */
export async function resolveCommunes(
  postalCode: string,
  signal?: AbortSignal,
): Promise<Commune[]> {
  return getCommunesByPostalCode(postalCode.trim(), signal);
}

/**
 * Loads the local water profile for a resolved commune. `year` defaults to the
 * current calendar year (most communes publish within it); an empty year yields
 * a backend not-found the UI renders as "no data".
 */
export async function loadWaterProfile(
  codeInsee: string,
  year: number,
  signal?: AbortSignal,
): Promise<LiveWaterProfile> {
  return getLiveWaterProfile(codeInsee, year, signal);
}
