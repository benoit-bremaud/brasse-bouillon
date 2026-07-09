import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the append-only Hub'Eau water-measurements cache (ADR-0025, slice 2).
 *
 * Rows are never updated; a full sync appends with `INSERT OR IGNORE` on the
 * unique key `(code_reseau, code_parametre, date_prelevement, code_prelevement)`
 * so re-syncing the same window is idempotent and history accrues. The
 * secondary `(code_reseau, date_prelevement)` index serves the two hot reads:
 * `max(date_prelevement)` (the conditional-sync gate) and the year-windowed
 * profile read. This holds public ARS/Hub'Eau reference data — not PII.
 */
export class CreateWaterMeasurements1809000000000 implements MigrationInterface {
  name = 'CreateWaterMeasurements1809000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "water_measurements" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "code_reseau" varchar(64) NOT NULL,
        "code_parametre" varchar(16) NOT NULL,
        "date_prelevement" varchar(10) NOT NULL,
        "code_prelevement" varchar(64) NOT NULL,
        "libelle_parametre" varchar(255) NOT NULL,
        "resultat_numerique" real,
        "conformite" varchar(8),
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_water_measurements_key" ON "water_measurements" ("code_reseau", "code_parametre", "date_prelevement", "code_prelevement")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_water_measurements_reseau_date" ON "water_measurements" ("code_reseau", "date_prelevement")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_water_measurements_reseau_date"`);
    await queryRunner.query(`DROP INDEX "UQ_water_measurements_key"`);
    await queryRunner.query(`DROP TABLE "water_measurements"`);
  }
}
