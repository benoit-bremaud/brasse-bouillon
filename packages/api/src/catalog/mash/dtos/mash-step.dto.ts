import { ApiProperty } from '@nestjs/swagger';

import { MashStepOrmEntity } from '../entities/mash-step.orm.entity';
import { MashStepType } from '../domain/enums/mash-step-type.enum';

/**
 * Read-only response DTO for a single mash step. Embedded inside
 * the `MashProfileDto.steps` array — typically not returned on its
 * own. Mirrors the ORM row shape one-to-one.
 */
export class MashStepDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  mash_profile_id: string;

  @ApiProperty({ example: 1, description: '1-based ordering position' })
  step_index: number;

  @ApiProperty({ example: 'Saccharification' })
  name: string;

  @ApiProperty({ enum: MashStepType, example: MashStepType.INFUSION })
  type: MashStepType;

  @ApiProperty({ example: 60, nullable: true })
  step_time_min: number | null;

  @ApiProperty({ example: 65.5, nullable: true })
  step_temp_c: number | null;

  @ApiProperty({ example: 2, nullable: true })
  ramp_time_min: number | null;

  @ApiProperty({ example: 65.5, nullable: true })
  end_temp_c: number | null;

  @ApiProperty({ example: 12.5, nullable: true })
  infuse_amount_l: number | null;

  @ApiProperty({ example: 72, nullable: true })
  infuse_temp_c: number | null;

  @ApiProperty({ example: null, nullable: true })
  decoction_amount_l: number | null;

  @ApiProperty({
    example: 3,
    nullable: true,
    description: 'Water-to-grain ratio in litres per kilogram',
  })
  water_grain_ratio: number | null;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: MashStepOrmEntity): MashStepDto {
    const dto = new MashStepDto();
    dto.id = entity.id;
    dto.mash_profile_id = entity.mash_profile_id;
    dto.step_index = entity.step_index;
    dto.name = entity.name;
    dto.type = entity.type;
    dto.step_time_min = entity.step_time_min;
    dto.step_temp_c = entity.step_temp_c;
    dto.ramp_time_min = entity.ramp_time_min;
    dto.end_temp_c = entity.end_temp_c;
    dto.infuse_amount_l = entity.infuse_amount_l;
    dto.infuse_temp_c = entity.infuse_temp_c;
    dto.decoction_amount_l = entity.decoction_amount_l;
    dto.water_grain_ratio = entity.water_grain_ratio;
    dto.description = entity.description;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
