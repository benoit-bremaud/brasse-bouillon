import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import { MeasurementType } from '../domain/enums/measurement-type.enum';

/** Body for recording a measurement against a batch (#607). */
export class CreateMeasurementDto {
  @ApiProperty({ enum: MeasurementType, example: MeasurementType.OG })
  @IsEnum(MeasurementType)
  type: MeasurementType;

  @ApiProperty({ example: 1.048 })
  @IsNumber()
  value: number;

  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stepOrder?: number;

  @ApiProperty({ required: false, example: 'SG' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @ApiProperty({ required: false, example: '2026-05-20T10:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  takenAt?: string;
}
