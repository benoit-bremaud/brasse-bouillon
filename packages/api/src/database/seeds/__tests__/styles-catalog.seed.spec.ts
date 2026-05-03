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

    it('tags every wheat-forward style as WHEAT (American Wheat, Witbier, Hefeweizen)', () => {
      // The WHEAT enum value covers every style brewed with a
      // wheat-malt-forward grist. Misclassifying any of them as
      // ALE / MIXED would hide it from the `?type=wheat` filter
      // path. Targeted assertion (not just "at least one wheat
      // exists") so a future re-classification slip is caught.
      const americanWheat = STYLES_CATALOG_SEED.find(
        (s) => s.name === 'American Wheat',
      );
      const witbier = STYLES_CATALOG_SEED.find((s) => s.name === 'Witbier');
      const hefeweizen = STYLES_CATALOG_SEED.find(
        (s) => s.name === 'Hefeweizen',
      );
      expect(americanWheat?.type).toBe(StyleType.WHEAT);
      expect(witbier?.type).toBe(StyleType.WHEAT);
      expect(hefeweizen?.type).toBe(StyleType.WHEAT);
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const style of STYLES_CATALOG_SEED) {
        if (style.notes !== null) {
          expect(style.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });

    it('ensures every metric range has min ≤ max when both bounds are set', () => {
      // Cheap helper: skip the assertion silently when either bound
      // is null (range not specified for this style), assert min ≤
      // max otherwise. Keeps the test's cognitive complexity under
      // SonarLint's 15-branch limit while still covering all 6 BJCP
      // metric dimensions for all 20 styles.
      const expectMinLeMax = (min: number | null, max: number | null): void => {
        if (min !== null && max !== null) {
          expect(min).toBeLessThanOrEqual(max);
        }
      };

      for (const style of STYLES_CATALOG_SEED) {
        expectMinLeMax(style.og_min, style.og_max);
        expectMinLeMax(style.fg_min, style.fg_max);
        expectMinLeMax(style.ibu_min, style.ibu_max);
        expectMinLeMax(style.color_ebc_min, style.color_ebc_max);
        expectMinLeMax(style.carb_min, style.carb_max);
        expectMinLeMax(style.abv_min, style.abv_max);
      }
    });
  });
});
