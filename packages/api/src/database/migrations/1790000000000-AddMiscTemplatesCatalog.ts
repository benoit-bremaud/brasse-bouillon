import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `misc_templates` table — immutable reference
 * catalogue of homebrew miscellaneous ingredients (BeerXML 1.0
 * `<MISC>` records: spices, finings, water agents, herbs,
 * flavors). Phase 3 PR #8 of the catalogue refactor (Issue
 * #708 / #869) — last catalogue of the series.
 *
 * **Naming**: distinct from any future `recipe_misc` junction
 * table (Recipe → MiscTemplate, post Phase 3). Mirrors the
 * `equipment_templates` naming convention rather than the bare
 * BeerXML noun, so the "shared reference catalogue" semantic is
 * explicit at the schema level.
 *
 * Seeded with 10 entries (5 BeerXML verbatim from
 * libraries/misc.xml + 5 modern essentials covering the TYPE ×
 * USE matrix end users actually reach for).
 */
export class AddMiscTemplatesCatalog1790000000000 implements MigrationInterface {
  name = 'AddMiscTemplatesCatalog1790000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "misc_templates" (
        "id"                varchar(36) PRIMARY KEY NOT NULL,
        "name"              varchar(120) NOT NULL,
        "type"              varchar(32) NOT NULL,
        "use_at"            varchar(32) NOT NULL,
        "amount"            real NOT NULL,
        "amount_is_weight"  boolean NOT NULL DEFAULT 0,
        "time_min"          real NOT NULL,
        "use_for"           varchar(120),
        "notes"             text,
        "created_at"        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_misc_templates_type"
          CHECK ("type" IN ('spice', 'fining', 'water_agent', 'herb', 'flavor', 'other')),
        CONSTRAINT "CHK_misc_templates_use_at"
          CHECK ("use_at" IN ('mash', 'boil', 'primary', 'secondary', 'bottling'))
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_misc_templates_name" ON "misc_templates" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_misc_templates_type" ON "misc_templates" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_misc_templates_use_at" ON "misc_templates" ("use_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_misc_templates_use_at"`);
    await queryRunner.query(`DROP INDEX "IDX_misc_templates_type"`);
    await queryRunner.query(`DROP INDEX "IDX_misc_templates_name"`);
    await queryRunner.query(`DROP TABLE "misc_templates"`);
  }
}
