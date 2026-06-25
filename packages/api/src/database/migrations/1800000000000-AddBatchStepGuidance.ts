import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds `planned_duration_min` + `pedagogical_tip` to `batch_steps` (B1-live).
 *
 * These carry the brew-day assistant content onto **live** batches — a beginner
 * "why" tip and a default step duration for the mobile countdown — so the
 * guided brew-day is no longer demo-only. Both nullable: existing batches keep
 * no enrichment, and fermentation/packaging carry a tip but no duration.
 */
export class AddBatchStepGuidance1800000000000 implements MigrationInterface {
  name = 'AddBatchStepGuidance1800000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch_steps" ADD COLUMN "planned_duration_min" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_steps" ADD COLUMN "pedagogical_tip" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batch_steps" DROP COLUMN "pedagogical_tip"`,
    );
    await queryRunner.query(
      `ALTER TABLE "batch_steps" DROP COLUMN "planned_duration_min"`,
    );
  }
}
