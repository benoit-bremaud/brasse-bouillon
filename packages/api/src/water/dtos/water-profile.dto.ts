import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { WaterConformity } from '../domain/enums/water-conformity.enum';
import { WaterProfileEntity } from '../domain/entities/water-profile.entity';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';

export class WaterMineralsMgLDto {
  @ApiPropertyOptional({ nullable: true, example: 52.4 })
  ca: number | null;

  @ApiPropertyOptional({ nullable: true, example: 8.7 })
  mg: number | null;

  @ApiPropertyOptional({ nullable: true, example: 31.5 })
  cl: number | null;

  @ApiPropertyOptional({ nullable: true, example: 27.2 })
  so4: number | null;

  @ApiPropertyOptional({ nullable: true, example: 141.1 })
  hco3: number | null;
}

export class WaterProfileDto {
  @ApiProperty({ enum: WaterProviderKey, example: WaterProviderKey.HUBEAU })
  provider: WaterProviderKey;

  @ApiProperty({ example: '44109' })
  codeInsee: string;

  @ApiProperty({ example: 2024 })
  year: number;

  @ApiPropertyOptional({ nullable: true, example: 'NANTES SUD' })
  networkName: string | null;

  @ApiProperty({ example: 42 })
  sampleCount: number;

  @ApiProperty({ enum: WaterConformity, example: WaterConformity.C })
  conformity: WaterConformity;

  @ApiProperty({ type: WaterMineralsMgLDto })
  mineralsMgL: WaterMineralsMgLDto;

  @ApiPropertyOptional({ nullable: true, example: 55.9 })
  hardnessFrench: number | null;

  static fromEntity(entity: WaterProfileEntity): WaterProfileDto {
    const dto = new WaterProfileDto();
    dto.provider = entity.provider;
    dto.codeInsee = entity.codeInsee;
    dto.year = entity.year;
    dto.networkName = entity.networkName;
    dto.sampleCount = entity.sampleCount;
    dto.conformity = entity.conformity;
    dto.mineralsMgL = {
      ca: entity.mineralsMgL.ca,
      mg: entity.mineralsMgL.mg,
      cl: entity.mineralsMgL.cl,
      so4: entity.mineralsMgL.so4,
      hco3: entity.mineralsMgL.hco3,
    };
    dto.hardnessFrench = entity.hardnessFrench;
    return dto;
  }
}
