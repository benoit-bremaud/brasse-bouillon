import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `yeasts` table — immutable reference catalogue of
 * brewing yeast strains seeded with 20 entries (5 BeerXML canonical
 * + 15 popular industry products). Phase 1 PR #3 of the catalogue
 * refactor (Issue #708 / #869), completing the trio
 * Hop / Fermentable / Yeast.
 *
 * The `laboratory` field stays as a direct varchar in this
 * migration — see the entity comment for the rationale (1:1 with
 * the manufacturer product, not N:N like the supplier of
 * fermentables). The future "normalize-producers" PR may add an
 * optional `laboratory_id` FK referencing the unified `producers`
 * table while keeping this column as the brewer-facing display
 * string.
 */
export class AddYeastsCatalog1785000000000 implements MigrationInterface {
  name = 'AddYeastsCatalog1785000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "yeasts" (
        "id"                          varchar(36) PRIMARY KEY NOT NULL,
        "name"                        varchar(120) NOT NULL,
        "type"                        varchar(10) NOT NULL,
        "form"                        varchar(10) NOT NULL,
        "laboratory"                  varchar(60),
        "product_id"                  varchar(20),
        "min_temperature_c"           real,
        "max_temperature_c"           real,
        "flocculation"                varchar(10),
        "attenuation_percent_typical" real,
        "notes"                       text,
        "created_at"                  datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"                  datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_yeasts_type"
          CHECK ("type" IN ('ale', 'lager', 'wheat', 'wild')),
        CONSTRAINT "CHK_yeasts_form"
          CHECK ("form" IN ('liquid', 'dry', 'slant', 'culture')),
        CONSTRAINT "CHK_yeasts_flocculation"
          CHECK (
            "flocculation" IS NULL
            OR "flocculation" IN ('low', 'medium', 'high', 'very_high')
          )
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_yeasts_name" ON "yeasts" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_yeasts_type" ON "yeasts" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_yeasts_form" ON "yeasts" ("form")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_yeasts_laboratory" ON "yeasts" ("laboratory")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_yeasts_laboratory"`);
    await queryRunner.query(`DROP INDEX "IDX_yeasts_form"`);
    await queryRunner.query(`DROP INDEX "IDX_yeasts_type"`);
    await queryRunner.query(`DROP INDEX "IDX_yeasts_name"`);
    await queryRunner.query(`DROP TABLE "yeasts"`);
  }
}
