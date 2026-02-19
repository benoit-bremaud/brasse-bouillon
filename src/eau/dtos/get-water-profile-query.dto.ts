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
    description: 'Code INSEE de la commune (5 chiffres)',
  })
  @IsString()
  @Matches(/^\d{5}$/)
  codeInsee: string;

  @ApiProperty({
    example: 2024,
    description: 'Année des analyses à agréger',
  })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(MAX_ALLOWED_YEAR)
  annee: number;

  @ApiPropertyOptional({
    enum: WaterProviderKey,
    description: 'Provider externe à utiliser',
    default: WaterProviderKey.HUBEAU,
  })
  @IsOptional()
  @IsEnum(WaterProviderKey)
  provider?: WaterProviderKey;
}
