/**
 * Main fermentable families for the catalogue. Mirrors the existing
 * `RecipeFermentableType` enum string values one-to-one so the
 * future `recipe_fermentables.fermentable_id` FK migration does not
 * have to remap values across enums.
 *
 * Kept as a separate enum (not imported from `recipe/domain/`) so
 * the `catalog/` module stays self-contained — same convention as
 * `HopUsageType` / `HopForm` in `catalog/hop/`.
 */
export enum FermentableType {
  GRAIN = 'grain',
  EXTRACT = 'extract',
  SUGAR = 'sugar',
  ADJUNCT = 'adjunct',
}
