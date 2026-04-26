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
 * Module-level constant exposing the canonical source values for callers
 * that need to validate or constrain supported scan catalog sources at
 * the application layer (DTO validation, service-layer guards, tests).
 *
 * The DB-level CHECK constraint emitted by migration 1777000000000
 * inlines the same string set rather than importing this constant: per
 * Clean Architecture, the migration (infrastructure) must not depend on
 * the domain layer. Drift is prevented by ADR-0001 — any new value
 * lands as a new migration alongside the enum update.
 */
export const SCAN_CATALOG_SOURCE_VALUES = Object.values(ScanCatalogSource);
