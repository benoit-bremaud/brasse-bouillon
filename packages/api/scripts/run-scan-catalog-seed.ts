/**
 * One-shot script to seed `scan_catalog_items` with the 6 demo beers
 * from `SCAN_CATALOG_SEED_BEERS` against the local dev database.
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-scan-catalog-seed.ts
 *
 * This is a stopgap until we wire a proper `npm run seed:scan-catalog`
 * command + boot-time auto-seed flag (separate follow-up PR).
 *
 * Idempotent: safe to run multiple times. Existing barcodes are
 * updated in place; missing ones are inserted.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { ScanCatalogItemOrmEntity } from '../src/scan/entities/scan-catalog-item.orm.entity';
import { seedScanCatalog } from '../src/database/seeds/scan-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(ScanCatalogItemOrmEntity);
  const result = await seedScanCatalog(repo);

  console.log('Seeding done:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
