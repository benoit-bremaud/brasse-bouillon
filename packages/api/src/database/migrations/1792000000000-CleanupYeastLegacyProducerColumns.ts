import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Cleanup of the yeast catalogue's legacy producer-related
 * columns introduced by PR #890 (laboratory + product_id) now
 * that the unified `producer_id` FK shipped in PR #902. Issue
 * #904 — closes the dette technique deliberately deferred from
 * PR #902's mode-prudent first cut.
 *
 * Three changes:
 *   1. Backfill `producer_id` on existing yeast rows by looking
 *      up the legacy `laboratory` string against the `producers`
 *      catalogue seeded in PR #902. Names match verbatim
 *      (e.g. "Wyeast Labs", not "Wyeast Laboratories") so the
 *      lookup is a straight equality join.
 *   2. Drop `IDX_yeasts_laboratory` index + drop `laboratory`
 *      column. SQLite 3.35+ supports ALTER TABLE DROP COLUMN;
 *      better-sqlite3 bundles SQLite 3.42+.
 *   3. Rename `product_id` → `product_code`. The column is a
 *      manufacturer SKU string (WLP002, 1056, US-05), not a
 *      FK identifier; the new name removes the confusion with
 *      `producer_id` (which IS a FK).
 *
 * Defensive backfill: only updates rows whose `producer_id` is
 * currently NULL — preserves any FK already set out-of-band.
 */
export class CleanupYeastLegacyProducerColumns1792000000000 implements MigrationInterface {
  name = 'CleanupYeastLegacyProducerColumns1792000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── 1. Backfill producer_id from laboratory string ─────────────
    // Lookup against producers.name verbatim — the names in the
    // producers seed (PR #902) were chosen to match these legacy
    // strings exactly, so the join is a straight equality.
    await queryRunner.query(`
      UPDATE "yeasts"
      SET "producer_id" = (
        SELECT "id" FROM "producers" WHERE "name" = "yeasts"."laboratory"
      )
      WHERE "producer_id" IS NULL
        AND "laboratory" IS NOT NULL
    `);

    // ─── 2. Drop laboratory column + its index ──────────────────────
    await queryRunner.query(`DROP INDEX "IDX_yeasts_laboratory"`);
    await queryRunner.query(`ALTER TABLE "yeasts" DROP COLUMN "laboratory"`);

    // ─── 3. Rename product_id → product_code ────────────────────────
    await queryRunner.query(
      `ALTER TABLE "yeasts" RENAME COLUMN "product_id" TO "product_code"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse order: rename back, recreate column + index, restore
    // laboratory string by reverse lookup against producers.name.
    await queryRunner.query(
      `ALTER TABLE "yeasts" RENAME COLUMN "product_code" TO "product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "yeasts" ADD COLUMN "laboratory" varchar(60)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_yeasts_laboratory" ON "yeasts" ("laboratory")`,
    );
    // Restore the legacy free-text laboratory string from
    // producers.name. Lossy if a producer was renamed since
    // backfill — acceptable for dev-only rollback.
    await queryRunner.query(`
      UPDATE "yeasts"
      SET "laboratory" = (
        SELECT "name" FROM "producers" WHERE "id" = "yeasts"."producer_id"
      )
      WHERE "producer_id" IS NOT NULL
    `);
  }
}
