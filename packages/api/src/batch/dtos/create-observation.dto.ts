import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Body for logging a free-text observation against a batch (#607). */
export class CreateObservationDto {
  @ApiProperty({ example: 'Krausen bien formé, odeur fruitée' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  freeText: string;

  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stepOrder?: number;

  @ApiProperty({ required: false, type: [String], example: ['photos/1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photoRefs?: string[];

  @ApiProperty({ required: false, minimum: 1, maximum: 5, example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  moodScore?: number;

  @ApiProperty({ required: false, example: '2026-05-20T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  observedAt?: string;
}
