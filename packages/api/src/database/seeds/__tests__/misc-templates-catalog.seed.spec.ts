import {
  MISC_TEMPLATES_CATALOG_SEED,
  seedMiscTemplatesCatalog,
} from '../misc-templates-catalog.seed';
import {
  MiscType,
  MiscUseAt,
} from '../../../catalog/misc/domain/misc-template.types';
import {
  assertCommonCatalogueSeederBehaviours,
  buildRepoMock,
} from '../seed-test-utils';

import { MiscTemplateOrmEntity } from '../../../catalog/misc/entities/misc-template.orm.entity';
import { Repository } from 'typeorm';

describe('seedMiscTemplatesCatalog (Issue #708 / #869 — Phase 3 PR #8)', () => {
  // The four standard catalogue-seeder behaviours (happy / sad /
  // mixed / override-list) live in the shared helper to satisfy
  // SonarCloud's duplication gate — see seed-test-utils.ts.
  assertCommonCatalogueSeederBehaviours('seedMiscTemplatesCatalog', {
    fn: (repo, seeds) =>
      seedMiscTemplatesCatalog(
        repo as unknown as Repository<MiscTemplateOrmEntity>,
        seeds,
      ),
    data: MISC_TEMPLATES_CATALOG_SEED,
  });

  describe('catalogue-specific invariants', () => {
    it('writes name + type + use_at + amount + time_min on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedMiscTemplatesCatalog(
        repo as unknown as Repository<MiscTemplateOrmEntity>,
      );

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        expect(Object.values(MiscType)).toContain(arg.type);
        expect(Object.values(MiscUseAt)).toContain(arg.use_at);
        expect(typeof arg.amount).toBe('number');
        expect(typeof arg.time_min).toBe('number');
      }
    });

    it('exposes 10 curated catalogue entries (5 BeerXML + 5 modern)', () => {
      expect(MISC_TEMPLATES_CATALOG_SEED).toHaveLength(10);

      const names = MISC_TEMPLATES_CATALOG_SEED.map((t) => t.name);
      // 5 BeerXML canonical
      expect(names).toContain('Apricot Extract');
      expect(names).toContain('Calcium Chloride');
      expect(names).toContain('Ginger Root');
      expect(names).toContain('Irish Moss');
      expect(names).toContain('Orange Peel, Bitter');
      // 5 Brasse-Bouillon modern essentials
      expect(names).toContain('Coriandre (graines)');
      expect(names).toContain('Lactose');
      expect(names).toContain('Whirlfloc (comprimé)');
      expect(names).toContain('Servomyces (nutriment levure)');
      expect(names).toContain('Gypse (sulfate de calcium, CaSO₄)');
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-7000-...)', () => {
      const ids = MISC_TEMPLATES_CATALOG_SEED.map((t) => t.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-7[0-9a-f]{11}$/);
      }
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('covers every BeerXML MISC TYPE at least once', () => {
      // The catalogue is small but must let a brewer pick at least
      // one representative entry per BeerXML TYPE so the picker UI
      // can offer a meaningful filter from day one.
      const types = new Set(MISC_TEMPLATES_CATALOG_SEED.map((t) => t.type));
      expect(types).toContain(MiscType.Spice);
      expect(types).toContain(MiscType.Fining);
      expect(types).toContain(MiscType.WaterAgent);
      expect(types).toContain(MiscType.Herb);
      expect(types).toContain(MiscType.Flavor);
      expect(types).toContain(MiscType.Other);
    });

    it('covers the three primary BeerXML USE phases (mash / boil / bottling)', () => {
      // Primary and Secondary are intentionally not covered by the
      // initial seed — they are niche (mostly Flavor adjuncts in
      // late additions) and the spectrum-coverage value is captured
      // by the existing Bottling entry (Apricot Extract).
      const uses = new Set(MISC_TEMPLATES_CATALOG_SEED.map((t) => t.use_at));
      expect(uses).toContain(MiscUseAt.Mash);
      expect(uses).toContain(MiscUseAt.Boil);
      expect(uses).toContain(MiscUseAt.Bottling);
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const template of MISC_TEMPLATES_CATALOG_SEED) {
        if (template.notes !== null) {
          expect(template.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });
  });
});
