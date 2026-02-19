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
  annee: number;

  @ApiPropertyOptional({ nullable: true, example: 'NANTES SUD' })
  nomReseau: string | null;

  @ApiProperty({ example: 42 })
  nbPrelevements: number;

  @ApiProperty({ enum: WaterConformity, example: WaterConformity.C })
  conformite: WaterConformity;

  @ApiProperty({ type: WaterMineralsMgLDto })
  minerauxMgL: WaterMineralsMgLDto;

  @ApiPropertyOptional({ nullable: true, example: 55.9 })
  dureteFrancais: number | null;

  static fromEntity(entity: WaterProfileEntity): WaterProfileDto {
    const dto = new WaterProfileDto();
    dto.provider = entity.provider;
    dto.codeInsee = entity.codeInsee;
    dto.annee = entity.annee;
    dto.nomReseau = entity.nomReseau;
    dto.nbPrelevements = entity.nbPrelevements;
    dto.conformite = entity.conformite;
    dto.minerauxMgL = {
      ca: entity.minerauxMgL.ca,
      mg: entity.minerauxMgL.mg,
      cl: entity.minerauxMgL.cl,
      so4: entity.minerauxMgL.so4,
      hco3: entity.minerauxMgL.hco3,
    };
    dto.dureteFrancais = entity.dureteFrancais;
    return dto;
  }
}
