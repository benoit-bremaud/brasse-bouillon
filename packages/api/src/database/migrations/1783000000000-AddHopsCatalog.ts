import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `hops` table — immutable reference catalogue of hop
 * varieties seeded with 20 entries (5 BeerXML canonical + 15
 * popular). Phase 1 PR #1 of the catalogue refactor (Issue #708 /
 * #869).
 *
 * Producer and substitute relations are intentionally NOT created
 * in this migration. They land as a coherent normalised set
 * (`producers`, `hop_producers`, `hop_substitutes`, plus the
 * analogous tables for yeasts and fermentables) in a dedicated
 * "normalize-producers" PR after the three Phase 1 catalogues
 * have shipped — see the project log for the rationale.
 */
export class AddHopsCatalog1783000000000 implements MigrationInterface {
  name = 'AddHopsCatalog1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "hops" (
        "id"                    varchar(36) PRIMARY KEY NOT NULL,
        "name"                  varchar(100) NOT NULL,
        "origin"                varchar(80),
        "alpha_acid_typical"    real,
        "beta_acid_typical"     real,
        "hop_stability_index"   real,
        "usage_type"            varchar(12) NOT NULL,
        "form"                  varchar(8) NOT NULL,
        "notes"                 text,
        "created_at"            datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"            datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "CHK_hops_usage_type"
          CHECK ("usage_type" IN ('bittering', 'aroma', 'both')),
        CONSTRAINT "CHK_hops_form"
          CHECK ("form" IN ('pellet', 'plug', 'leaf'))
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_hops_name" ON "hops" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_hops_usage_type" ON "hops" ("usage_type")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_hops_form" ON "hops" ("form")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_hops_form"`);
    await queryRunner.query(`DROP INDEX "IDX_hops_usage_type"`);
    await queryRunner.query(`DROP INDEX "IDX_hops_name"`);
    await queryRunner.query(`DROP TABLE "hops"`);
  }
}
