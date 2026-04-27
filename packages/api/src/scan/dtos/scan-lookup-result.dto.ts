import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ScanCatalogItemDto } from './scan-catalog-item.dto';

/**
 * Origin of the data returned by `GET /scan/lookup/:ean`.
 *
 * - `cache_hit_fresh` — row in `scan_catalog_items`, `fetched_at`
 *   younger than the TTL (or seed/manual rows that never expire).
 * - `cache_hit_stale` — row exists but `fetched_at` is older than the
 *   TTL; the response carries the cached row AND a background refresh
 *   was triggered (or will be triggered, depending on impl).
 * - `cache_miss_fetched` — no row before the call, fetched OFF
 *   successfully and persisted as `source = 'openfoodfacts'`.
 */
export type ScanLookupSource =
  | 'cache_hit_fresh'
  | 'cache_hit_stale'
  | 'cache_miss_fetched';

/**
 * Response shape of `GET /scan/lookup/:ean`.
 *
 * Wraps the catalog item itself with cache-decision metadata so the
 * mobile client can show "fetched live" vs "from local cache" when
 * useful (and so we can debug cache hit rates from the response
 * without having to inspect logs).
 */
export class ScanLookupResultDto {
  @ApiProperty({
    type: ScanCatalogItemDto,
    description:
      'The resolved catalog item (already persisted in scan_catalog_items).',
  })
  item: ScanCatalogItemDto;

  @ApiProperty({
    enum: ['cache_hit_fresh', 'cache_hit_stale', 'cache_miss_fetched'],
    description:
      'Where the data came from on this call. Lets the client surface freshness or run cache-hit-rate analytics.',
  })
  source: ScanLookupSource;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Original raw_payload kept for debugging when the entry was fetched from OpenFoodFacts. Never returned for seed/manual rows.',
  })
  rawPayloadAvailable: boolean;
}
