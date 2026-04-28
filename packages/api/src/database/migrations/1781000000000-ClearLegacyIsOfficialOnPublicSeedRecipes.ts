import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * One-shot data migration to clear the legacy `is_official=true` flag
 * on the 10 curated public recipes seeded by PR #768.
 *
 * Issue #699 introduced an "official-recipe shortcut" that forces the
 * matching score to 100 when `is_official=true`. PR #768 inadvertently
 * tagged every seeded PUBLIC recipe as official, which made
 * `RecipeMatchingService.rankForBeer` collapse to insertion order
 * (Codex P1 on PR #773).
 *
 * The seed payload was fixed to `is_official: false` going forward,
 * but databases that already loaded PR #768's seed keep the old
 * value until someone manually re-runs the seed CLI. This migration
 * is the deploy-time equivalent: it idempotently aligns the 10
 * deterministic seed UUIDs to the new contract on every environment.
 *
 * Down migration is intentionally a no-op: we never want to re-tag
 * these rows as `is_official=true` (the matching shortcut would
 * degenerate the ranking again). If a future need arises, edit the
 * specific recipe row directly rather than reverting this migration.
 */
export class ClearLegacyIsOfficialOnPublicSeedRecipes1781000000000 implements MigrationInterface {
  name = 'ClearLegacyIsOfficialOnPublicSeedRecipes1781000000000';

  // Mirrors PUBLIC_RECIPES_SEED ids — kept literal here so the
  // migration stays self-contained and runs identically regardless of
  // how the seed file evolves later.
  private readonly seedIds: readonly string[] = [
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000004',
    '00000000-0000-4000-8000-000000000005',
    '00000000-0000-4000-8000-000000000006',
    '00000000-0000-4000-8000-000000000007',
    '00000000-0000-4000-8000-000000000008',
    '00000000-0000-4000-8000-000000000009',
    '00000000-0000-4000-8000-00000000000a',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const placeholders = this.seedIds.map(() => '?').join(', ');
    // SQLite stores booleans as 0/1; use the integer literal so the
    // statement is portable to Postgres later (where 0/1 cast back
    // to false/true via the bool column type).
    await queryRunner.query(
      `UPDATE "recipes" SET "is_official" = 0 WHERE "id" IN (${placeholders})`,
      [...this.seedIds],
    );
  }

  public async down(): Promise<void> {
    // Intentional no-op — see class docstring.
  }
}
