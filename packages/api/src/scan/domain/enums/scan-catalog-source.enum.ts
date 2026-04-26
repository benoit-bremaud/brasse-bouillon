/**
 * Provenance discriminant for `scan_catalog_items` rows.
 *
 * Tracks how a catalog entry landed in the table:
 * - `SEED`: shipped with the application as curated seed data.
 * - `OPENFOODFACTS`: imported via the OpenFoodFacts proxy at scan time
 *   and cached locally (1-hour TTL — see Epic #693 + scan-2026-04-24
 *   brainstorm §3).
 * - `MANUAL`: inserted by an admin / operator (e.g. a brewery rep
 *   adding a missing beer).
 */
export enum ScanCatalogSource {
  SEED = 'seed',
  OPENFOODFACTS = 'openfoodfacts',
  MANUAL = 'manual',
}

/**
 * Module-level constant exposing the canonical source values, so the
 * CHECK constraint emitted by the migration and any runtime validation
 * cite a single source of truth and never drift.
 */
export const SCAN_CATALOG_SOURCE_VALUES = Object.values(ScanCatalogSource);
