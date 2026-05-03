/**
 * Domain shape for one water profile entry in the immutable
 * reference catalogue. Mirrors the `WaterOrmEntity` row shape
 * one-to-one (no field is computed) — kept as a separate interface
 * so the application / presentation layers do not import the ORM
 * entity directly.
 *
 * Mineral concentrations are expressed in ppm (parts per million),
 * equivalent to mg/L for dilute aqueous solutions. The six ions
 * tracked are the brewing-relevant ones; trace minerals (iron,
 * fluoride, etc.) are out of scope.
 *
 * The sulfate-to-chloride ratio is the most consequential
 * brewing-water characteristic:
 *   - sulfate-dominant (e.g. Burton 725:25) → hop-forward IPAs,
 *     dry assertive bitterness
 *   - chloride-dominant (e.g. Munich, London) → malt-forward
 *     lagers and stouts, rounded mouthfeel
 */
export interface WaterCatalogEntry {
  id: string;
  name: string;
  origin: string | null;
  calcium_ppm: number | null;
  bicarbonate_ppm: number | null;
  sulfate_ppm: number | null;
  chloride_ppm: number | null;
  sodium_ppm: number | null;
  magnesium_ppm: number | null;
  ph: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
