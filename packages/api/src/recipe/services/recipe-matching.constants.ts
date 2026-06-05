/**
 * Acceptance thresholds for recipe-matching v2 (ADR-0016 D5).
 *
 * A candidate recipe is shown only when its match strength **and** its
 * completeness both clear these bars — otherwise the section renders an honest
 * "no reliable equivalent" empty state rather than a misleading closest match.
 *
 * Both are env-tunable (calibrate on real OpenFoodFacts coverage); the defaults
 * are a starting point. Parsing mirrors the `water.config` convention: an
 * out-of-range or non-numeric value falls back to the default rather than
 * throwing.
 */

const DEFAULT_S_MIN = 45; // on the 0..100 match-strength scale
const DEFAULT_C_MIN = 0.5; // on the 0..1 completeness scale

const parseBoundedNumber = (
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return fallback;
  }
  return parsed;
};

/** Minimum match strength (0..100) for a candidate to be shown. */
export const SCAN_MATCH_S_MIN = parseBoundedNumber(
  process.env.SCAN_MATCH_S_MIN,
  DEFAULT_S_MIN,
  0,
  100,
);

/** Minimum completeness ratio (0..1) for a candidate to be shown. */
export const SCAN_MATCH_C_MIN = parseBoundedNumber(
  process.env.SCAN_MATCH_C_MIN,
  DEFAULT_C_MIN,
  0,
  1,
);
