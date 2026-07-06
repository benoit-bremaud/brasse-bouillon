/**
 * Types for the local tap-water lookup (water-profile epic, slice 1 — ADR-0025).
 * `Commune` comes from the sovereign geo.api.gouv.fr resolver; `LiveWaterProfile`
 * from the existing backend `GET /water`. The backend returns 5 ions (no sodium)
 * with nullable values, so every mineral is `number | null`.
 */

/** A commune resolved from a postal code (geo.api.gouv.fr). */
export interface Commune {
  /** INSEE code (`code`) — the exact key Hub'Eau / the backend `/water` uses. */
  readonly codeInsee: string;
  readonly nom: string;
  readonly codesPostaux: readonly string[];
}

/**
 * Hub'Eau sanitary-conformity verdict (ARS). `C` compliant, `N` non-compliant,
 * `D` regulatory derogation, `S` increased monitoring, `UNKNOWN` undetermined.
 */
export type WaterConformity = "C" | "N" | "D" | "S" | "UNKNOWN";

/** The 5 brewing ions the backend measures (mg/L). Sodium is not measured. */
export interface LiveWaterMinerals {
  readonly ca: number | null;
  readonly mg: number | null;
  readonly cl: number | null;
  readonly so4: number | null;
  readonly hco3: number | null;
}

/** Aggregated local water profile for a commune, from the backend `/water`. */
export interface LiveWaterProfile {
  readonly codeInsee: string;
  readonly year: number;
  readonly networkName: string | null;
  readonly sampleCount: number;
  readonly conformity: WaterConformity;
  readonly mineralsMgL: LiveWaterMinerals;
  readonly hardnessFrench: number | null;
}
