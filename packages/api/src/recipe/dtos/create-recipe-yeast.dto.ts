import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { RecipeYeastType } from '../domain/enums/recipe-yeast-type.enum';

export class CreateRecipeYeastDto {
  @ApiProperty({ example: 'Safale US-05', description: 'Yeast strain name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: RecipeYeastType, example: RecipeYeastType.ALE })
  @IsEnum(RecipeYeastType)
  type: RecipeYeastType;

  @ApiProperty({ example: 11.5, description: 'Amount in grams' })
  @IsNumber()
  @IsPositive()
  @Max(10000)
  amount_g: number;

  @ApiPropertyOptional({ example: 77, description: 'Attenuation percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attenuation_percent?: number;

  @ApiPropertyOptional({
    example: 15,
    description: 'Minimum fermentation temperature (°C)',
  })
  @IsOptional()
  @IsInt()
  @Min(-5)
  @Max(40)
  temperature_min_c?: number;

  @ApiPropertyOptional({
    example: 22,
    description: 'Maximum fermentation temperature (°C)',
  })
  @IsOptional()
  @IsInt()
  @Min(-5)
  @Max(40)
  temperature_max_c?: number;
}
