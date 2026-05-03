import { Repository } from 'typeorm';

import { HopForm } from '../../../catalog/hop/domain/enums/hop-form.enum';
import { HopOrmEntity } from '../../../catalog/hop/entities/hop.orm.entity';
import { HopUsageType } from '../../../catalog/hop/domain/enums/hop-usage-type.enum';
import { HOPS_CATALOG_SEED, seedHopsCatalog } from '../hops-catalog.seed';
import { buildRepoMock } from '../seed-test-utils';

describe('seedHopsCatalog (Issue #708 / #869 — Phase 1 PR #1)', () => {
  describe('happy path', () => {
    it('inserts all 20 catalogue entries when the table is empty', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedHopsCatalog(
        repo as unknown as Repository<HopOrmEntity>,
      );

      expect(result).toEqual({ inserted: 20, updated: 0, total: 20 });
      expect(repo.create).toHaveBeenCalledTimes(20);
      expect(repo.save).toHaveBeenCalledTimes(20);
    });

    it('writes name + usage_type + form on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedHopsCatalog(repo as unknown as Repository<HopOrmEntity>);

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        expect(Object.values(HopUsageType)).toContain(arg.usage_type);
        expect(Object.values(HopForm)).toContain(arg.form);
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
          alpha_acid_typical: 0,
        }),
      );

      const result = await seedHopsCatalog(
        repo as unknown as Repository<HopOrmEntity>,
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
        // First 5 already exist, last 15 do not.
        return Promise.resolve(
          counter <= 5 ? { id: `existing-${counter}` } : null,
        );
      });

      const result = await seedHopsCatalog(
        repo as unknown as Repository<HopOrmEntity>,
      );

      expect(result).toEqual({ inserted: 15, updated: 5, total: 20 });
    });

    it('respects an explicit override list (e.g. tests, alternate seed data)', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const customHops = HOPS_CATALOG_SEED.slice(0, 3);

      const result = await seedHopsCatalog(
        repo as unknown as Repository<HopOrmEntity>,
        customHops,
      );

      expect(result).toEqual({ inserted: 3, updated: 0, total: 3 });
    });

    it('exposes 20 curated catalogue entries spanning BeerXML + popular varieties', () => {
      expect(HOPS_CATALOG_SEED).toHaveLength(20);

      const names = HOPS_CATALOG_SEED.map((h) => h.name);
      // 5 BeerXML canonical
      expect(names).toContain('Cascade');
      expect(names).toContain('Galena');
      expect(names).toContain('Goldings, B.C.');
      expect(names).toContain('Northern Brewer');
      expect(names).toContain('Tettnang');
      // 15 popular for demo recipes
      expect(names).toContain('Citra');
      expect(names).toContain('Mosaic');
      expect(names).toContain('Magnum');
      expect(names).toContain('Saaz');
      expect(names).toContain('East Kent Goldings');
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-...)', () => {
      const ids = HOPS_CATALOG_SEED.map((h) => h.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-[0-9a-f]{12}$/);
      }
      // No duplicates.
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('covers each usage_type at least once for filter sanity', () => {
      const usages = new Set(HOPS_CATALOG_SEED.map((h) => h.usage_type));
      expect(usages.has(HopUsageType.BITTERING)).toBe(true);
      expect(usages.has(HopUsageType.AROMA)).toBe(true);
      expect(usages.has(HopUsageType.BOTH)).toBe(true);
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      // Sanity check: the catalogue notes feed the mobile UI directly,
      // so they must follow the French-UI convention. Cheap heuristic:
      // every non-null note contains at least one French diacritic.
      for (const hop of HOPS_CATALOG_SEED) {
        if (hop.notes !== null) {
          expect(hop.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });
  });
});
