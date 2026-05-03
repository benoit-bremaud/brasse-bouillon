import { ApiProperty } from '@nestjs/swagger';

import { EquipmentTemplateOrmEntity } from '../entities/equipment-template.orm.entity';

/**
 * Read-only response DTO for the equipment template catalogue.
 * Mirrors the ORM row shape one-to-one. Built via
 * `EquipmentTemplateDto.fromEntity(entity)` rather than direct
 * property access so future shape changes (date serialisation,
 * field renaming) stay in this single conversion point.
 */
export class EquipmentTemplateDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Grainfather G30 (electric all-in-one)' })
  name: string;

  @ApiProperty({
    example: 30,
    nullable: true,
    description: 'Litres before boil',
  })
  boil_size_l: number | null;

  @ApiProperty({
    example: 23,
    nullable: true,
    description: 'Litres of finished beer',
  })
  batch_size_l: number | null;

  @ApiProperty({ example: 30, nullable: true })
  tun_volume_l: number | null;

  @ApiProperty({ example: 4, nullable: true })
  tun_weight_kg: number | null;

  @ApiProperty({ example: 0.12, nullable: true })
  tun_specific_heat: number | null;

  @ApiProperty({ example: 0, nullable: true })
  top_up_water_l: number | null;

  @ApiProperty({ example: 1, nullable: true })
  trub_chiller_loss_l: number | null;

  @ApiProperty({ example: 9, nullable: true })
  evap_rate_percent: number | null;

  @ApiProperty({ example: 60, nullable: true })
  boil_time_min: number | null;

  @ApiProperty({ example: true })
  calc_boil_volume: boolean;

  @ApiProperty({ example: 1, nullable: true })
  lauter_deadspace_l: number | null;

  @ApiProperty({ example: 0, nullable: true })
  top_up_kettle_l: number | null;

  @ApiProperty({ example: 100, nullable: true })
  hop_utilization_percent: number | null;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ format: 'date-time' })
  created_at: string;

  @ApiProperty({ format: 'date-time' })
  updated_at: string;

  static fromEntity(entity: EquipmentTemplateOrmEntity): EquipmentTemplateDto {
    const dto = new EquipmentTemplateDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.boil_size_l = entity.boil_size_l;
    dto.batch_size_l = entity.batch_size_l;
    dto.tun_volume_l = entity.tun_volume_l;
    dto.tun_weight_kg = entity.tun_weight_kg;
    dto.tun_specific_heat = entity.tun_specific_heat;
    dto.top_up_water_l = entity.top_up_water_l;
    dto.trub_chiller_loss_l = entity.trub_chiller_loss_l;
    dto.evap_rate_percent = entity.evap_rate_percent;
    dto.boil_time_min = entity.boil_time_min;
    dto.calc_boil_volume = entity.calc_boil_volume;
    dto.lauter_deadspace_l = entity.lauter_deadspace_l;
    dto.top_up_kettle_l = entity.top_up_kettle_l;
    dto.hop_utilization_percent = entity.hop_utilization_percent;
    dto.notes = entity.notes;
    dto.created_at = entity.created_at.toISOString();
    dto.updated_at = entity.updated_at.toISOString();
    return dto;
  }
}
