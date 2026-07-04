import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the recipe brewing-difficulty columns (ADR-0024, Tranche B).
 *
 * - `difficulty_computed`: the backend-computed level, NOT NULL with a
 *   `'facile'` default so pre-existing rows and any create path that omits it
 *   stay valid (same pattern as `visibility`). Recomputed by the application
 *   layer on every recipe/ingredient mutation.
 * - `difficulty_override`: the optional author override (nullable). Effective
 *   level = `difficulty_override ?? difficulty_computed`.
 * - `difficulty_reasons`: the stored per-factor breakdown (JSON text) feeding
 *   the tap-to-explain. Nullable — no backfill: rows created before this simply
 *   carry no reasons until their next save recomputes them (same additive model
 *   as `done_when` / `prep_actions`). The `'facile'` default is a placeholder,
 *   not an assertion the recipe is easy.
 */
export class AddRecipeDifficultyColumns1808000000000 implements MigrationInterface {
  name = 'AddRecipeDifficultyColumns1808000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "difficulty_computed" varchar(20) NOT NULL DEFAULT 'facile'`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "difficulty_override" varchar(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "difficulty_reasons" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "difficulty_reasons"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "difficulty_override"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "difficulty_computed"`,
    );
  }
}
