import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ScanCatalogItemOrmEntity } from '../entities/scan-catalog-item.orm.entity';
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
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }
}
