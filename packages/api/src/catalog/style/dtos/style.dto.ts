import { ApiProperty } from '@nestjs/swagger';

import { StyleOrmEntity } from '../entities/style.orm.entity';
import { StyleType } from '../domain/enums/style-type.enum';

/**
 * Read-only response DTO for the BJCP style catalogue. Mirrors
 * the ORM row shape one-to-one (no field is computed). Built via
 * `StyleDto.fromEntity(entity)` rather than direct property access
 * so future shape changes (date serialisation, field renaming)
 * stay in this single conversion point.
 */
export class StyleDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'American IPA' })
  name: string;

  @ApiProperty({ example: 'IPA' })
  category: string;

  @ApiProperty({ example: 21 })
  category_number: number;

  @ApiProperty({ example: 'A' })
  style_letter: string;

  @ApiProperty({ example: 'BJCP 2021' })
  style_guide: string;

  @ApiProperty({ enum: StyleType, example: StyleType.ALE })
  type: StyleType;

  @ApiProperty({ example: 1.056, nullable: true })
  og_min: number | null;

  @ApiProperty({ example: 1.07, nullable: true })
  og_max: number | null;

  @ApiProperty({ example: 1.008, nullable: true })
  fg_min: number | null;

  @ApiProperty({ example: 1.014, nullable: true })
  fg_max: number | null;

  @ApiProperty({ example: 40, nullable: true })
  ibu_min: number | null;

  @ApiProperty({ example: 70, nullable: true })
  ibu_max: number | null;

  @ApiProperty({
    example: 12,
    nullable: true,
    description: 'Lower bound of the colour range in EBC (SRM × 1.97)',
  })
  color_ebc_min: number | null;

  @ApiProperty({ example: 28, nullable: true })
  color_ebc_max: number | null;

  @ApiProperty({
    example: 2.2,
    nullable: true,
    description: 'Lower bound of carbonation in volumes of CO2',
  })
  carb_min: number | null;

  @ApiProperty({ example: 2.7, nullable: true })
  carb_max: number | null;

  @ApiProperty({ example: 5.5, nullable: true })
  abv_min: number | null;

  @ApiProperty({ example: 7.5, nullable: true })
  abv_max: number | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Sensory profile (appearance, aroma, flavour, mouthfeel)',
  })
  profile: string | null;

  @ApiProperty({ nullable: true })
  ingredients: string | null;

  @ApiProperty({ nullable: true })
  examples: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: StyleOrmEntity): StyleDto {
    const dto = new StyleDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.category = entity.category;
    dto.category_number = entity.category_number;
    dto.style_letter = entity.style_letter;
    dto.style_guide = entity.style_guide;
    dto.type = entity.type;
    dto.og_min = entity.og_min;
    dto.og_max = entity.og_max;
    dto.fg_min = entity.fg_min;
    dto.fg_max = entity.fg_max;
    dto.ibu_min = entity.ibu_min;
    dto.ibu_max = entity.ibu_max;
    dto.color_ebc_min = entity.color_ebc_min;
    dto.color_ebc_max = entity.color_ebc_max;
    dto.carb_min = entity.carb_min;
    dto.carb_max = entity.carb_max;
    dto.abv_min = entity.abv_min;
    dto.abv_max = entity.abv_max;
    dto.notes = entity.notes;
    dto.profile = entity.profile;
    dto.ingredients = entity.ingredients;
    dto.examples = entity.examples;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
