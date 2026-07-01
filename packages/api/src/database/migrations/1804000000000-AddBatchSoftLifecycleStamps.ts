import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `cancelled_at` and `archived_at` to `batches` (brew-day/07 lifecycle).
 *
 * These nullable timestamps carry the reversibility states (F16 cancel, F25
 * archive) WITHOUT extending the `status` CHECK constraint — SQLite cannot
 * alter a CHECK in place and `batches` is referenced by many cascade-FK child
 * tables, so a table rebuild would be risky. A plain `ADD COLUMN` (like
 * `bottled_at`) is safe and needs no backfill. The effective lifecycle state is
 * derived (archived > cancelled > status) at the DTO boundary.
 */
export class AddBatchSoftLifecycleStamps1804000000000 implements MigrationInterface {
  name = 'AddBatchSoftLifecycleStamps1804000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "cancelled_at" datetime`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "archived_at" datetime`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "archived_at"`);
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "cancelled_at"`);
  }
}
