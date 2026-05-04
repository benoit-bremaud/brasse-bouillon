import { ApiProperty } from '@nestjs/swagger';

import { DistributorDto } from './distributor.dto';

/**
 * Response shape for the per-catalogue distributor sub-route
 * (`GET /catalog/<x>/:id/distributors`). Identical shape across
 * the 5 catalogues — one per junction table — so it lives here
 * once instead of being duplicated 5×.
 *
 * Each row = "this distributor sells this catalogue entry,
 * here's the outbound product URL". The full distributor info
 * is nested so the boutique mobile screen can display country
 * flag + currency + ships_to badges in one round-trip.
 *
 * No `created_at`/`updated_at` on the link itself — they're
 * audit fields without business value for the picker UI.
 */
export class CatalogDistributorLinkDto {
  @ApiProperty({ type: DistributorDto })
  distributor: DistributorDto;

  @ApiProperty({
    example: 'https://www.brouwland.com/en/citra-pellets-100g',
    description:
      'Outbound deeplink to this distributor’s product page for the ' +
      'catalogue entry. Always https://.',
  })
  product_url: string;

  @ApiProperty({
    nullable: true,
    example: 'BRW-CITRA-100',
    description: 'Distributor-specific SKU when available',
  })
  sku: string | null;

  @ApiProperty({ nullable: true })
  notes_per_distributor: string | null;
}

/**
 * Shape of a junction row with its distributor relation eagerly
 * loaded. Used by the per-catalogue services to type the result
 * of `find({ relations: ['distributor'] })` before mapping to
 * the DTO above.
 */
export interface CatalogDistributorJunctionRow {
  distributor_id: string;
  product_url: string;
  sku: string | null;
  notes_per_distributor: string | null;
  distributor: import('../entities/distributor.orm.entity').DistributorOrmEntity;
}

/**
 * Maps one junction row to the wire DTO. The 5 services that
 * expose `getDistributors(catalogueId)` call this exact mapper
 * — keeps the wire shape consistent and the conversion in one
 * place.
 */
export function mapJunctionRowToDto(
  row: CatalogDistributorJunctionRow,
): CatalogDistributorLinkDto {
  const dto = new CatalogDistributorLinkDto();
  dto.distributor = DistributorDto.fromEntity(row.distributor);
  dto.product_url = row.product_url;
  dto.sku = row.sku;
  dto.notes_per_distributor = row.notes_per_distributor;
  return dto;
}
