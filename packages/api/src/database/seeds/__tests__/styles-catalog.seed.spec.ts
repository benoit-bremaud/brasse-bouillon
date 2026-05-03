import { Repository } from 'typeorm';

import { STYLES_CATALOG_SEED, seedStylesCatalog } from '../styles-catalog.seed';
import {
  assertCommonCatalogueSeederBehaviours,
  buildRepoMock,
} from '../seed-test-utils';
import { StyleOrmEntity } from '../../../catalog/style/entities/style.orm.entity';
import { StyleType } from '../../../catalog/style/domain/enums/style-type.enum';

describe('seedStylesCatalog (Issue #708 / #869 — Phase 2 PR #4)', () => {
  // The four standard catalogue-seeder behaviours (happy / sad /
  // mixed / override-list) live in the shared helper to satisfy
  // SonarCloud's duplication gate — see seed-test-utils.ts. Only the
  // catalogue-specific assertions remain inline below.
  assertCommonCatalogueSeederBehaviours('seedStylesCatalog', {
    fn: (repo, seeds) =>
      seedStylesCatalog(repo as unknown as Repository<StyleOrmEntity>, seeds),
    data: STYLES_CATALOG_SEED,
  });

  describe('catalogue-specific invariants', () => {
    it('writes name + type + style_guide on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedStylesCatalog(repo as unknown as Repository<StyleOrmEntity>);

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        expect(Object.values(StyleType)).toContain(arg.type);
        expect(typeof arg.style_guide).toBe('string');
      }
    });

    it('exposes 20 curated catalogue entries spanning BeerXML 1999 + BJCP 2021', () => {
      expect(STYLES_CATALOG_SEED).toHaveLength(20);

      const names = STYLES_CATALOG_SEED.map((s) => s.name);
      // 5 BeerXML BJCP 1999 canonical
      expect(names).toContain('American Wheat');
      expect(names).toContain('Bohemian Pilsner');
      expect(names).toContain('California Common Beer');
      expect(names).toContain('Dry Stout (Irish)');
      expect(names).toContain('Traditional Bock');
      // BJCP 2021 modern entries for the demo recipes
      expect(names).toContain('American IPA');
      expect(names).toContain('New England IPA');
      expect(names).toContain('Belgian Tripel');
      expect(names).toContain('Saison');
      expect(names).toContain('Witbier');
      expect(names).toContain('Hefeweizen');
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-3000-...)', () => {
      const ids = STYLES_CATALOG_SEED.map((s) => s.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-3[0-9a-f]{11}$/);
      }
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('preserves BJCP 1999 verbatim for the 5 BeerXML entries and uses BJCP 2021 for modern ones', () => {
      const guide1999Count = STYLES_CATALOG_SEED.filter(
        (s) => s.style_guide === 'BJCP 1999',
      ).length;
      const guide2021Count = STYLES_CATALOG_SEED.filter(
        (s) => s.style_guide === 'BJCP 2021',
      ).length;
      const hybridCount = STYLES_CATALOG_SEED.filter(
        (s) => s.style_guide === 'Hybrid post-2010',
      ).length;

      expect(guide1999Count).toBe(5);
      expect(guide2021Count).toBe(14);
      expect(hybridCount).toBe(1); // White IPA — no official BJCP category
      expect(guide1999Count + guide2021Count + hybridCount).toBe(20);
    });

    it('covers every style type that has at least one demo entry (lager/ale/wheat/mixed)', () => {
      const types = new Set(STYLES_CATALOG_SEED.map((s) => s.type));
      expect(types.has(StyleType.ALE)).toBe(true);
      expect(types.has(StyleType.LAGER)).toBe(true);
      expect(types.has(StyleType.WHEAT)).toBe(true);
      expect(types.has(StyleType.MIXED)).toBe(true);
      // MEAD intentionally absent — kept in the enum for completeness
      // but no honey-based demo style yet.
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const style of STYLES_CATALOG_SEED) {
        if (style.notes !== null) {
          expect(style.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });

    it('ensures every metric range has min ≤ max when both bounds are set', () => {
      for (const style of STYLES_CATALOG_SEED) {
        if (style.og_min !== null && style.og_max !== null) {
          expect(style.og_min).toBeLessThanOrEqual(style.og_max);
        }
        if (style.fg_min !== null && style.fg_max !== null) {
          expect(style.fg_min).toBeLessThanOrEqual(style.fg_max);
        }
        if (style.ibu_min !== null && style.ibu_max !== null) {
          expect(style.ibu_min).toBeLessThanOrEqual(style.ibu_max);
        }
        if (style.color_ebc_min !== null && style.color_ebc_max !== null) {
          expect(style.color_ebc_min).toBeLessThanOrEqual(style.color_ebc_max);
        }
        if (style.carb_min !== null && style.carb_max !== null) {
          expect(style.carb_min).toBeLessThanOrEqual(style.carb_max);
        }
        if (style.abv_min !== null && style.abv_max !== null) {
          expect(style.abv_min).toBeLessThanOrEqual(style.abv_max);
        }
      }
    });
  });
});
