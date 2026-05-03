import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `styles` table — immutable reference catalogue of
 * BJCP beer styles seeded with 20 entries (5 BeerXML 1999 verbatim
 * + 15 modern BJCP 2021 needed by the demo recipes). Phase 2
 * PR #4 of the catalogue refactor (Issue #708 / #869), opening
 * the metadata phase after the trio of ingredient catalogues
 * (Hop / Fermentable / Yeast) shipped in Phase 1.
 *
 * Each metric dimension (OG / FG / IBU / colour EBC / carbonation
 * / ABV) ships as a min/max pair so the picker UX can flag when a
 * recipe's actual metrics fall outside the expected range.
 *
 * The `style_guide` column carries either "BJCP 1999" (verbatim
 * BeerXML entries) or "BJCP 2021" (modern entries) — keeping
 * `category_number` / `style_letter` accurate to the guide they
 * reference. A single uniform guide would have required either
 * rewriting the BeerXML entries or using an obsolete guide for
 * the 2026 demo recipes.
 */
export class AddStylesCatalog1786000000000 implements MigrationInterface {
  name = 'AddStylesCatalog1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "styles" (
        "id"                  varchar(36) PRIMARY KEY NOT NULL,
        "name"                varchar(120) NOT NULL,
        "category"            varchar(80) NOT NULL,
        "category_number"     integer NOT NULL,
        "style_letter"        varchar(2) NOT NULL,
        "style_guide"         varchar(20) NOT NULL,
        "type"                varchar(10) NOT NULL,
        "og_min"              real,
        "og_max"              real,
        "fg_min"              real,
        "fg_max"              real,
        "ibu_min"             real,
        "ibu_max"             real,
        "color_ebc_min"       real,
        "color_ebc_max"       real,
        "carb_min"            real,
        "carb_max"            real,
        "abv_min"             real,
        "abv_max"             real,
        "notes"               text,
        "profile"             text,
        "ingredients"         text,
        "examples"            text,
        "created_at"          datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"          datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_styles_type"
          CHECK ("type" IN ('lager', 'ale', 'wheat', 'mixed', 'mead'))
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_styles_name" ON "styles" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_styles_type" ON "styles" ("type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_styles_category_number" ON "styles" ("category_number")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_styles_style_guide" ON "styles" ("style_guide")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_styles_style_guide"`);
    await queryRunner.query(`DROP INDEX "IDX_styles_category_number"`);
    await queryRunner.query(`DROP INDEX "IDX_styles_type"`);
    await queryRunner.query(`DROP INDEX "IDX_styles_name"`);
    await queryRunner.query(`DROP TABLE "styles"`);
  }
}
