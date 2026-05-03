/**
 * One-shot script to seed the `equipment_templates` reference
 * catalogue with the 9 curated entries from
 * `EQUIPMENT_TEMPLATES_CATALOG_SEED` against the local dev
 * database (Issue #708 / #869, Phase 3 PR #7).
 *
 * Usage:
 *   cd packages/api
 *   npx ts-node -r tsconfig-paths/register scripts/run-equipment-templates-catalog-seed.ts
 *
 * Idempotent: safe to run multiple times. Existing template IDs
 * are updated in place; missing ones are inserted.
 *
 * Mirror of the per-seed runners shipped in earlier catalogues.
 * Stopgap until the unified seed orchestrator lands at the end of
 * Phase 3.
 */
import 'reflect-metadata';

import dataSource from '../src/database/data-source';
import { EquipmentTemplateOrmEntity } from '../src/catalog/equipment/entities/equipment-template.orm.entity';
import { seedEquipmentTemplatesCatalog } from '../src/database/seeds/equipment-templates-catalog.seed';

async function main(): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(EquipmentTemplateOrmEntity);
  const result = await seedEquipmentTemplatesCatalog(repo);
  console.log('Equipment templates catalogue seed:', result);

  await dataSource.destroy();
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
