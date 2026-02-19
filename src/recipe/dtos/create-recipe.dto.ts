import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';

export class CreateRecipeDto {
  @ApiProperty({ example: 'My First IPA' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Citrusy and hoppy IPA', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @ApiPropertyOptional({ enum: RecipeVisibility })
  @IsOptional()
  @IsEnum(RecipeVisibility)
  visibility?: RecipeVisibility;

  // Brewing metrics and targets
  @ApiPropertyOptional({ example: 20, description: 'Batch size in liters' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(1000)
  batch_size_l?: number;

  @ApiPropertyOptional({ example: 60, description: 'Boil time in minutes' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(240)
  boil_time_min?: number;

  @ApiPropertyOptional({
    example: 1.055,
    description: 'Original gravity target',
  })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(1.2)
  og_target?: number;

  @ApiPropertyOptional({ example: 1.012, description: 'Final gravity target' })
  @IsOptional()
  @IsNumber()
  @Min(0.99)
  @Max(1.1)
  fg_target?: number;

  @ApiPropertyOptional({
    example: 5.6,
    description: 'Estimated ABV percentage',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(25)
  abv_estimated?: number;

  @ApiPropertyOptional({ example: 40, description: 'IBU target' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(150)
  ibu_target?: number;

  @ApiPropertyOptional({ example: 15, description: 'EBC color target' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  ebc_target?: number;

  @ApiPropertyOptional({
    example: 75,
    description: 'Efficiency target percentage',
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(100)
  efficiency_target?: number;
}
