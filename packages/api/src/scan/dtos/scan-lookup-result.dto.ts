import { ApiProperty } from '@nestjs/swagger';

import { ScanCatalogItemDto } from './scan-catalog-item.dto';

/**
 * Origin of the data returned by `GET /scan/lookup/:ean`.
 *
 * - `cache_hit_fresh` — row in `scan_catalog_items`, `fetched_at`
 *   younger than the TTL (or seed/manual rows that never expire).
 * - `cache_hit_stale` — row existed but `fetched_at` was older than
 *   the TTL when the lookup started, OR the upstream returned no data
 *   on this call so we degraded to the existing row. The returned
 *   `item` is the persisted row (refreshed if OFF responded with
 *   richer data, otherwise unchanged). Refresh is **synchronous** in
 *   v0.1; a background-refresh strategy may land later.
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

  @ApiProperty({
    description:
      'True when the underlying scan_catalog_items row carries a non-null raw_payload (typically OpenFoodFacts cache rows). False for seed and manual rows. The raw_payload itself is never returned to clients — see UserResponseDto + ScanCatalogItemDto Exclude rules.',
  })
  rawPayloadAvailable: boolean;
}
