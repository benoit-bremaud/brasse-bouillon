import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `batch_observations` table (#605 slice 2, epic #595).
 *
 * Free-text notes a brewer logs against a batch — the "Notes" section of the
 * Mes Brassins detail (#606). Belongs to a batch (`batch_id`, FK CASCADE like
 * batch_steps); `step_order` optionally pins it to a step. SQLite-friendly:
 * `text` note, `text` for the comma-joined photo refs (TypeORM simple-array),
 * `integer` 1–5 mood score (CHECK-guarded). Indexed on `batch_id`.
 */
export class AddBatchObservationsTable1797000000000 implements MigrationInterface {
  name = 'AddBatchObservationsTable1797000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "batch_observations" (
        "id" varchar PRIMARY KEY NOT NULL,
        "batch_id" varchar NOT NULL,
        "step_order" integer,
        "free_text" text NOT NULL,
        "photo_refs" text,
        "mood_score" integer,
        "observed_at" datetime NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_batch_observations_mood" CHECK ("mood_score" IS NULL OR ("mood_score" >= 1 AND "mood_score" <= 5 AND "mood_score" = CAST("mood_score" AS INTEGER))),
        CONSTRAINT "FK_batch_observations_batch_id" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_batch_observations_batch_id" ON "batch_observations" ("batch_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_batch_observations_batch_id"`);
    await queryRunner.query(`DROP TABLE "batch_observations"`);
  }
}
