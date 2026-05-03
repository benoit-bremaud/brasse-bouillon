import { Repository } from 'typeorm';

import {
  EQUIPMENT_TEMPLATES_CATALOG_SEED,
  seedEquipmentTemplatesCatalog,
} from '../equipment-templates-catalog.seed';
import {
  assertCommonCatalogueSeederBehaviours,
  buildRepoMock,
} from '../seed-test-utils';
import { EquipmentTemplateOrmEntity } from '../../../catalog/equipment/entities/equipment-template.orm.entity';

describe('seedEquipmentTemplatesCatalog (Issue #708 / #869 — Phase 3 PR #7)', () => {
  // The four standard catalogue-seeder behaviours (happy / sad /
  // mixed / override-list) live in the shared helper to satisfy
  // SonarCloud's duplication gate — see seed-test-utils.ts.
  assertCommonCatalogueSeederBehaviours('seedEquipmentTemplatesCatalog', {
    fn: (repo, seeds) =>
      seedEquipmentTemplatesCatalog(
        repo as unknown as Repository<EquipmentTemplateOrmEntity>,
        seeds,
      ),
    data: EQUIPMENT_TEMPLATES_CATALOG_SEED,
  });

  describe('catalogue-specific invariants', () => {
    it('writes name + batch_size_l on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedEquipmentTemplatesCatalog(
        repo as unknown as Repository<EquipmentTemplateOrmEntity>,
      );

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        expect(typeof arg.batch_size_l).toBe('number');
      }
    });

    it('exposes 9 curated catalogue entries spanning beginner to pro', () => {
      expect(EQUIPMENT_TEMPLATES_CATALOG_SEED).toHaveLength(9);

      const names = EQUIPMENT_TEMPLATES_CATALOG_SEED.map((t) => t.name);
      // Brasse-Bouillon original kitchen starter
      expect(names).toContain('Casserole cuisine 5L (kit initiation extract)');
      // 2 BeerXML canonical
      expect(names).toContain('Brew Pot 4 Gal (extract brewing)');
      expect(names).toContain(
        'Brew Pot 6+gal + Igloo Cooler 5 Gal (all-grain classic)',
      );
      // 6 modern popular setups
      expect(names).toContain('BIAB 20L (Brew In A Bag, entry-level)');
      expect(names).toContain('BIAB 30L (Brew In A Bag, intermediate)');
      expect(names).toContain('Grainfather G30 (electric all-in-one)');
      expect(names).toContain('Klarstein Brauheld Pro 30L (EU entry-level)');
      expect(names).toContain('Anvil Foundry 6.5 Gal (US popular electric)');
      expect(names).toContain('3-Vessel HERMS Recirculating (advanced / pro)');
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-6000-...)', () => {
      const ids = EQUIPMENT_TEMPLATES_CATALOG_SEED.map((t) => t.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-6[0-9a-f]{11}$/);
      }
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('covers the full beginner-to-pro batch size spectrum (5L to 23L)', () => {
      // The catalogue must let any user find a setup that matches
      // their budget. Smallest batch size = 5L (kitchen pot starter
      // for first-time brewers); largest = 23L (standard homebrew
      // batch with electric all-in-one or HERMS).
      const sizes = EQUIPMENT_TEMPLATES_CATALOG_SEED.map(
        (t) => t.batch_size_l,
      ).filter((s): s is number => s !== null);
      expect(Math.min(...sizes)).toBe(5);
      expect(Math.max(...sizes)).toBe(23);
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const template of EQUIPMENT_TEMPLATES_CATALOG_SEED) {
        if (template.notes !== null) {
          expect(template.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });

    // No simple "batch ≤ tun_volume" invariant exists across the
    // extract / partial mash / all-grain spectrum: extract setups
    // legitimately have batch > boil (top_up_water makes up the
    // difference), and multi-vessel setups have separate mash tun
    // and boil kettle volumes that can't both be expressed in the
    // single tun_volume_l column. The sanity check we DO get is
    // the spectrum-coverage test above (5L to 23L).
  });
});
