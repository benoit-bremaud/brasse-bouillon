import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `fermentables` table — immutable reference catalogue
 * of grain / extract / sugar / adjunct varieties seeded with 20
 * entries (4 BeerXML canonical + 16 popular). Phase 1 PR #2 of the
 * catalogue refactor (Issue #708 / #869).
 *
 * Supplier relations are intentionally NOT created in this
 * migration. They land as a coherent normalised set
 * (`producers`, `fermentable_suppliers`, plus the analogous tables
 * for hops and yeasts) in a dedicated "normalize-producers" PR
 * after the three Phase 1 catalogues have shipped.
 */
export class AddFermentablesCatalog1784000000000 implements MigrationInterface {
  name = 'AddFermentablesCatalog1784000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "fermentables" (
        "id"                          varchar(36) PRIMARY KEY NOT NULL,
        "name"                        varchar(120) NOT NULL,
        "type"                        varchar(10) NOT NULL,
        "origin"                      varchar(80),
        "color_ebc_typical"           real,
        "potential_gravity_typical"   real,
        "yield_percent_typical"       real,
        "diastatic_power_lintner"     real,
        "max_in_batch_percent"        real,
        "recommend_mash"              boolean NOT NULL DEFAULT 1,
        "notes"                       text,
        "created_at"                  datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"                  datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_fermentables_type"
          CHECK ("type" IN ('grain', 'extract', 'sugar', 'adjunct'))
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fermentables_name" ON "fermentables" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fermentables_type" ON "fermentables" ("type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_fermentables_type"`);
    await queryRunner.query(`DROP INDEX "IDX_fermentables_name"`);
    await queryRunner.query(`DROP TABLE "fermentables"`);
  }
}
