import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the OpenFoodFacts proxy cache bridge fields to the
 * `scan_catalog_items` table (Epic #693 part 3/5).
 *
 * Columns:
 * - `source` — provenance discriminant (`seed` | `openfoodfacts` |
 *   `manual`). Required, NOT NULL, defaults to `'seed'` so existing
 *   rows backfill cleanly. CHECK constraint enforces the enum values
 *   at the DB layer.
 * - `fetched_at` — last successful upstream fetch timestamp. Drives
 *   the 1-hour cache TTL. Nullable.
 * - `raw_payload` — raw upstream response, stored as JSON-serialized
 *   TEXT for cross-DB safety (per ADR-0004 storage convention).
 *   Nullable.
 *
 * Indexes mirror the entity-level `@Index` decorators on `source` and
 * `fetched_at` to support the cache-decision query patterns.
 *
 * SQLite stores enums as VARCHAR. The CHECK constraint expression is
 * derived from the canonical enum values so the migration and the
 * application code share a single source of truth.
 */
export class AddScanCatalogBridgeFields1777000000000 implements MigrationInterface {
  name = 'AddScanCatalogBridgeFields1777000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" ADD COLUMN "source" varchar(20) NOT NULL DEFAULT 'seed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" ADD COLUMN "fetched_at" datetime`,
    );
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" ADD COLUMN "raw_payload" text`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_scan_catalog_items_source" ON "scan_catalog_items" ("source")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_scan_catalog_items_fetched_at" ON "scan_catalog_items" ("fetched_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_scan_catalog_items_fetched_at"`);
    await queryRunner.query(`DROP INDEX "IDX_scan_catalog_items_source"`);

    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" DROP COLUMN "raw_payload"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" DROP COLUMN "fetched_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" DROP COLUMN "source"`,
    );
  }
}
