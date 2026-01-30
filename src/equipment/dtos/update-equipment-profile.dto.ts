import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

import { EquipmentSystemType } from '../domain/enums/equipment-system-type.enum';

export class UpdateEquipmentProfileDto {
  @ApiPropertyOptional({ example: 'Updated System Name' })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  name?: string;

  // Volumes (L)
  @ApiPropertyOptional({ example: 30 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  mash_tun_volume_l?: number;

  @ApiPropertyOptional({ example: 30 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  boil_kettle_volume_l?: number;

  @ApiPropertyOptional({ example: 25 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  fermenter_volume_l?: number;

  // Losses (L)
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  trub_loss_l?: number;

  @ApiPropertyOptional({ example: 0.5 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  dead_space_loss_l?: number;

  @ApiPropertyOptional({ example: 0.5 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  transfer_loss_l?: number;

  // Rates / efficiency
  @ApiPropertyOptional({ example: 3 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  evaporation_rate_l_per_hour?: number;

  @ApiPropertyOptional({ example: 75, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  efficiency_estimated_percent?: number;

  @ApiPropertyOptional({ example: 72, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  efficiency_measured_percent?: number;

  // Optional cooling
  @ApiPropertyOptional({ example: 20 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  cooling_time_minutes?: number;

  @ApiPropertyOptional({ example: 6.5 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  cooling_flow_rate_l_per_minute?: number;

  @ApiPropertyOptional({ enum: EquipmentSystemType })
  @IsOptional()
  @IsEnum(EquipmentSystemType)
  system_type?: EquipmentSystemType;
}
