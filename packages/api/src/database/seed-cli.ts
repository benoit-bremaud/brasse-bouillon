import 'reflect-metadata';

import { DataSource } from 'typeorm';

import { RecipeOrmEntity } from '../recipe/entities/recipe.orm.entity';
import { User } from '../user/entities/user.entity';
import {
  buildPublicRecipeSubResourceRepos,
  seedPublicRecipes,
  SeedPublicRecipesResult,
} from './seeds/public-recipes.seed';
import { SeedSystemUserResult, seedSystemUser } from './seeds/system-user.seed';
import {
  SeedDeletedAuthorResult,
  seedDeletedAuthor,
} from './seeds/deleted-author.seed';
import { buildTypeOrmOptions } from './typeorm.config';

/**
 * Production seeding entrypoint — compiled into `dist/database/seed-cli.js`
 * so it ships inside the Fly image and can be run on the **app machine**
 * (which has the SQLite volume mounted at `/app/data`):
 *
 *   fly ssh console --app brasse-bouillon-api \
 *     -C "node dist/database/seed-cli.js"
 *
 * Why not `scripts/run-public-recipes-seed.ts`? That script lives outside
 * `src/`, is never copied into the runtime image, and runs via ts-node
 * (a dev dependency pruned in production) — so it cannot execute on Fly.
 * This entrypoint lives in `src/`, compiles to `dist/`, and runs on plain
 * `node` with production dependencies only.
 *
 * Why not a `fly.toml` `release_command`? Release-command machines run the
 * new image **without the volume mounted**, so a SQLite-on-volume migrate
 * /seed there would hit a throwaway database. Migrations already run at app
 * boot (`migrationsRun: true`, see `typeorm.config.ts`); this entrypoint
 * covers the remaining gap — seeding — explicitly and on demand.
 *
 * Idempotent: `seedSystemUser`, `seedDeletedAuthor` and `seedPublicRecipes`
 * upsert by id, so re-running converges on the declared seed without
 * duplicating rows.
 */

/** Combined result of the production seed, for logging / verification. */
export interface ProductionSeedSummary {
  systemUser: SeedSystemUserResult;
  deletedAuthor: SeedDeletedAuthorResult;
  publicRecipes: SeedPublicRecipesResult;
}

/**
 * Seed the data a freshly-deployed production database needs to serve the
 * public catalogue: the system curator user (the FK owner of every seeded
 * recipe), the deleted-author tombstone (the anonymization target account
 * deletion repoints public recipes at), and the curated PUBLIC recipes with
 * their full content.
 *
 * Order matters: the system user must exist before the recipes are written
 * (`recipes.owner_id` -> `users.id`). The deleted-author tombstone must exist
 * before any account erasure runs, so it is seeded here alongside the system
 * user. The caller owns the DataSource lifecycle; this function initialises
 * it if needed but never destroys it.
 */
export async function runProductionSeed(
  dataSource: DataSource,
): Promise<ProductionSeedSummary> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const systemUser = await seedSystemUser(dataSource.getRepository(User));
  const deletedAuthor = await seedDeletedAuthor(dataSource.getRepository(User));
  const publicRecipes = await seedPublicRecipes(
    dataSource.getRepository(RecipeOrmEntity),
    undefined,
    buildPublicRecipeSubResourceRepos(dataSource),
  );

  return { systemUser, deletedAuthor, publicRecipes };
}

/**
 * CLI bootstrap: build a runtime DataSource (so `initialize()` also applies
 * any pending migrations — `migrationsRun: true`), run the seed, and always
 * release the connection. Exits non-zero on failure so the operator sees it.
 */
async function bootstrap(): Promise<void> {
  const dataSource = new DataSource(buildTypeOrmOptions());
  try {
    const summary = await runProductionSeed(dataSource);
    console.log('Production seed complete:', JSON.stringify(summary));
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Only auto-run when invoked directly (`node dist/database/seed-cli.js`),
// not when imported by a test — so `runProductionSeed` stays unit-testable
// without side effects.
if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('Production seed failed:', err);
    process.exit(1);
  });
}
