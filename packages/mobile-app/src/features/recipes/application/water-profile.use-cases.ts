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

/** Tone of the freshness pastille — maps 1:1 to the UI `Badge` variants. */
export type WaterFreshnessTone = "success" | "warning" | "neutral";

/** Display model for the dated freshness pastille (ADR-0025 slice 2). */
export interface WaterFreshnessDisplay {
  readonly tone: WaterFreshnessTone;
  readonly label: string;
  /** The sampling date as `JJ/MM/AAAA`. */
  readonly dateLabel: string;
}

const RECENT_MAX_MONTHS = 6;
const AGEING_MAX_MONTHS = 24;

/**
 * Maps the backend `freshnessDate` (`YYYY-MM-DD`, max date_prelevement) to a
 * dated pastille: green « Récent » (< 6 months), orange « À confirmer »
 * (6–24 months), grey « Ancien » (> 24 months). Pure — `now` is injected so the
 * age is testable. Returns null when there is no usable date (or the date is in
 * the future — clock skew or a bad backend max date), so the panel falls back to
 * the year-granular freshness line rather than fabricate a reassuring age.
 */
export function describeWaterFreshness(
  freshnessDate: string | null,
  now: Date,
): WaterFreshnessDisplay | null {
  const parsed = parseIsoDate(freshnessDate);
  if (!parsed) {
    return null;
  }

  const months = completedMonthsBetween(parsed, now);
  // A future sampling date is anomalous — never render it as a reassuring
  // « Récent » (ADR-0025 forbids anomalies reading as a legitimate state).
  if (months < 0) {
    return null;
  }
  if (months < RECENT_MAX_MONTHS) {
    return {
      tone: "success",
      label: "Récent",
      dateLabel: formatFrDate(parsed),
    };
  }
  if (months <= AGEING_MAX_MONTHS) {
    // Inclusive of 24 months — grey « Ancien » is strictly > 24 months.
    return {
      tone: "warning",
      label: "À confirmer",
      dateLabel: formatFrDate(parsed),
    };
  }
  return { tone: "neutral", label: "Ancien", dateLabel: formatFrDate(parsed) };
}

/** Parses a strict `YYYY-MM-DD` date to a local Date, or null if malformed. */
function parseIsoDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const [year, month, day] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
  const date = new Date(year, month - 1, day);
  // Reject impossible dates that JS would roll over (e.g. 2024-02-31).
  const valid =
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day;
  return valid ? date : null;
}

/**
 * Whole months elapsed from `from` to `now` (negative if `from` is in the
 * future). Local-time arithmetic on purpose (matches `parseIsoDate`'s local
 * `Date`); do NOT switch to `Date.UTC`, which would drift by a day at DST edges.
 */
function completedMonthsBetween(from: Date, now: Date): number {
  const months =
    (now.getFullYear() - from.getFullYear()) * 12 +
    (now.getMonth() - from.getMonth()) -
    (now.getDate() < from.getDate() ? 1 : 0);
  return months;
}

function formatFrDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}
