import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `prep_actions` to `batch_steps` (brew-day/01+06, F4).
 *
 * Nullable JSON text holding the PRÉP-phase physical gestures snapshotted at
 * launch — `{ action, why }` pairs, each gesture carrying its one-line
 * pedagogical why (the app teaches; a novice must learn to brew alone).
 * No backfill: steps launched before this simply carry no prep list (mobile
 * falls back to the bare PRÉP block), same additive model as the 1803-era
 * `pedagogical_tip` / `planned_duration_min` enrichment columns.
 */
export class AddBatchStepPrepActions1806000000000 implements MigrationInterface {
  name = 'AddBatchStepPrepActions1806000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch_steps" ADD COLUMN "prep_actions" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch_steps" DROP COLUMN "prep_actions"`,
    );
  }
}
