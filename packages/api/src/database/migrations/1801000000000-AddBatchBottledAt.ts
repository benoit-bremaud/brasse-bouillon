import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `bottled_at` to `batches` (B3 — bottling / closure).
 *
 * Set when the batch is bottled and closed; mirrors `fermentation_completed_at`.
 * The batch status stays `COMPLETED` (no new `BOTTLED` state — see
 * `05-state-batch-closure.md`). Nullable so legacy and not-yet-bottled batches
 * don't need backfill.
 */
export class AddBatchBottledAt1801000000000 implements MigrationInterface {
  name = 'AddBatchBottledAt1801000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" ADD COLUMN "bottled_at" datetime`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "bottled_at"`);
  }
}
