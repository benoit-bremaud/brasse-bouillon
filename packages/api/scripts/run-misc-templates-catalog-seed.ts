/**
 * One-shot script to seed the `misc_templates` reference
 * catalogue with the 10 curated entries from
 * `MISC_TEMPLATES_CATALOG_SEED` against the local dev database
 * (Issue #708 / #869, Phase 3 PR #8 — last catalogue of the
 * series).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-misc-templates-catalog-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing template IDs
 * are updated in place; missing ones are inserted.
 *
 * Mirror of the per-seed runners shipped in earlier catalogues.
 * Stopgap until the unified seed orchestrator lands at the end
 * of Phase 3.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { MiscTemplateOrmEntity } from '../src/catalog/misc/entities/misc-template.orm.entity';
import { seedMiscTemplatesCatalog } from '../src/database/seeds/misc-templates-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(MiscTemplateOrmEntity);
  const result = await seedMiscTemplatesCatalog(repo);
  console.log('Misc templates catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
