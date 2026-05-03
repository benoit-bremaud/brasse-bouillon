import { Repository } from 'typeorm';

import { YEASTS_CATALOG_SEED, seedYeastsCatalog } from '../yeasts-catalog.seed';
import { YeastFlocculation } from '../../../catalog/yeast/domain/enums/yeast-flocculation.enum';
import { YeastForm } from '../../../catalog/yeast/domain/enums/yeast-form.enum';
import { YeastOrmEntity } from '../../../catalog/yeast/entities/yeast.orm.entity';
import { YeastType } from '../../../catalog/yeast/domain/enums/yeast-type.enum';
import { buildRepoMock } from '../seed-test-utils';

describe('seedYeastsCatalog (Issue #708 / #869 — Phase 1 PR #3)', () => {
  describe('happy path', () => {
    it('inserts all 20 catalogue entries when the table is empty', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedYeastsCatalog(
        repo as unknown as Repository<YeastOrmEntity>,
      );

      expect(result).toEqual({ inserted: 20, updated: 0, total: 20 });
      expect(repo.create).toHaveBeenCalledTimes(20);
      expect(repo.save).toHaveBeenCalledTimes(20);
    });

    it('writes name + type + form on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedYeastsCatalog(repo as unknown as Repository<YeastOrmEntity>);

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        expect(Object.values(YeastType)).toContain(arg.type);
        expect(Object.values(YeastForm)).toContain(arg.form);
      }
    });
  });

  describe('idempotency (sad path)', () => {
    it('updates existing rows in place rather than duplicating them', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockImplementation(() =>
        Promise.resolve({
          id: 'will-be-overwritten',
          name: 'old-name',
          type: YeastType.ALE,
        }),
      );

      const result = await seedYeastsCatalog(
        repo as unknown as Repository<YeastOrmEntity>,
      );

      expect(result).toEqual({ inserted: 0, updated: 20, total: 20 });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledTimes(20);
    });
  });

  describe('edge cases', () => {
    it('mixes inserts and updates when only some IDs already exist', async () => {
      const repo = buildRepoMock();
      let counter = 0;
      repo.findOne.mockImplementation(() => {
        counter += 1;
        return Promise.resolve(
          counter <= 5 ? { id: `existing-${counter}` } : null,
        );
      });

      const result = await seedYeastsCatalog(
        repo as unknown as Repository<YeastOrmEntity>,
      );

      expect(result).toEqual({ inserted: 15, updated: 5, total: 20 });
    });

    it('respects an explicit override list', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const customYeasts = YEASTS_CATALOG_SEED.slice(0, 3);

      const result = await seedYeastsCatalog(
        repo as unknown as Repository<YeastOrmEntity>,
        customYeasts,
      );

      expect(result).toEqual({ inserted: 3, updated: 0, total: 3 });
    });

    it('exposes 20 curated catalogue entries spanning BeerXML + popular industry products', () => {
      expect(YEASTS_CATALOG_SEED).toHaveLength(20);

      const names = YEASTS_CATALOG_SEED.map((y) => y.name);
      // 5 BeerXML canonical
      expect(names).toContain('English Ale (WLP002)');
      expect(names).toContain('European Ale (WLP011)');
      expect(names).toContain('Irish Ale (Wyeast 1084)');
      expect(names).toContain('Kölsch (Wyeast 2565)');
      expect(names).toContain('Northwest Ale (Wyeast 1332)');
      // Popular for the demo recipes
      expect(names).toContain('Safale US-05');
      expect(names).toContain('Safale S-04');
      expect(names).toContain('Saflager W-34/70');
      expect(names).toContain('Weihenstephan Weizen (Wyeast 3068)');
      expect(names).toContain('London Ale III (Wyeast 1318)');
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-2000-...)', () => {
      const ids = YEASTS_CATALOG_SEED.map((y) => y.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-2[0-9a-f]{11}$/);
      }
      // No duplicates.
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('covers every yeast type that has at least one demo entry (ale/lager/wheat)', () => {
      const types = new Set(YEASTS_CATALOG_SEED.map((y) => y.type));
      expect(types.has(YeastType.ALE)).toBe(true);
      expect(types.has(YeastType.LAGER)).toBe(true);
      expect(types.has(YeastType.WHEAT)).toBe(true);
      // WILD intentionally absent — Brett / sour strains will land
      // when Phase 1 stabilises and we need them for sour recipes.
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const yeast of YEASTS_CATALOG_SEED) {
        if (yeast.notes !== null) {
          expect(yeast.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });

    it('covers the major laboratories (White Labs, Wyeast, Fermentis, Lallemand, Imperial Yeast)', () => {
      const labs = new Set(
        YEASTS_CATALOG_SEED.map((y) => y.laboratory).filter(
          (lab): lab is string => lab !== null,
        ),
      );
      expect(labs).toContain('White Labs');
      expect(labs).toContain('Wyeast Labs');
      expect(labs).toContain('Fermentis');
      expect(labs).toContain('Lallemand');
      expect(labs).toContain('Imperial Yeast');
    });

    it('uses valid flocculation enum values when set', () => {
      for (const yeast of YEASTS_CATALOG_SEED) {
        if (yeast.flocculation !== null) {
          expect(Object.values(YeastFlocculation)).toContain(
            yeast.flocculation,
          );
        }
      }
    });
  });
});
