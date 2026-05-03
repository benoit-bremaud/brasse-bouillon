import { ApiProperty } from '@nestjs/swagger';

import { MashProfileOrmEntity } from '../entities/mash-profile.orm.entity';
import { MashStepDto } from './mash-step.dto';

/**
 * Read-only response DTO for a mash profile **detail** endpoint
 * (`GET /catalog/mash-profiles/:id`). Bundles the parent profile
 * fields with its ordered steps (1:N relation). Steps are sorted
 * by `step_index` ASC at the DTO layer so the UI can render them
 * in execution order regardless of how TypeORM returned them.
 *
 * The list endpoint (`GET /catalog/mash-profiles`) returns the
 * lighter `MashProfileSummaryDto` instead — the picker UI doesn't
 * need the step tree, and shipping it on every list response
 * would inflate the payload ~10x.
 */
export class MashProfileDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Single Infusion 65°C 60min (American Pale / IPA)' })
  name: string;

  @ApiProperty({ example: 22, nullable: true })
  grain_temp_c: number | null;

  @ApiProperty({ example: 22, nullable: true })
  tun_temp_c: number | null;

  @ApiProperty({ example: 75.5, nullable: true })
  sparge_temp_c: number | null;

  @ApiProperty({ example: 5.4, nullable: true })
  ph: number | null;

  @ApiProperty({ example: 3, nullable: true })
  tun_weight_kg: number | null;

  @ApiProperty({ example: 0.12, nullable: true })
  tun_specific_heat: number | null;

  @ApiProperty({ example: false })
  equip_adjust: boolean;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({
    type: MashStepDto,
    isArray: true,
    description: 'Ordered execution steps (1-based step_index)',
  })
  steps: MashStepDto[];

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: MashProfileOrmEntity): MashProfileDto {
    const dto = new MashProfileDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.grain_temp_c = entity.grain_temp_c;
    dto.tun_temp_c = entity.tun_temp_c;
    dto.sparge_temp_c = entity.sparge_temp_c;
    dto.ph = entity.ph;
    dto.tun_weight_kg = entity.tun_weight_kg;
    dto.tun_specific_heat = entity.tun_specific_heat;
    dto.equip_adjust = entity.equip_adjust;
    dto.notes = entity.notes;
    dto.steps = (entity.steps ?? [])
      .slice()
      .sort((a, b) => a.step_index - b.step_index)
      .map((step) => MashStepDto.fromEntity(step));
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
