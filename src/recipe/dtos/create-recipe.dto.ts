import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
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
}
