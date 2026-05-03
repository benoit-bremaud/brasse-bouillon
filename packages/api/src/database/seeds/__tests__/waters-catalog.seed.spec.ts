import { Repository } from 'typeorm';

import { WATERS_CATALOG_SEED, seedWatersCatalog } from '../waters-catalog.seed';
import {
  assertCommonCatalogueSeederBehaviours,
  buildRepoMock,
} from '../seed-test-utils';
import { WaterOrmEntity } from '../../../catalog/water/entities/water.orm.entity';

describe('seedWatersCatalog (Issue #708 / #869 — Phase 3 PR #6)', () => {
  // The four standard catalogue-seeder behaviours (happy / sad /
  // mixed / override-list) live in the shared helper to satisfy
  // SonarCloud's duplication gate — see seed-test-utils.ts.
  assertCommonCatalogueSeederBehaviours('seedWatersCatalog', {
    fn: (repo, seeds) =>
      seedWatersCatalog(repo as unknown as Repository<WaterOrmEntity>, seeds),
    data: WATERS_CATALOG_SEED,
  });

  describe('catalogue-specific invariants', () => {
    it('writes name + 6 mineral columns + ph on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedWatersCatalog(repo as unknown as Repository<WaterOrmEntity>);

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        // Six mineral columns + ph should all be set (real numbers
        // or 0 for distilled water).
        expect(typeof arg.calcium_ppm).toBe('number');
        expect(typeof arg.bicarbonate_ppm).toBe('number');
        expect(typeof arg.sulfate_ppm).toBe('number');
        expect(typeof arg.chloride_ppm).toBe('number');
        expect(typeof arg.sodium_ppm).toBe('number');
        expect(typeof arg.magnesium_ppm).toBe('number');
        expect(typeof arg.ph).toBe('number');
      }
    });

    it('exposes 10 curated catalogue entries (5 BeerXML + 5 historical)', () => {
      expect(WATERS_CATALOG_SEED).toHaveLength(10);

      const names = WATERS_CATALOG_SEED.map((w) => w.name);
      // 5 BeerXML canonical
      expect(names).toContain('Burton on Trent, UK');
      expect(names).toContain('Distilled Water');
      expect(names).toContain('Edinburgh, Scotland');
      expect(names).toContain('Milwaukee, WI');
      expect(names).toContain('Pilsen, Czech Republic');
      // Historical brewing cities for the demo recipes
      expect(names).toContain('Munich, Germany');
      expect(names).toContain('London, UK');
      expect(names).toContain('Dortmund, Germany');
      expect(names).toContain('Vienna, Austria');
      expect(names).toContain('Dublin, Ireland');
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-5000-...)', () => {
      const ids = WATERS_CATALOG_SEED.map((w) => w.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-5[0-9a-f]{11}$/);
      }
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("captures Burton-on-Trent's signature high sulfate (>500 ppm)", () => {
      // Burton's water defines the IPA style — sulfate must be high
      // for the catalogue to teach the right brewing-water lesson.
      const burton = WATERS_CATALOG_SEED.find(
        (w) => w.name === 'Burton on Trent, UK',
      );
      expect(burton?.sulfate_ppm).toBeGreaterThan(500);
    });

    it('captures Pilsen-Czech extremely soft mineral profile (<20 ppm sulfate)', () => {
      // Pilsen's softness defines the Pilsner style — sulfate must
      // be very low for the catalogue to teach the right lesson.
      const pilsen = WATERS_CATALOG_SEED.find(
        (w) => w.name === 'Pilsen, Czech Republic',
      );
      expect(pilsen?.sulfate_ppm).toBeLessThan(20);
      expect(pilsen?.calcium_ppm).toBeLessThan(20);
    });

    it('captures Dublin water high alkalinity (>250 ppm bicarbonate) for Irish Stout', () => {
      // Dublin's high bicarbonate is what made Roasted Barley
      // mandatory for Irish Stout — the dark malts neutralise the
      // alkalinity. The catalogue must reflect this so the mash pH
      // calculations remain pedagogically correct.
      const dublin = WATERS_CATALOG_SEED.find(
        (w) => w.name === 'Dublin, Ireland',
      );
      expect(dublin?.bicarbonate_ppm).toBeGreaterThan(250);
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const water of WATERS_CATALOG_SEED) {
        if (water.notes !== null) {
          expect(water.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });
  });
});
