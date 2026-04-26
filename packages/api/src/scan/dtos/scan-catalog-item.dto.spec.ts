import { ScanCatalogItemOrmEntity } from '../entities/scan-catalog-item.orm.entity';
import { ScanCatalogSource } from '../domain/enums/scan-catalog-source.enum';
import { ScanFermentationType } from '../domain/enums/scan-fermentation-type.enum';
import { ScanCatalogItemDto } from './scan-catalog-item.dto';

function buildEntity(
  overrides: Partial<ScanCatalogItemOrmEntity> = {},
): ScanCatalogItemOrmEntity {
  const base: ScanCatalogItemOrmEntity = {
    id: 'item-1',
    barcode: '5060277380011',
    name: 'Punk IPA',
    brewery: 'BrewDog',
    style: 'IPA',
    abv: 5.4,
    ibu: 35,
    color_ebc: 14,
    fermentation_type: ScanFermentationType.ALE,
    aromatic_tags: 'tropical, citrus',
    notes_source: 'BrewDog DIY Dog 2019',
    is_abv_estimated: false,
    is_ibu_estimated: false,
    is_color_ebc_estimated: false,
    is_style_estimated: false,
    source: ScanCatalogSource.SEED,
    fetched_at: null,
    raw_payload: null,
    created_at: new Date('2026-04-26T00:00:00.000Z'),
    updated_at: new Date('2026-04-26T00:00:00.000Z'),
  };
  return { ...base, ...overrides };
}

describe('ScanCatalogItemDto.fromEntity — bridge fields (Epic #693 part 3/5)', () => {
  describe('happy path', () => {
    it('maps an OpenFoodFacts cache entry with all bridge fields populated', () => {
      const fetchedAt = new Date('2026-04-26T13:30:00.000Z');
      const rawPayload = JSON.stringify({
        product: { code: '5060277380011', product_name: 'Punk IPA' },
      });
      const entity = buildEntity({
        source: ScanCatalogSource.OPENFOODFACTS,
        fetched_at: fetchedAt,
        raw_payload: rawPayload,
      });

      const dto = ScanCatalogItemDto.fromEntity(entity);

      expect(dto.source).toBe(ScanCatalogSource.OPENFOODFACTS);
      expect(dto.fetched_at).toEqual(fetchedAt);
      expect(dto.raw_payload).toBe(rawPayload);
    });
  });

  describe('sad path — defaults and nulls', () => {
    it('defaults source to SEED and propagates null fetched_at / raw_payload for shipped data', () => {
      const entity = buildEntity();

      const dto = ScanCatalogItemDto.fromEntity(entity);

      expect(dto.source).toBe(ScanCatalogSource.SEED);
      expect(dto.fetched_at).toBeNull();
      expect(dto.raw_payload).toBeNull();
    });

    it('handles a manual admin insert with null cache metadata', () => {
      const entity = buildEntity({
        source: ScanCatalogSource.MANUAL,
        fetched_at: null,
        raw_payload: null,
      });

      const dto = ScanCatalogItemDto.fromEntity(entity);

      expect(dto.source).toBe(ScanCatalogSource.MANUAL);
      expect(dto.fetched_at).toBeNull();
      expect(dto.raw_payload).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('preserves a stale OFF cache entry (fetched_at older than 1 h) without mutation', () => {
      const stale = new Date('2026-04-25T08:00:00.000Z');
      const entity = buildEntity({
        source: ScanCatalogSource.OPENFOODFACTS,
        fetched_at: stale,
        raw_payload: '{"stale":true}',
      });

      const dto = ScanCatalogItemDto.fromEntity(entity);

      expect(dto.fetched_at).toEqual(stale);
      expect(dto.raw_payload).toBe('{"stale":true}');
    });

    it('preserves a very large raw_payload without truncation', () => {
      const big = JSON.stringify({ huge: 'x'.repeat(50_000) });
      const entity = buildEntity({
        source: ScanCatalogSource.OPENFOODFACTS,
        fetched_at: new Date('2026-04-26T13:00:00.000Z'),
        raw_payload: big,
      });

      const dto = ScanCatalogItemDto.fromEntity(entity);

      expect(dto.raw_payload).toBe(big);
      expect(dto.raw_payload?.length).toBe(big.length);
    });

    it('exposes the canonical enum values for source', () => {
      expect(Object.values(ScanCatalogSource)).toEqual(
        expect.arrayContaining(['seed', 'openfoodfacts', 'manual']),
      );
    });
  });
});
