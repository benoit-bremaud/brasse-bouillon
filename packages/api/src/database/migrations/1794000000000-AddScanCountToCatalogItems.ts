import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds two scan-tracking columns on `scan_catalog_items` (Issue #929):
 *
 *  - `scan_count` (`integer NOT NULL DEFAULT 0`) — incremented on
 *    every successful `GET /scan/lookup/:ean`. Lets us answer later
 *    "which beers are scanned the most?" without retroactive log
 *    parsing.
 *  - `last_scanned_at` (`datetime NULL`) — timestamp of the most
 *    recent scan-lookup hit on this row. Powers trending stats
 *    ("scanned in the last 7 days") and informs cache-freshness
 *    tuning if popular rows justify shorter TTLs.
 *
 * Counter is per-SKU (one row per barcode). Multiple SKUs of the
 * same beer recipe (e.g. Brewdog Punk IPA in 33cl, 50cl, 75cl) keep
 * separate counters until a `beer_identities` regrouping table is
 * introduced — explicitly deferred to the day we build the stats
 * screen.
 *
 * No index on `scan_count` yet: volumes are too low to matter; we
 * will add one alongside the stats endpoint once it actually issues
 * `ORDER BY scan_count DESC` queries.
 */
export class AddScanCountToCatalogItems1794000000000
  implements MigrationInterface
{
  name = 'AddScanCountToCatalogItems1794000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" ADD COLUMN "scan_count" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" ADD COLUMN "last_scanned_at" datetime`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" DROP COLUMN "last_scanned_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scan_catalog_items" DROP COLUMN "scan_count"`,
    );
  }
}
