import { ApiProperty } from '@nestjs/swagger';

import { FermentableOrmEntity } from '../entities/fermentable.orm.entity';
import { FermentableType } from '../domain/enums/fermentable-type.enum';

/**
 * Read-only response DTO for the fermentable catalogue. Mirrors
 * the ORM row shape one-to-one (no field is computed). Built via
 * `FermentableDto.fromEntity(entity)` rather than direct property
 * access so future shape changes (date serialisation, field
 * renaming) stay in this single conversion point.
 */
export class FermentableDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Pale Ale Malt (US 2-Row)' })
  name: string;

  @ApiProperty({ enum: FermentableType, example: FermentableType.GRAIN })
  type: FermentableType;

  @ApiProperty({ example: 'United States', nullable: true })
  origin: string | null;

  @ApiProperty({
    example: 5.9,
    nullable: true,
    description: 'Typical colour in EBC (SRM × 1.97)',
  })
  color_ebc_typical: number | null;

  @ApiProperty({
    example: 1.037,
    nullable: true,
    description: 'Specific gravity per pound in 1 gallon (BeerXML POTENTIAL)',
  })
  potential_gravity_typical: number | null;

  @ApiProperty({ example: 80, nullable: true })
  yield_percent_typical: number | null;

  @ApiProperty({
    example: 100,
    nullable: true,
    description: 'Enzymatic power in lintner units (0 for non-grain)',
  })
  diastatic_power_lintner: number | null;

  @ApiProperty({
    example: 100,
    nullable: true,
    description: 'Recommended cap as percentage of the grain bill',
  })
  max_in_batch_percent: number | null;

  @ApiProperty({
    example: true,
    description: 'Whether the fermentable must pass through the mash',
  })
  recommend_mash: boolean;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description: 'FK to producers — maltster brand of this fermentable',
  })
  producer_id: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: FermentableOrmEntity): FermentableDto {
    const dto = new FermentableDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.origin = entity.origin;
    dto.color_ebc_typical = entity.color_ebc_typical;
    dto.potential_gravity_typical = entity.potential_gravity_typical;
    dto.yield_percent_typical = entity.yield_percent_typical;
    dto.diastatic_power_lintner = entity.diastatic_power_lintner;
    dto.max_in_batch_percent = entity.max_in_batch_percent;
    dto.recommend_mash = entity.recommend_mash;
    dto.notes = entity.notes;
    dto.producer_id = entity.producer_id;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
