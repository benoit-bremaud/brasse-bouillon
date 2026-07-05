import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { RecipeOrmEntity } from '../recipe/entities/recipe.orm.entity';
import { RecipeDifficultyService } from '../recipe/services/recipe-difficulty.service';
import { buildTypeOrmOptions } from './typeorm.config';

/**
 * One-off backfill of the recipe brewing-difficulty (ADR-0024).
 *
 * Migration 1808 added the difficulty columns with NO backfill, so every recipe
 * that existed before the feature carries the `'facile'` placeholder + empty
 * reasons — and the mobile deliberately hides the badge for those (it gates on
 * `difficulty_reasons`). New/edited recipes recompute on save, but pre-existing
 * ones stay placeholders forever until touched. This entrypoint recomputes them
 * all, so the badge appears on the real catalogue right after a deploy.
 *
 * Compiles into `dist/database/recompute-difficulty-cli.js` (ships inside the Fly
 * image) and runs on the app machine, which has the SQLite volume mounted:
 *
 *   fly ssh console --app brasse-bouillon-api \
 *     -C "node dist/database/recompute-difficulty-cli.js"
 *
 * Idempotent: it recomputes from the recipe's current data, so re-running just
 * converges on the same values. Reuses `RecipeDifficultyService` verbatim (the
 * single source of the scoring + persistence) — no duplicated logic.
 */

/** Result of the backfill, for logging / verification. */
export interface RecipeDifficultyBackfillSummary {
  /** Recipes found in the catalogue. */
  total: number;
  /** Recipes whose difficulty was recomputed (skips any deleted mid-run). */
  recomputed: number;
}

/**
 * Recomputes and persists the difficulty of every recipe. The caller owns the
 * DataSource lifecycle; this initialises it if needed (which also applies any
 * pending migrations, `migrationsRun: true`) but never destroys it.
 */
export async function backfillRecipeDifficulty(
  dataSource: DataSource,
): Promise<RecipeDifficultyBackfillSummary> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const recipeRepo = dataSource.getRepository(RecipeOrmEntity);
  const difficulty = new RecipeDifficultyService(recipeRepo);

  const recipes = await recipeRepo.find({ select: { id: true } });
  let recomputed = 0;
  for (const { id } of recipes) {
    const result = await difficulty.recomputeForRecipe(id);
    if (result) {
      recomputed += 1;
    }
  }

  return { total: recipes.length, recomputed };
}

/**
 * CLI bootstrap: build a runtime DataSource, run the backfill, and always
 * release the connection. Exits non-zero on failure so the operator sees it.
 */
async function bootstrap(): Promise<void> {
  const dataSource = new DataSource(buildTypeOrmOptions());
  try {
    const summary = await backfillRecipeDifficulty(dataSource);
    console.log('Difficulty backfill complete:', JSON.stringify(summary));
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Only auto-run when invoked directly (`node dist/database/recompute-difficulty-cli.js`),
// not when imported by a test — so `backfillRecipeDifficulty` stays unit-testable.
if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('Difficulty backfill failed:', err);
    process.exit(1);
  });
}
