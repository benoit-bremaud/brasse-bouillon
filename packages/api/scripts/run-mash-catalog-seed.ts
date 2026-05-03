/**
 * One-shot script to seed the mash profile + step catalogue with
 * the 10 curated entries from `MASH_CATALOG_SEED` (10 profiles +
 * ~28 steps total) against the local dev database (Issue #708 /
 * #869, Phase 2 PR #5).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-mash-catalog-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing IDs (both
 * profiles and steps) are updated in place; missing ones are
 * inserted. Profiles are persisted before their steps so the FK
 * lookup always succeeds.
 *
 * Mirror of the per-seed runners shipped in earlier catalogues.
 * Stopgap until the unified seed orchestrator lands at the end of
 * Phase 3.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { MashProfileOrmEntity } from '../src/catalog/mash/entities/mash-profile.orm.entity';
import { MashStepOrmEntity } from '../src/catalog/mash/entities/mash-step.orm.entity';
import { seedMashCatalog } from '../src/database/seeds/mash-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const profileRepo = dataSource.getRepository(MashProfileOrmEntity);
  const stepRepo = dataSource.getRepository(MashStepOrmEntity);
  const result = await seedMashCatalog(profileRepo, stepRepo);
  console.log('Mash catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
