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

import { RecipeHopAdditionStage } from '../domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopType } from '../domain/enums/recipe-hop-type.enum';

export class CreateRecipeHopDto {
  @ApiProperty({ example: 'Cascade', description: 'Hop variety name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  variety: string;

  @ApiProperty({ enum: RecipeHopType, example: RecipeHopType.PELLET })
  @IsEnum(RecipeHopType)
  type: RecipeHopType;

  @ApiProperty({ example: 28, description: 'Weight in grams' })
  @IsNumber()
  @IsPositive()
  @Max(10000)
  weight_g: number;

  @ApiPropertyOptional({ example: 5.5, description: 'Alpha acid percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  alpha_acid_percent?: number;

  @ApiProperty({
    enum: RecipeHopAdditionStage,
    example: RecipeHopAdditionStage.BOIL,
  })
  @IsEnum(RecipeHopAdditionStage)
  addition_stage: RecipeHopAdditionStage;

  @ApiPropertyOptional({
    example: 60,
    description: 'Addition time in minutes from end of boil (boil/whirlpool)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  addition_time_min?: number;
}
