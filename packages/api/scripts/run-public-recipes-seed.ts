/**
 * One-shot script to seed `recipes` with the 10 curated PUBLIC recipes
 * from `PUBLIC_RECIPES_SEED` against the local dev database (Issue #701).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-public-recipes-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing recipe IDs are
 * updated in place; missing ones are inserted.
 *
 * Mirror of run-scan-catalog-seed.ts. This is a stopgap until we wire
 * a proper `npm run seed:public-recipes` command + boot-time auto-seed
 * flag (separate follow-up PR).
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { RecipeOrmEntity } from '../src/recipe/entities/recipe.orm.entity';
import { User } from '../src/user/entities/user.entity';
import { seedPublicRecipes } from '../src/database/seeds/public-recipes.seed';
import { seedSystemUser } from '../src/database/seeds/system-user.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  // Step 1 — system user must exist before recipes are inserted
  // (FK constraint recipes.owner_id -> users.id).
  const userRepo = dataSource.getRepository(User);
  const userResult = await seedSystemUser(userRepo);
  console.log('System user seed:', userResult);

  // Step 2 — public recipes owned by the system user.
  const recipeRepo = dataSource.getRepository(RecipeOrmEntity);
  const recipeResult = await seedPublicRecipes(recipeRepo);
  console.log('Public recipes seed:', recipeResult);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
