import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the quality-score fields to the `recipes` table.
 *
 * These fields feed the scan matching algorithm (see Epic #693 + the scan
 * brainstorm `docs/product/brainstorms/scan-2026-04-24.md` §3) and are not
 * tracked in user-authored recipe CRUD. They are aggregates + a flag
 * maintained by downstream pipelines.
 *
 * SQLite stores booleans as integers (0 / 1); the ORM maps them to `boolean`
 * through TypeORM's built-in transformer.
 */
export class AddRecipeQualityFields1776000000000 implements MigrationInterface {
  name = 'AddRecipeQualityFields1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "avg_rating" numeric(3,2)`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "brew_count" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "last_brewed_at" datetime`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "is_official" boolean NOT NULL DEFAULT 0`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_is_official" ON "recipes" ("is_official")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_brew_count" ON "recipes" ("brew_count")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_last_brewed_at" ON "recipes" ("last_brewed_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_recipes_last_brewed_at"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_brew_count"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_is_official"`);

    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "is_official"`);
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "last_brewed_at"`,
    );
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "brew_count"`);
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "avg_rating"`);
  }
}
