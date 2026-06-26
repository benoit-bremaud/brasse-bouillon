/**
 * Domain types for the B3 bottling / priming / tasting flow (US-04xx).
 *
 * Type-only module: it carries the camelCase mirrors of the backend B3 DTOs
 * ({@link PrimingInfo}, {@link Tasting}, {@link TastingInput}) with no runtime
 * logic, so the domain layer never imports the data or presentation layers
 * (Clean Architecture dependency rule).
 *
 * Brewing vocabulary: **priming** (réamorçage) is the controlled addition of
 * fermentable sugar at bottling time so the residual yeast re-carbonates the
 * beer in the bottle. Over-priming over-pressurises the bottle and can make it
 * explode — hence the prominent safety warning the backend ships in
 * {@link PrimingInfo.safetyWarning}.
 */

/**
 * Plain-French bottle-bomb safety warning, kept WORD-FOR-WORD identical to the
 * backend `SAFETY_WARNING` (priming-calculator.ts). The single mobile source of
 * truth: the demo priming path and the {@link import("../presentation/BottlingScreen")}
 * fallback both reference it so the wording never drifts. Rendered verbatim —
 * never paraphrased client-side.
 */
export const SAFETY_WARNING =
  "Sécurité : ne dépassez jamais la dose de sucre indiquée. Un sur-sucrage " +
  "crée une surpression dans la bouteille qui peut la faire EXPLOSER " +
  "(danger pour les yeux). Pesez le sucre à la balance, ne dosez jamais à " +
  "l'œil et n'improvisez pas.";

/**
 * Kind of priming sugar, mirroring the backend `sugar_type` enum.
 *
 * - `table_sugar` — saccharose (sucre de table), the novice default.
 * - `dextrose` — glucose monohydrate, common in homebrew kits.
 */
export type PrimingSugarType = "table_sugar" | "dextrose";

/**
 * Priming guidance computed by the backend for a batch (ADR-0020: the volume
 * always comes from the recipe — the calculator never sources it). The app's
 * camelCase mirror of the backend `PrimingDto`.
 */
export interface PrimingInfo {
  /** Grams of priming sugar to add, rounded to 1 decimal place. */
  sugarGrams: number;
  /** Kind of sugar the dose is computed for (see {@link PrimingSugarType}). */
  sugarType: PrimingSugarType;
  /** Target carbonation in CO2 volumes. */
  targetCo2Vol: number;
  /** Batch volume in litres, sourced from the recipe (`batch_size_l`). */
  volumeL: number;
  /**
   * Plain-French bottle-bomb safety warning shipped by the backend. Rendered
   * verbatim in a prominent banner — never paraphrased client-side.
   */
  safetyWarning: string;
}

/**
 * A persisted tasting note for a batch (one per batch in v1), in the app's
 * camelCase domain shape. Mirrors the backend `TastingDto`.
 */
export interface Tasting {
  /** Server-assigned unique identifier. */
  id: string;
  /** Identifier of the batch this tasting belongs to. */
  batchId: string;
  /** Star rating from 1 to 5 (integer). */
  rating: number;
  /** Free-text note, or `null` when none was recorded. */
  note: string | null;
  /** ISO-8601 timestamp of when the tasting was created server-side. */
  createdAt: string;
}

/**
 * Payload to record a tasting. `note` is optional; an empty/whitespace note is
 * normalised to `null` by the backend.
 */
export interface TastingInput {
  /** Star rating from 1 to 5 (integer, required). */
  rating: number;
  /** Optional free-text note (<= 2000 chars). */
  note?: string;
}
