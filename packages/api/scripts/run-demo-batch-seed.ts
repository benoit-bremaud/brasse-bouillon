/**
 * One-shot script to seed the demo Punk IPA brassin row + its 7
 * brewing-day steps against the local dev database (Issue #782).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-demo-batch-seed.ts
 *
 * Prerequisites:
 *   - The Punk IPA recipe (#701) must be seeded first. The script
 *     orchestrates the full chain (system user → public recipes →
 *     demo batch) so a fresh DB can be bootstrapped end-to-end in
 *     one invocation.
 *
 * Idempotent: safe to run multiple times. Existing rows are
 * updated in place; missing ones are inserted.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { BatchOrmEntity } from '../src/batch/entities/batch.orm.entity';
import { BatchStepOrmEntity } from '../src/batch/entities/batch-step.orm.entity';
import { RecipeOrmEntity } from '../src/recipe/entities/recipe.orm.entity';
import { User } from '../src/user/entities/user.entity';
import { seedDemoBatch } from '../src/database/seeds/demo-batch.seed';
import { seedPublicRecipes } from '../src/database/seeds/public-recipes.seed';
import { seedSystemUser } from '../src/database/seeds/system-user.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  // Step 1 — system user (FK target for the demo batch's owner_id
  // and the public recipes' owner_id).
  const userRepo = dataSource.getRepository(User);
  const userResult = await seedSystemUser(userRepo);
  console.log('System user seed:', userResult);

  // Step 2 — public recipes (FK target for the demo batch's
  // recipe_id). Required even on re-runs because it brings the
  // schema row up to the latest curated values.
  const recipeRepo = dataSource.getRepository(RecipeOrmEntity);
  const recipeResult = await seedPublicRecipes(recipeRepo);
  console.log('Public recipes seed:', recipeResult);

  // Step 3 — demo batch + 7 brewing-day steps.
  const batchRepo = dataSource.getRepository(BatchOrmEntity);
  const stepRepo = dataSource.getRepository(BatchStepOrmEntity);
  const batchResult = await seedDemoBatch(batchRepo, recipeRepo, stepRepo);
  console.log('Demo batch seed:', batchResult);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
