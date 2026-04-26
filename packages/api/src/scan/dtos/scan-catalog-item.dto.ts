import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ScanCatalogItemOrmEntity } from '../entities/scan-catalog-item.orm.entity';
import { ScanCatalogSource } from '../domain/enums/scan-catalog-source.enum';
import { ScanFermentationType } from '../domain/enums/scan-fermentation-type.enum';

export class ScanCatalogItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  barcode: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  brewery: string;

  @ApiProperty()
  style: string;

  @ApiPropertyOptional({ nullable: true })
  abv?: number | null;

  @ApiPropertyOptional({ nullable: true })
  ibu?: number | null;

  @ApiPropertyOptional({ nullable: true })
  color_ebc?: number | null;

  @ApiProperty({ enum: ScanFermentationType })
  fermentation_type: ScanFermentationType;

  @ApiPropertyOptional({ nullable: true })
  aromatic_tags?: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes_source?: string | null;

  @ApiProperty()
  is_abv_estimated: boolean;

  @ApiProperty()
  is_ibu_estimated: boolean;

  @ApiProperty()
  is_color_ebc_estimated: boolean;

  @ApiProperty()
  is_style_estimated: boolean;

  // OpenFoodFacts cache bridge fields (Epic #693 part 3/5).
  @ApiProperty({
    enum: ScanCatalogSource,
    description:
      'Provenance of the catalog entry: seed (shipped data), openfoodfacts (proxy cache), manual (admin insert).',
  })
  source: ScanCatalogSource;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Last successful upstream fetch timestamp. Drives the 1-hour cache TTL. Null for seed and fresh manual entries.',
  })
  fetched_at?: Date | null;

  @ApiPropertyOptional({
    nullable: true,
    description:
      'Raw upstream payload (JSON serialized as TEXT). Stored for debugging and re-derivation if parsing logic evolves.',
  })
  raw_payload?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(entity: ScanCatalogItemOrmEntity): ScanCatalogItemDto {
    return {
      id: entity.id,
      barcode: entity.barcode,
      name: entity.name,
      brewery: entity.brewery,
      style: entity.style,
      abv: entity.abv ?? null,
      ibu: entity.ibu ?? null,
      color_ebc: entity.color_ebc ?? null,
      fermentation_type: entity.fermentation_type,
      aromatic_tags: entity.aromatic_tags ?? null,
      notes_source: entity.notes_source ?? null,
      is_abv_estimated: entity.is_abv_estimated,
      is_ibu_estimated: entity.is_ibu_estimated,
      is_color_ebc_estimated: entity.is_color_ebc_estimated,
      is_style_estimated: entity.is_style_estimated,
      source: entity.source,
      fetched_at: entity.fetched_at ?? null,
      raw_payload: entity.raw_payload ?? null,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}
