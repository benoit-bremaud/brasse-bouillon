import { ApiProperty } from '@nestjs/swagger';

import { DistributorOrmEntity } from '../entities/distributor.orm.entity';

/**
 * Read-only response DTO for the distributor catalogue.
 * Built via `DistributorDto.fromEntity(entity)` so future shape
 * changes (date serialisation, joined surfaces on the per-
 * catalogue `:id/distributors` endpoints) stay in this single
 * conversion point.
 *
 * `ships_to` is decoded from its JSON-encoded TEXT storage form
 * back into a string array on the wire — the API consumer never
 * sees the raw JSON string.
 */
export class DistributorDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Brouwland' })
  name: string;

  @ApiProperty({ example: 'BE', description: 'ISO 3166-1 alpha-2' })
  country: string;

  @ApiProperty({ example: 'https://www.brouwland.com' })
  website: string;

  @ApiProperty({
    type: [String],
    example: ['FR', 'BE', 'LU', 'CH'],
    description: 'ISO 3166-1 alpha-2 country codes the distributor ships to',
  })
  ships_to: string[];

  @ApiProperty({ example: 'EUR', description: 'ISO 4217 currency code' })
  currency_default: string;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: DistributorOrmEntity): DistributorDto {
    const dto = new DistributorDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.country = entity.country;
    dto.website = entity.website;
    dto.ships_to = parseShipsTo(entity.ships_to);
    dto.currency_default = entity.currency_default;
    dto.notes = entity.notes;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}

/**
 * Defensive JSON decoder for the `ships_to` TEXT column.
 * Returns an empty array on any parse failure (corrupted row,
 * legacy NULL slipped through) rather than throwing — the
 * boutique surface degrades gracefully (no shipping hint
 * shown) instead of 500-ing the entire endpoint.
 */
function parseShipsTo(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    return [];
  }
}
