import {
  DISTRIBUTORS_CATALOG_SEED,
  seedDistributorsCatalog,
} from '../distributors-catalog.seed';
import {
  assertCommonCatalogueSeederBehaviours,
  buildRepoMock,
} from '../seed-test-utils';

import { DistributorOrmEntity } from '../../../catalog/distributor/entities/distributor.orm.entity';
import { Repository } from 'typeorm';

describe('seedDistributorsCatalog (Issue #901)', () => {
  // Standard catalogue-seeder behaviours via shared helper.
  assertCommonCatalogueSeederBehaviours('seedDistributorsCatalog', {
    fn: (repo, seeds) =>
      seedDistributorsCatalog(
        repo as unknown as Repository<DistributorOrmEntity>,
        seeds,
      ),
    data: DISTRIBUTORS_CATALOG_SEED,
  });

  describe('catalogue-specific invariants', () => {
    it('writes name + country + website + ships_to + currency_default on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedDistributorsCatalog(
        repo as unknown as Repository<DistributorOrmEntity>,
      );

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        expect(typeof arg.country).toBe('string');
        expect(typeof arg.website).toBe('string');
        // ships_to is JSON-encoded application-side
        expect(typeof arg.ships_to).toBe('string');
        expect(typeof arg.currency_default).toBe('string');
      }
    });

    it('exposes 12 curated catalogue entries spanning 5 countries (FR/BE/GB/US/DE)', () => {
      expect(DISTRIBUTORS_CATALOG_SEED).toHaveLength(12);

      const countries = new Set(
        DISTRIBUTORS_CATALOG_SEED.map((d) => d.country),
      );
      expect(countries).toContain('FR');
      expect(countries).toContain('BE');
      expect(countries).toContain('GB');
      expect(countries).toContain('US');
      expect(countries).toContain('DE');
      expect(countries.size).toBe(5);
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-9000-...)', () => {
      const ids = DISTRIBUTORS_CATALOG_SEED.map((d) => d.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-9[0-9a-f]{11}$/);
      }
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every website is HTTPS only (no http:// allowed by migration CHECK)', () => {
      for (const distributor of DISTRIBUTORS_CATALOG_SEED) {
        expect(distributor.website).toMatch(/^https:\/\//);
      }
    });

    it('every country is a valid ISO 3166-1 alpha-2 code (uppercase ASCII)', () => {
      for (const distributor of DISTRIBUTORS_CATALOG_SEED) {
        expect(distributor.country).toMatch(/^[A-Z]{2}$/);
      }
    });

    it('every currency is a valid ISO 4217 code (uppercase ASCII)', () => {
      const validCurrencies = new Set(['EUR', 'USD', 'GBP', 'CHF']);
      for (const distributor of DISTRIBUTORS_CATALOG_SEED) {
        expect(distributor.currency_default).toMatch(/^[A-Z]{3}$/);
        expect(validCurrencies).toContain(distributor.currency_default);
      }
    });

    it('every ships_to entry is a valid ISO alpha-2 code, distributor self-included', () => {
      for (const distributor of DISTRIBUTORS_CATALOG_SEED) {
        expect(distributor.ships_to.length).toBeGreaterThan(0);
        for (const code of distributor.ships_to) {
          expect(code).toMatch(/^[A-Z]{2}$/);
        }
        // A distributor should always ship to its home country.
        expect(distributor.ships_to).toContain(distributor.country);
      }
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const distributor of DISTRIBUTORS_CATALOG_SEED) {
        if (distributor.notes !== null) {
          expect(distributor.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });
  });
});
