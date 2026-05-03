/**
 * One-shot script to seed the `styles` BJCP reference catalogue
 * with the 20 curated entries from `STYLES_CATALOG_SEED` against
 * the local dev database (Issue #708 / #869, Phase 2 PR #4).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-styles-catalog-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing style IDs are
 * updated in place; missing ones are inserted.
 *
 * Mirror of the per-seed runners shipped in Phase 1
 * (run-hops-catalog-seed.ts, run-fermentables-catalog-seed.ts,
 * run-yeasts-catalog-seed.ts). Stopgap until the unified seed
 * orchestrator lands at the end of Phase 3.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { StyleOrmEntity } from '../src/catalog/style/entities/style.orm.entity';
import { seedStylesCatalog } from '../src/database/seeds/styles-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(StyleOrmEntity);
  const result = await seedStylesCatalog(repo);
  console.log('Styles catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
