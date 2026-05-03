import { Repository } from 'typeorm';

import { FermentableOrmEntity } from '../../../catalog/fermentable/entities/fermentable.orm.entity';
import { FermentableType } from '../../../catalog/fermentable/domain/enums/fermentable-type.enum';
import {
  FERMENTABLES_CATALOG_SEED,
  seedFermentablesCatalog,
} from '../fermentables-catalog.seed';
import { buildRepoMock } from '../seed-test-utils';

describe('seedFermentablesCatalog (Issue #708 / #869 — Phase 1 PR #2)', () => {
  describe('happy path', () => {
    it('inserts all 20 catalogue entries when the table is empty', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedFermentablesCatalog(
        repo as unknown as Repository<FermentableOrmEntity>,
      );

      expect(result).toEqual({ inserted: 20, updated: 0, total: 20 });
      expect(repo.create).toHaveBeenCalledTimes(20);
      expect(repo.save).toHaveBeenCalledTimes(20);
    });

    it('writes name + type + recommend_mash on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedFermentablesCatalog(
        repo as unknown as Repository<FermentableOrmEntity>,
      );

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        expect(Object.values(FermentableType)).toContain(arg.type);
        expect(typeof arg.recommend_mash).toBe('boolean');
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
          type: FermentableType.GRAIN,
        }),
      );

      const result = await seedFermentablesCatalog(
        repo as unknown as Repository<FermentableOrmEntity>,
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

      const result = await seedFermentablesCatalog(
        repo as unknown as Repository<FermentableOrmEntity>,
      );

      expect(result).toEqual({ inserted: 15, updated: 5, total: 20 });
    });

    it('respects an explicit override list (e.g. tests, alternate seed data)', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const customFermentables = FERMENTABLES_CATALOG_SEED.slice(0, 3);

      const result = await seedFermentablesCatalog(
        repo as unknown as Repository<FermentableOrmEntity>,
        customFermentables,
      );

      expect(result).toEqual({ inserted: 3, updated: 0, total: 3 });
    });

    it('exposes 20 curated catalogue entries spanning BeerXML + popular varieties', () => {
      expect(FERMENTABLES_CATALOG_SEED).toHaveLength(20);

      const names = FERMENTABLES_CATALOG_SEED.map((f) => f.name);
      // 4 BeerXML canonical
      expect(names).toContain('Acid Malt');
      expect(names).toContain('Brown Malt');
      expect(names).toContain('Munich Malt');
      expect(names).toContain('Pale Malt (2 Row) UK');
      // Popular for the demo recipes
      expect(names).toContain('Pale Ale Malt (US 2-Row)');
      expect(names).toContain('Pilsner Malt');
      expect(names).toContain('Maris Otter');
      expect(names).toContain('Wheat Malt');
      expect(names).toContain('Roasted Barley');
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-1000-...)', () => {
      const ids = FERMENTABLES_CATALOG_SEED.map((f) => f.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-1[0-9a-f]{11}$/);
      }
      // No duplicates.
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('covers each fermentable type at least once for filter sanity', () => {
      const types = new Set(FERMENTABLES_CATALOG_SEED.map((f) => f.type));
      expect(types.has(FermentableType.GRAIN)).toBe(true);
      expect(types.has(FermentableType.SUGAR)).toBe(true);
      expect(types.has(FermentableType.EXTRACT)).toBe(true);
      expect(types.has(FermentableType.ADJUNCT)).toBe(true);
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const fermentable of FERMENTABLES_CATALOG_SEED) {
        if (fermentable.notes !== null) {
          expect(fermentable.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });

    it('keeps recommend_mash false for sugars and extracts (no mash needed)', () => {
      for (const fermentable of FERMENTABLES_CATALOG_SEED) {
        if (
          fermentable.type === FermentableType.SUGAR ||
          fermentable.type === FermentableType.EXTRACT
        ) {
          expect(fermentable.recommend_mash).toBe(false);
        }
      }
    });
  });
});
