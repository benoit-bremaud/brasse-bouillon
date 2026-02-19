import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class UpsertRecipeWaterDto {
  @ApiProperty({ example: 17, description: 'Mash water volume in liters' })
  @IsNumber()
  @IsPositive()
  @Max(500)
  mash_volume_l: number;

  @ApiProperty({ example: 12, description: 'Sparge water volume in liters' })
  @IsNumber()
  @IsPositive()
  @Max(500)
  sparge_volume_l: number;

  @ApiPropertyOptional({
    example: 67,
    description: 'Mash target temperature (°C)',
  })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(80)
  mash_temperature_c?: number;

  @ApiPropertyOptional({
    example: 78,
    description: 'Sparge target temperature (°C)',
  })
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(100)
  sparge_temperature_c?: number;

  @ApiPropertyOptional({
    example: 80,
    description: 'Calcium concentration (ppm)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  calcium_ppm?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Magnesium concentration (ppm)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  magnesium_ppm?: number;

  @ApiPropertyOptional({
    example: 150,
    description: 'Sulfate concentration (ppm)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  sulfate_ppm?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Chloride concentration (ppm)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  chloride_ppm?: number;

  @ApiPropertyOptional({ example: 5.4, description: 'Target mash pH' })
  @IsOptional()
  @IsNumber()
  @Min(4.0)
  @Max(7.0)
  ph_target?: number;
}
