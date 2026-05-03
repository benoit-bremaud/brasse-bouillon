import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `waters` table — immutable reference catalogue of
 * historical brewing water profiles. Phase 3 PR #6 of the catalogue
 * refactor (Issue #708 / #869), opening the equipment & water phase
 * after the metadata phase (#891 + #893) shipped.
 *
 * Mineral concentrations stored in ppm (parts per million,
 * equivalent to mg/L for dilute aqueous solutions). The six ions
 * tracked are calcium, bicarbonate, sulfate, chloride, sodium,
 * magnesium — the brewing-relevant ones — plus the baseline pH.
 *
 * Seeded with 10 profiles (5 BeerXML verbatim from
 * libraries/water.xml + 5 historically-significant brewing cities
 * needed by the demo recipes: Munich, London, Dortmund, Vienna,
 * Dublin).
 */
export class AddWatersCatalog1788000000000 implements MigrationInterface {
  name = 'AddWatersCatalog1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "waters" (
        "id"                varchar(36) PRIMARY KEY NOT NULL,
        "name"              varchar(120) NOT NULL,
        "origin"            varchar(80),
        "calcium_ppm"       real,
        "bicarbonate_ppm"   real,
        "sulfate_ppm"       real,
        "chloride_ppm"      real,
        "sodium_ppm"        real,
        "magnesium_ppm"     real,
        "ph"                real,
        "notes"             text,
        "created_at"        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"        datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_waters_name" ON "waters" ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_waters_name"`);
    await queryRunner.query(`DROP TABLE "waters"`);
  }
}
