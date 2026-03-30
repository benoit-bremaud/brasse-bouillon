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

import { RecipeAdditiveType } from '../domain/enums/recipe-additive-type.enum';
import { RecipeStepType } from '../domain/enums/recipe-step-type.enum';

export class CreateRecipeAdditiveDto {
  @ApiProperty({ example: 'Irish Moss', description: 'Additive name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ enum: RecipeAdditiveType, example: RecipeAdditiveType.FINING })
  @IsEnum(RecipeAdditiveType)
  type: RecipeAdditiveType;

  @ApiProperty({ example: 5, description: 'Amount in grams' })
  @IsNumber()
  @IsPositive()
  @Max(10000)
  amount_g: number;

  @ApiProperty({
    enum: RecipeStepType,
    example: RecipeStepType.BOIL,
    description: 'Step at which the additive is added',
  })
  @IsEnum(RecipeStepType)
  addition_step: RecipeStepType;

  @ApiPropertyOptional({
    example: 15,
    description: 'Addition time in minutes from end of boil',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  addition_time_min?: number;
}
