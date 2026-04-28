import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds a nullable `style` column on `recipes` so the score-based
 * matching algorithm (Issue #699) can compare a scanned beer's
 * style against a recipe's style — the heaviest similarity weight
 * (50%) in the formula validated in the 2026-04-24 brainstorm.
 *
 * Nullable on purpose: every existing user-created recipe predates
 * style tagging, and asking the user to retro-fit a value would be
 * gratuitous churn. The matching service handles `null` by scoring
 * style at 0 and falling back to ABV similarity alone.
 *
 * The companion seed update (`PUBLIC_RECIPES_SEED`) populates the
 * 10 curated public recipes with concrete style values
 * ('Session IPA', 'Belgian Tripel', etc.) so the demo top-3 ranking
 * is editorially meaningful out of the box.
 */
export class AddRecipeStyleColumn1780000000000 implements MigrationInterface {
  name = 'AddRecipeStyleColumn1780000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "style" varchar(120)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_style" ON "recipes" ("style")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_recipes_style"`);
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "style"`);
  }
}
