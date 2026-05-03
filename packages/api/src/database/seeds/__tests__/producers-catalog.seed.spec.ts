import {
  PRODUCERS_CATALOG_SEED,
  seedProducersCatalog,
} from '../producers-catalog.seed';
import {
  assertCommonCatalogueSeederBehaviours,
  buildRepoMock,
} from '../seed-test-utils';

import { ProducerOrmEntity } from '../../../catalog/producer/entities/producer.orm.entity';
import { ProducerType } from '../../../catalog/producer/domain/producer.types';
import { Repository } from 'typeorm';

describe('seedProducersCatalog (Issue #900)', () => {
  // The four standard catalogue-seeder behaviours (happy / sad /
  // mixed / override-list) live in the shared helper to satisfy
  // SonarCloud's duplication gate — see seed-test-utils.ts.
  assertCommonCatalogueSeederBehaviours('seedProducersCatalog', {
    fn: (repo, seeds) =>
      seedProducersCatalog(
        repo as unknown as Repository<ProducerOrmEntity>,
        seeds,
      ),
    data: PRODUCERS_CATALOG_SEED,
  });

  describe('catalogue-specific invariants', () => {
    it('writes name + type on every inserted row', async () => {
      const repo = buildRepoMock();
      repo.findOne.mockResolvedValue(null);

      await seedProducersCatalog(
        repo as unknown as Repository<ProducerOrmEntity>,
      );

      for (const call of repo.create.mock.calls as unknown[][]) {
        const arg = call[0] as Record<string, unknown>;
        expect(typeof arg.name).toBe('string');
        expect((arg.name as string).length).toBeGreaterThan(0);
        expect(Object.values(ProducerType)).toContain(arg.type);
      }
    });

    it('exposes 17 curated catalogue entries', () => {
      expect(PRODUCERS_CATALOG_SEED).toHaveLength(17);
    });

    it('uses deterministic UUIDs in the catalogue range (...-9000-8000-...)', () => {
      const ids = PRODUCERS_CATALOG_SEED.map((p) => p.id);
      for (const id of ids) {
        expect(id).toMatch(/^00000000-0000-4000-9000-8[0-9a-f]{11}$/);
      }
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('covers every ProducerType at least once', () => {
      // The picker UI will offer a TYPE filter — every category
      // must have at least one entry from day one so the filter
      // chips never look empty. Copilot caught the missing
      // ProducerType.Other on PR #902 review — Brouwland (BE
      // generalist distributor + own-brand items) added.
      const types = new Set(PRODUCERS_CATALOG_SEED.map((p) => p.type));
      expect(types).toContain(ProducerType.Laboratory);
      expect(types).toContain(ProducerType.Maltster);
      expect(types).toContain(ProducerType.HopSupplier);
      expect(types).toContain(ProducerType.EquipmentManufacturer);
      expect(types).toContain(ProducerType.Other);
    });

    it('keeps every country code as 2 ASCII uppercase letters', () => {
      // ISO 3166-1 alpha-2 invariant. Catches typos like "Usa"
      // or "U.S." or unicode "ÅB" before they hit the DB.
      for (const producer of PRODUCERS_CATALOG_SEED) {
        if (producer.country !== null) {
          expect(producer.country).toMatch(/^[A-Z]{2}$/);
          expect(producer.country.length).toBe(2);
        }
      }
    });

    it('keeps every notes value in French (UI-facing convention)', () => {
      for (const producer of PRODUCERS_CATALOG_SEED) {
        if (producer.notes !== null) {
          expect(producer.notes).toMatch(/[àâäéèêëïîôöùûüÿç]/i);
        }
      }
    });

    it('matches yeast.laboratory legacy strings (mode-prudent FK migration)', () => {
      // The yeast catalogue (PR #890) currently stores the
      // laboratory as a free-text varchar. To enable a clean
      // future cleanup PR (drop laboratory, populate producer_id
      // via lookup), the producer.name strings here MUST match
      // the existing yeast.laboratory values verbatim.
      const expectedLabNames = [
        'Wyeast Labs',
        'White Labs',
        'Fermentis',
        'Lallemand',
        'Imperial Yeast',
      ];
      const actualNames = new Set(PRODUCERS_CATALOG_SEED.map((p) => p.name));
      for (const expected of expectedLabNames) {
        expect(actualNames).toContain(expected);
      }
    });
  });
});
