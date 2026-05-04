/**
 * One-shot script to seed the `distributors` reference
 * catalogue with the 12 curated entries from
 * `DISTRIBUTORS_CATALOG_SEED` against the local dev database
 * (Issue #901).
 *
 * Usage :
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-distributors-catalog-seed.ts
 *
 * Idempotent : safe to run multiple times. Existing distributor
 * IDs are updated in place; missing ones are inserted.
 *
 * Mirror of the per-seed runners shipped in earlier catalogues.
 * Stopgap until the unified seed orchestrator lands.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { DistributorOrmEntity } from '../src/catalog/distributor/entities/distributor.orm.entity';
import { seedDistributorsCatalog } from '../src/database/seeds/distributors-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(DistributorOrmEntity);
  const result = await seedDistributorsCatalog(repo);
  console.log('Distributors catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
