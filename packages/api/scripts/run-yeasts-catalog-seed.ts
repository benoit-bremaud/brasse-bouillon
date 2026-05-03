/**
 * One-shot script to seed the `yeasts` reference catalogue with
 * the 20 curated entries from `YEASTS_CATALOG_SEED` against the
 * local dev database (Issue #708 / #869, Phase 1 PR #3).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-yeasts-catalog-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing yeast IDs are
 * updated in place; missing ones are inserted.
 *
 * Mirror of run-hops-catalog-seed.ts and
 * run-fermentables-catalog-seed.ts. Stopgap until the unified seed
 * orchestrator lands at the end of Phase 3.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { YeastOrmEntity } from '../src/catalog/yeast/entities/yeast.orm.entity';
import { seedYeastsCatalog } from '../src/database/seeds/yeasts-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(YeastOrmEntity);
  const result = await seedYeastsCatalog(repo);
  console.log('Yeasts catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
