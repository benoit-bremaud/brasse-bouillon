/**
 * Domain types for fermentation gravity measurements (B2 — US-0404).
 *
 * Type-only module: it carries the shape of a {@link Measurement} and its
 * creation payload {@link MeasurementInput}, with no runtime logic, so the
 * domain layer never imports the data or presentation layers (Clean
 * Architecture dependency rule).
 *
 * Brewing vocabulary (BeerXML / BJCP): a measurement records a specific
 * gravity reading (e.g. `1.050`) against a batch. The two readings the B2
 * UI exposes are the **original gravity (OG — densité initiale)** taken at
 * fermentation start and the **final gravity (FG — densité finale)** taken at
 * the end; the remaining types mirror the backend contract for completeness.
 */

/**
 * Kind of measurement, mirroring the backend `type` enum.
 *
 * - `og` — original gravity (densité initiale), at fermentation start.
 * - `fg` — final gravity (densité finale), at fermentation end.
 * - `sg_spot` — interim specific-gravity spot reading (deferred from the B2 UI).
 * - `temperature` — fermentation temperature (not exposed by the B2 UI).
 * - `ph` — wort/beer pH (not exposed by the B2 UI).
 */
export type MeasurementType = "og" | "fg" | "sg_spot" | "temperature" | "ph";

/**
 * A persisted fermentation measurement, in the app's camelCase domain shape.
 */
export interface Measurement {
  /** Server-assigned unique identifier. */
  id: string;
  /** Identifier of the batch this measurement belongs to. */
  batchId: string;
  /**
   * Order of the batch step this reading is attached to, or `null` when the
   * reading is not tied to a specific step.
   */
  stepOrder: number | null;
  /** Kind of measurement (see {@link MeasurementType}). */
  type: MeasurementType;
  /** Numeric reading — a specific gravity (e.g. `1.050`) for `og`/`fg`/`sg_spot`. */
  value: number;
  /** Optional unit label (e.g. `°C` for temperature), or `null` for gravity. */
  unit: string | null;
  /** ISO-8601 timestamp of when the reading was physically taken. */
  takenAt: string;
  /** ISO-8601 timestamp of when the record was created server-side. */
  createdAt: string;
}

/**
 * Payload to create a measurement. `takenAt` is optional: when omitted the
 * backend defaults it to the request time.
 */
export interface MeasurementInput {
  /** Kind of measurement to record. */
  type: MeasurementType;
  /** Numeric reading (specific gravity for OG/FG, e.g. `1.050`). */
  value: number;
  /** Optional ISO-8601 timestamp of when the reading was taken. */
  takenAt?: string;
}
