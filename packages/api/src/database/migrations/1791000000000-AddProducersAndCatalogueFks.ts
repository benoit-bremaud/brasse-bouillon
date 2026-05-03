import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `producers` reference table and adds nullable
 * `producer_id` FK columns on the 5 catalogue tables that map
 * to a brand owner (hops, fermentables, yeasts, misc_templates,
 * equipment_templates). Issue #900 — closes the design debt
 * documented in every Phase 1-3 catalogue entity ("deferred to
 * normalize-producers PR after Phase 3").
 *
 * **Mode-prudent first cut**: this migration only ADDS the new
 * `producer_id` column. It does NOT drop the existing yeast
 * `laboratory` varchar nor rename `product_id` → `product_code`.
 * The yeast catalogue temporarily carries 3 producer-related
 * fields (producer_id FK + laboratory string + product_id
 * string) — by design, to keep the diff minimal and risk low.
 * A follow-up cleanup PR will drop the redundancy once the
 * picker UI is validated against the new FK.
 *
 * **Producer ≠ Distributor**: `producers` carries the brand
 * owner (1 product = 1 producer). The boutique flow (1 product
 * = N distributors) is handled by a separate `distributors`
 * table introduced in issue #901.
 *
 * All `producer_id` FKs use `ON DELETE SET NULL` so deleting a
 * producer leaves the ingredient row intact (just orphaned
 * from its brand identity).
 */
export class AddProducersAndCatalogueFks1791000000000 implements MigrationInterface {
  name = 'AddProducersAndCatalogueFks1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ─── 1. Create the producers table ──────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "producers" (
        "id"            varchar(36) PRIMARY KEY NOT NULL,
        "name"          varchar(120) NOT NULL,
        "type"          varchar(32) NOT NULL,
        "country"       varchar(2),
        "website"       varchar(255),
        "notes"         text,
        "created_at"    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_producers_type"
          CHECK ("type" IN ('laboratory', 'maltster', 'hop_supplier',
                            'equipment_manufacturer', 'other')),
        CONSTRAINT "CHK_producers_country"
          CHECK ("country" IS NULL
                 OR ("country" GLOB '[A-Z][A-Z]'
                     AND length("country") = 2))
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_producers_name" ON "producers" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_producers_type" ON "producers" ("type")`,
    );

    // ─── 2. Add producer_id FK to the 5 catalogues ──────────────────
    // SQLite does not support ALTER TABLE … ADD COLUMN with FOREIGN
    // KEY referencing a different table directly via the constraint
    // name; the FK is enforced via column-level REFERENCES clause.
    // ON DELETE SET NULL so deleting a producer leaves catalogue
    // rows intact but orphaned from their brand identity.
    for (const table of [
      'hops',
      'fermentables',
      'yeasts',
      'misc_templates',
      'equipment_templates',
    ]) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN "producer_id" varchar(36) ` +
          `REFERENCES "producers"("id") ON DELETE SET NULL`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_${table}_producer_id" ON "${table}" ("producer_id")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the producer_id columns from the 5 catalogues FIRST,
    // before dropping the producers table. Otherwise the FK
    // clauses on those columns would dangle, and any subsequent
    // write on those catalogue tables would fail with
    // "no such table: main.producers". Re-running the up()
    // migration would also fail because producer_id would
    // already exist on the catalogue tables. SQLite 3.35+
    // supports ALTER TABLE DROP COLUMN; better-sqlite3 bundles
    // SQLite 3.42+. Reported by Codex on PR #902 review.
    for (const table of [
      'equipment_templates',
      'misc_templates',
      'yeasts',
      'fermentables',
      'hops',
    ]) {
      await queryRunner.query(`DROP INDEX "IDX_${table}_producer_id"`);
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN "producer_id"`,
      );
    }
    await queryRunner.query(`DROP INDEX "IDX_producers_type"`);
    await queryRunner.query(`DROP INDEX "IDX_producers_name"`);
    await queryRunner.query(`DROP TABLE "producers"`);
  }
}
