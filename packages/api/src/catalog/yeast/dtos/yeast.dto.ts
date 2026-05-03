import { ApiProperty } from '@nestjs/swagger';

import { YeastFlocculation } from '../domain/enums/yeast-flocculation.enum';
import { YeastForm } from '../domain/enums/yeast-form.enum';
import { YeastOrmEntity } from '../entities/yeast.orm.entity';
import { YeastType } from '../domain/enums/yeast-type.enum';

/**
 * Read-only response DTO for the yeast catalogue. Mirrors the ORM
 * row shape one-to-one (no field is computed). Built via
 * `YeastDto.fromEntity(entity)` rather than direct property access
 * so future shape changes (date serialisation, field renaming)
 * stay in this single conversion point.
 */
export class YeastDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Safale US-05' })
  name: string;

  @ApiProperty({ enum: YeastType, example: YeastType.ALE })
  type: YeastType;

  @ApiProperty({ enum: YeastForm, example: YeastForm.DRY })
  form: YeastForm;

  @ApiProperty({
    example: 'US-05',
    nullable: true,
    description:
      'Manufacturer SKU recognisable by brewers worldwide ' +
      '(WLP002, 1056, US-05). Renamed from `product_id` to ' +
      '`product_code` on Issue #904 cleanup.',
  })
  product_code: string | null;

  @ApiProperty({ example: 15, nullable: true })
  min_temperature_c: number | null;

  @ApiProperty({ example: 22, nullable: true })
  max_temperature_c: number | null;

  @ApiProperty({
    enum: YeastFlocculation,
    example: YeastFlocculation.MEDIUM,
    nullable: true,
  })
  flocculation: YeastFlocculation | null;

  @ApiProperty({
    example: 81,
    nullable: true,
    description: 'Typical apparent attenuation in percent',
  })
  attenuation_percent_typical: number | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description:
      'FK to producers — laboratory brand. Sole producer-related ' +
      'field since Issue #904 cleanup dropped the legacy ' +
      '`laboratory` varchar.',
  })
  producer_id: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: YeastOrmEntity): YeastDto {
    const dto = new YeastDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.form = entity.form;
    dto.product_code = entity.product_code;
    dto.min_temperature_c = entity.min_temperature_c;
    dto.max_temperature_c = entity.max_temperature_c;
    dto.flocculation = entity.flocculation;
    dto.attenuation_percent_typical = entity.attenuation_percent_typical;
    dto.notes = entity.notes;
    dto.producer_id = entity.producer_id;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
