import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `batch_measurements` table (#605, first slice of the Mes Brassins
 * data-model extension #595).
 *
 * One row per reading a brewer records against a batch — OG/FG/SG-spot,
 * temperature or pH. Belongs to a batch (`batch_id`); `step_order` optionally
 * pins it to the batch step it was taken during. SQLite-friendly types
 * (`real`, `datetime`, `varchar` + CHECK). Indexed on `batch_id` for the
 * detail-screen measurements section (#606/#607).
 */
export class AddBatchMeasurementsTable1796000000000 implements MigrationInterface {
  name = 'AddBatchMeasurementsTable1796000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "batch_measurements" (
        "id" varchar PRIMARY KEY NOT NULL,
        "batch_id" varchar NOT NULL,
        "step_order" integer,
        "type" varchar(20) NOT NULL,
        "value" real NOT NULL,
        "unit" varchar(20),
        "taken_at" datetime NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_batch_measurements_type" CHECK ("type" IN ('og', 'fg', 'sg_spot', 'temperature', 'ph'))
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_batch_measurements_batch_id" ON "batch_measurements" ("batch_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_batch_measurements_batch_id"`);
    await queryRunner.query(`DROP TABLE "batch_measurements"`);
  }
}
