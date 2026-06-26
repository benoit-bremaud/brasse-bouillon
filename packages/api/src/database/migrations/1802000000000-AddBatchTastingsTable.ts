import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `batch_tastings` table (B3 — first tasting note).
 *
 * One row per batch (a `UNIQUE` index on `batch_id` enforces the one-tasting-
 * per-batch rule of v1): a 1-5 `rating` and an optional free-text `note`.
 * SQLite-friendly types (`integer`, `text`, `datetime`); FK cascades on batch
 * delete. A CHECK keeps the rating in range as a defence-in-depth alongside the
 * DTO + domain factory.
 */
export class AddBatchTastingsTable1802000000000 implements MigrationInterface {
  name = 'AddBatchTastingsTable1802000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "batch_tastings" (
        "id" varchar PRIMARY KEY NOT NULL,
        "batch_id" varchar NOT NULL,
        "rating" integer NOT NULL,
        "note" text,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_batch_tastings_rating" CHECK ("rating" >= 1 AND "rating" <= 5),
        CONSTRAINT "FK_batch_tastings_batch_id" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_batch_tastings_batch_id" ON "batch_tastings" ("batch_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_batch_tastings_batch_id"`);
    await queryRunner.query(`DROP TABLE "batch_tastings"`);
  }
}
