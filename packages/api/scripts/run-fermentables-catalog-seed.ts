/**
 * One-shot script to seed the `fermentables` reference catalogue
 * with the 20 curated entries from `FERMENTABLES_CATALOG_SEED`
 * against the local dev database (Issue #708 / #869, Phase 1 PR #2).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-fermentables-catalog-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing fermentable IDs
 * are updated in place; missing ones are inserted.
 *
 * Mirror of run-hops-catalog-seed.ts and run-public-recipes-seed.ts.
 * Stopgap until we wire a unified seed orchestrator (planned for
 * the end of Phase 3 once all 8 catalogues exist).
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { FermentableOrmEntity } from '../src/catalog/fermentable/entities/fermentable.orm.entity';
import { seedFermentablesCatalog } from '../src/database/seeds/fermentables-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(FermentableOrmEntity);
  const result = await seedFermentablesCatalog(repo);
  console.log('Fermentables catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
