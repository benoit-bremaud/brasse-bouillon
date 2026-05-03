import { ApiProperty } from '@nestjs/swagger';

import { HopForm } from '../domain/enums/hop-form.enum';
import { HopOrmEntity } from '../entities/hop.orm.entity';
import { HopUsageType } from '../domain/enums/hop-usage-type.enum';

/**
 * Read-only response DTO for the hop catalogue. Mirrors the ORM
 * row shape one-to-one (no field is computed). Built via
 * `HopDto.fromEntity(entity)` rather than direct property access
 * so future shape changes (date serialisation, field renaming)
 * stay in this single conversion point.
 */
export class HopDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Cascade' })
  name: string;

  @ApiProperty({ example: 'United States', nullable: true })
  origin: string | null;

  @ApiProperty({
    example: 5.5,
    nullable: true,
    description: 'Typical alpha acid percentage at harvest',
  })
  alpha_acid_typical: number | null;

  @ApiProperty({ example: 6.0, nullable: true })
  beta_acid_typical: number | null;

  @ApiProperty({
    example: 50,
    nullable: true,
    description: 'Hop Stability Index — higher value = more stable in storage',
  })
  hop_stability_index: number | null;

  @ApiProperty({ enum: HopUsageType, example: HopUsageType.BOTH })
  usage_type: HopUsageType;

  @ApiProperty({ enum: HopForm, example: HopForm.PELLET })
  form: HopForm;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({
    format: 'uuid',
    nullable: true,
    description: 'FK to producers — brand owner of this hop variety',
  })
  producer_id: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: HopOrmEntity): HopDto {
    const dto = new HopDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.origin = entity.origin;
    dto.alpha_acid_typical = entity.alpha_acid_typical;
    dto.beta_acid_typical = entity.beta_acid_typical;
    dto.hop_stability_index = entity.hop_stability_index;
    dto.usage_type = entity.usage_type;
    dto.form = entity.form;
    dto.notes = entity.notes;
    dto.producer_id = entity.producer_id;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
