import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

import { EquipmentSystemType } from '../domain/enums/equipment-system-type.enum';

export class CreateEquipmentProfileDto {
  @ApiProperty({ example: '20L All-Grain System' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  name: string;

  // Volumes (L)
  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  mash_tun_volume_l: number;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  boil_kettle_volume_l: number;

  @ApiProperty({ example: 23 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fermenter_volume_l: number;

  // Losses (L) - optional, defaults handled in service
  @ApiPropertyOptional({ example: 1, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  trub_loss_l?: number;

  @ApiPropertyOptional({ example: 0.5, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  dead_space_loss_l?: number;

  @ApiPropertyOptional({ example: 0.5, default: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  transfer_loss_l?: number;

  // Rates / efficiency
  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  evaporation_rate_l_per_hour: number;

  @ApiProperty({ example: 75, minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  efficiency_estimated_percent: number;

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
  @IsInt()
  @Min(0)
  cooling_time_minutes?: number;

  @ApiPropertyOptional({ example: 6.5 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  cooling_flow_rate_l_per_minute?: number;

  @ApiProperty({ enum: EquipmentSystemType, example: EquipmentSystemType.ALL_GRAIN })
  @IsEnum(EquipmentSystemType)
  system_type: EquipmentSystemType;
}
