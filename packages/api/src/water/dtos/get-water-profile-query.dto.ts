import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { Type } from 'class-transformer';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';

const MAX_ALLOWED_YEAR = new Date().getFullYear() + 1;

export class GetWaterProfileQueryDto {
  @ApiProperty({
    example: '44109',
    description: 'INSEE city code (5 digits)',
  })
  @IsString()
  @Matches(/^\d{5}$/)
  codeInsee: string;

  @ApiProperty({
    example: 2024,
    description: 'Year of analyses to aggregate',
  })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(MAX_ALLOWED_YEAR)
  year: number;

  @ApiPropertyOptional({
    enum: WaterProviderKey,
    description: 'External provider to use',
    default: WaterProviderKey.HUBEAU,
  })
  @IsOptional()
  @IsEnum(WaterProviderKey)
  provider?: WaterProviderKey;
}
