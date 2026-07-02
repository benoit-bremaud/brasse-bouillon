import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `done_when` to `batch_steps` (brew-day/01+06, F5).
 *
 * Nullable text holding the step's end condition snapshotted at launch — one
 * pedagogical FR sentence stating when the step is over, shown in the ACTIF
 * phase (the timer is an aid, the condition is the truth; event-gated steps
 * like fermentation get their condition instead of a countdown). No backfill:
 * steps launched before this simply carry no end condition, same additive
 * model as `pedagogical_tip` / `prep_actions`.
 */
export class AddBatchStepDoneWhen1807000000000 implements MigrationInterface {
  name = 'AddBatchStepDoneWhen1807000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch_steps" ADD COLUMN "done_when" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch_steps" DROP COLUMN "done_when"`,
    );
  }
}
