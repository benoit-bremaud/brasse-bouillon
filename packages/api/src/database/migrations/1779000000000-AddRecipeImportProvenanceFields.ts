import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the import-provenance fields to the `recipes` table so that a
 * recipe imported from the community (issue #601) keeps a verifiable
 * link to its source plus a human-readable attribution string the UI
 * can surface.
 *
 * Two new nullable columns:
 * - `imported_from_recipe_id` (varchar(36), FK → recipes.id, ON DELETE
 *   SET NULL): the id of the source recipe this one was copied from.
 *   Indexed so we can quickly find all imports of a given source.
 * - `import_provenance` (text): a French human-readable line such as
 *   "Importée de Punk IPA Clone par marie le 27 avril 2026" — the
 *   string is server-generated at import time. Keeping it as plain
 *   text (not JSON) keeps the UI rendering trivial; structured
 *   metadata can move to a dedicated table later if we need richer
 *   filtering.
 */
export class AddRecipeImportProvenanceFields1779000000000 implements MigrationInterface {
  name = 'AddRecipeImportProvenanceFields1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // FK declared inline on `ADD COLUMN`. SQLite supports this form
    // and applies `ON DELETE SET NULL` so deleting a source recipe
    // turns the imported child's pointer to NULL (the import is
    // preserved as a standalone recipe with no provenance link)
    // rather than dangling. Mirrors the convention the
    // `parent_recipe_id` FK uses in the InitialSchema migration.
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "imported_from_recipe_id" varchar(36) REFERENCES "recipes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "import_provenance" text`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_imported_from_recipe_id" ON "recipes" ("imported_from_recipe_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_recipes_imported_from_recipe_id"`);
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "import_provenance"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "imported_from_recipe_id"`,
    );
  }
}
