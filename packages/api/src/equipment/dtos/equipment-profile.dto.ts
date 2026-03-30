import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EquipmentSystemType } from '../domain/enums/equipment-system-type.enum';
import { EquipmentProfileOrmEntity } from '../entities/equipment-profile.orm.entity';

export class EquipmentProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  owner_id: string;

  @ApiProperty()
  name: string;

  // Volumes (L)
  @ApiProperty()
  mash_tun_volume_l: number;

  @ApiProperty()
  boil_kettle_volume_l: number;

  @ApiProperty()
  fermenter_volume_l: number;

  // Losses (L)
  @ApiProperty()
  trub_loss_l: number;

  @ApiProperty()
  dead_space_loss_l: number;

  @ApiProperty()
  transfer_loss_l: number;

  // Rates / efficiency
  @ApiProperty()
  evaporation_rate_l_per_hour: number;

  @ApiProperty()
  efficiency_estimated_percent: number;

  @ApiPropertyOptional({ nullable: true })
  efficiency_measured_percent?: number | null;

  // Optional cooling
  @ApiPropertyOptional({ nullable: true })
  cooling_time_minutes?: number | null;

  @ApiPropertyOptional({ nullable: true })
  cooling_flow_rate_l_per_minute?: number | null;

  @ApiProperty({ enum: EquipmentSystemType })
  system_type: EquipmentSystemType;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: EquipmentProfileOrmEntity): EquipmentProfileDto {
    return {
      id: e.id,
      owner_id: e.owner_id,
      name: e.name,
      mash_tun_volume_l: e.mash_tun_volume_l,
      boil_kettle_volume_l: e.boil_kettle_volume_l,
      fermenter_volume_l: e.fermenter_volume_l,
      trub_loss_l: e.trub_loss_l,
      dead_space_loss_l: e.dead_space_loss_l,
      transfer_loss_l: e.transfer_loss_l,
      evaporation_rate_l_per_hour: e.evaporation_rate_l_per_hour,
      efficiency_estimated_percent: e.efficiency_estimated_percent,
      efficiency_measured_percent: e.efficiency_measured_percent ?? null,
      cooling_time_minutes: e.cooling_time_minutes ?? null,
      cooling_flow_rate_l_per_minute: e.cooling_flow_rate_l_per_minute ?? null,
      system_type: e.system_type,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
