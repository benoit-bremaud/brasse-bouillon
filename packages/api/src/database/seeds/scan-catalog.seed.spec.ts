import { Repository } from 'typeorm';

import { ScanCatalogItemOrmEntity } from '../../scan/entities/scan-catalog-item.orm.entity';
import { ScanCatalogSource } from '../../scan/domain/enums/scan-catalog-source.enum';
import { SCAN_CATALOG_SEED_BEERS, seedScanCatalog } from './scan-catalog.seed';

type RepoMock = {
  findOne: jest.Mock;
  create: jest.Mock;
  save: jest.Mock;
};

function buildRepoMock(): RepoMock {
  return {
    findOne: jest.fn(),
    create: jest.fn((input: unknown) => input),
    save: jest.fn((input: unknown) => Promise.resolve(input)),
  };
}

describe('seedScanCatalog (Epic #693 part 5/5)', () => {
  describe('happy path', () => {
    it('inserts all 6 demo beers when the table is empty', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const result = await seedScanCatalog(
        repo as unknown as Repository<ScanCatalogItemOrmEntity>,
      );

      expect(result).toEqual({ inserted: 6, updated: 0, total: 6 });
      expect(repo.create).toHaveBeenCalledTimes(6);
      expect(repo.save).toHaveBeenCalledTimes(6);
    });

    it('tags every inserted row with source = seed and clears cache fields', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedScanCatalog(
        repo as unknown as Repository<ScanCatalogItemOrmEntity>,
      );

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(arg.source).toBe(ScanCatalogSource.SEED);
        expect(arg.fetched_at).toBeNull();
        expect(arg.raw_payload).toBeNull();
      }
    });
  });

  describe('idempotency (sad path)', () => {
    it('updates existing rows in place rather than duplicating them', async () => {
      const repo = buildRepoMock();
      // Every barcode lookup returns an existing row.
      repo.findOne.mockImplementation(() =>
        Promise.resolve({
          id: 'existing-id',
          barcode: 'will-be-overwritten',
          name: 'old-name',
        }),
      );

      const result = await seedScanCatalog(
        repo as unknown as Repository<ScanCatalogItemOrmEntity>,
      );

      expect(result).toEqual({ inserted: 0, updated: 6, total: 6 });
      expect(repo.create).not.toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalledTimes(6);
    });

    it('forces source back to seed when overwriting an existing row that drifted', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockImplementation(() =>
        Promise.resolve({
          id: 'existing-id',
          source: ScanCatalogSource.OPENFOODFACTS,
          fetched_at: new Date('2026-01-01'),
          raw_payload: '{"stale":true}',
        }),
      );

      await seedScanCatalog(
        repo as unknown as Repository<ScanCatalogItemOrmEntity>,
      );

      const firstSavedCall = repo.save.mock.calls[0] as unknown[];
      const savedCall = firstSavedCall[0] as Record<string, unknown>;
      expect(savedCall.source).toBe(ScanCatalogSource.SEED);
      expect(savedCall.fetched_at).toBeNull();
      expect(savedCall.raw_payload).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('mixes inserts and updates when only some barcodes already exist', async () => {
      const repo = buildRepoMock();
      // First three barcodes exist, last three do not.
      let counter = 0;
      repo.findOne.mockImplementation(() => {
        counter += 1;
        return Promise.resolve(
          counter <= 3
            ? { id: `existing-${counter}`, barcode: `barcode-${counter}` }
            : null,
        );
      });

      const result = await seedScanCatalog(
        repo as unknown as Repository<ScanCatalogItemOrmEntity>,
      );

      expect(result).toEqual({ inserted: 3, updated: 3, total: 6 });
    });

    it('respects an explicit override list (e.g. tests, alternate demo data)', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      const customBeers = SCAN_CATALOG_SEED_BEERS.slice(0, 2);

      const result = await seedScanCatalog(
        repo as unknown as Repository<ScanCatalogItemOrmEntity>,
        customBeers,
      );

      expect(result).toEqual({ inserted: 2, updated: 0, total: 2 });
    });

    it('exposes 6 demo beers covering Punk IPA + 5 Belgian classics', () => {
      expect(SCAN_CATALOG_SEED_BEERS).toHaveLength(6);
      const names = SCAN_CATALOG_SEED_BEERS.map((b) => b.name);
      expect(names).toContain('Punk IPA');
      expect(names).toContain('La Chouffe');
      expect(names).toContain('Rochefort 10');
      expect(names).toContain('Karmeliet Tripel');
    });
  });
});
