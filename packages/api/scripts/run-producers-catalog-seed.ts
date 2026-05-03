/**
 * One-shot script to seed the `producers` reference catalogue
 * with the 16 curated entries from `PRODUCERS_CATALOG_SEED`
 * against the local dev database (Issue #900).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-producers-catalog-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing producer IDs
 * are updated in place; missing ones are inserted.
 *
 * Mirror of the per-seed runners shipped in earlier catalogues.
 * Stopgap until the unified seed orchestrator lands at the end
 * of the catalogue refactor series.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { ProducerOrmEntity } from '../src/catalog/producer/entities/producer.orm.entity';
import { seedProducersCatalog } from '../src/database/seeds/producers-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(ProducerOrmEntity);
  const result = await seedProducersCatalog(repo);
  console.log('Producers catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
