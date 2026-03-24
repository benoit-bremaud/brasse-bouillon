import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { ScanFermentationType } from '../domain/enums/scan-fermentation-type.enum';
import { Type } from 'class-transformer';

export class AdminResolveScanReviewDto {
  @ApiProperty({ example: '3271234567890' })
  @IsString()
  @Matches(/^\d{8,14}$/)
  barcode: string;

  @ApiProperty({ example: 'Amber IPA' })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiProperty({ example: 'Brasserie des Coteaux' })
  @IsString()
  @Length(1, 160)
  brewery: string;

  @ApiProperty({ example: 'IPA' })
  @IsString()
  @Length(1, 120)
  style: string;

  @ApiPropertyOptional({ example: 6.5, nullable: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  abv?: number;

  @ApiPropertyOptional({ example: 45, nullable: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  ibu?: number;

  @ApiPropertyOptional({ example: 25, nullable: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  color_ebc?: number;

  @ApiProperty({
    enum: ScanFermentationType,
    example: ScanFermentationType.ALE,
  })
  @IsEnum(ScanFermentationType)
  fermentation_type: ScanFermentationType;

  @ApiPropertyOptional({
    example: 'hoppy,citrus,grapefruit',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  aromatic_tags?: string;

  @ApiPropertyOptional({
    example: 'Manual research from brewery product page',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Length(0, 2_000)
  notes_source?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_abv_estimated?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_ibu_estimated?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_color_ebc_estimated?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_style_estimated?: boolean;

  @ApiPropertyOptional({
    example: 'Marked as estimated for IBU due to unavailable manufacturer data',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Length(0, 2_000)
  internal_note?: string;
}
