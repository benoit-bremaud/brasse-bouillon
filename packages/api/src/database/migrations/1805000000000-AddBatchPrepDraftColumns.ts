import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the draft « en préparation » lifecycle columns to `batches`
 * (brew-day/07, F14/F15).
 *
 * - `launched_at` — nullable stamp; null = the batch is a prep draft that was
 *   never launched. Same additive-timestamp model as `cancelled_at` /
 *   `archived_at`: the `status` CHECK constraint is NOT extended (SQLite
 *   cannot alter a CHECK in place and `batches` is referenced by cascade-FK
 *   child tables, so a table rebuild is deliberately avoided — see the
 *   1804 soft-lifecycle migration). The effective `draft` status is derived
 *   at the DTO boundary.
 * - `prep_checked_ids` — nullable JSON text holding the checked prep-item ids
 *   the draft carries (F14: per-batch checklist state).
 *
 * Backfill: every pre-existing batch was launched at creation (the old
 * POST /batches created it in_progress with steps), so `launched_at` is
 * seeded from `started_at` — no legacy row may read as a draft.
 */
export class AddBatchPrepDraftColumns1805000000000 implements MigrationInterface {
  name = 'AddBatchPrepDraftColumns1805000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "launched_at" datetime`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "prep_checked_ids" text`,
    );
    await queryRunner.query(
      `UPDATE "batches" SET "launched_at" = "started_at"`,
    );
    // One unlaunched draft per owner+recipe — the DB-level backstop that makes
    // prepareMine's documented idempotency hold under concurrent requests.
    // Safe on legacy data: the backfill above leaves no unlaunched row.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_batches_one_draft_per_owner_recipe" ` +
        `ON "batches" ("owner_id", "recipe_id") WHERE "launched_at" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The partial index references launched_at — drop it before the column.
    await queryRunner.query(
      `DROP INDEX "idx_batches_one_draft_per_owner_recipe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" DROP COLUMN "prep_checked_ids"`,
    );
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "launched_at"`);
  }
}
