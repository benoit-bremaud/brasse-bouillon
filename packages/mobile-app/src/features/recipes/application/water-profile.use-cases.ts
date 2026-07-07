import { HttpError } from "@/core/http/http-error";
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
 * Loads the local water profile for a resolved commune, trying the current year
 * first and falling back to the previous one on a not-found. Hub'Eau lags
 * ~6 weeks, so the in-progress year is often empty (a 404) even where fresh
 * prior-year data exists — the fallback keeps the freshest *available* year
 * instead of dead-ending on "no data". A genuine miss (both years 404) rethrows.
 */
export async function loadWaterProfile(
  codeInsee: string,
  signal?: AbortSignal,
): Promise<LiveWaterProfile> {
  const currentYear = new Date().getFullYear();
  try {
    return await getLiveWaterProfile(codeInsee, currentYear, signal);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return getLiveWaterProfile(codeInsee, currentYear - 1, signal);
    }
    throw error;
  }
}
