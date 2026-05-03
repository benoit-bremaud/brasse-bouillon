/**
 * One-shot script to seed the `hops` reference catalogue with the
 * 20 curated entries from `HOPS_CATALOG_SEED` against the local
 * dev database (Issue #708 / #869, Phase 1 PR #1).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-hops-catalog-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing hop IDs are
 * updated in place; missing ones are inserted.
 *
 * Mirror of run-public-recipes-seed.ts and run-scan-catalog-seed.ts.
 * Stopgap until we wire a proper `npm run seed:hops-catalog` command
 * + boot-time auto-seed flag (separate follow-up PR planned for the
 * end of Phase 3 once all 8 catalogues exist).
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { HopOrmEntity } from '../src/catalog/hop/entities/hop.orm.entity';
import { seedHopsCatalog } from '../src/database/seeds/hops-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(HopOrmEntity);
  const result = await seedHopsCatalog(repo);
  console.log('Hops catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
