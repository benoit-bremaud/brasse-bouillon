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

import { RecipeFermentableType } from '../domain/enums/recipe-fermentable-type.enum';

export class CreateRecipeFermentableDto {
  @ApiProperty({
    example: 'Pale Malt (2-Row)',
    description: 'Fermentable name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    enum: RecipeFermentableType,
    example: RecipeFermentableType.GRAIN,
  })
  @IsEnum(RecipeFermentableType)
  type: RecipeFermentableType;

  @ApiProperty({ example: 4500, description: 'Weight in grams' })
  @IsNumber()
  @IsPositive()
  @Max(100000)
  weight_g: number;

  @ApiPropertyOptional({
    example: 1.037,
    description: 'Potential gravity (e.g. 1.037 for 1kg/L)',
  })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(1.5)
  potential_gravity?: number;

  @ApiPropertyOptional({ example: 4, description: 'Color in EBC units' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  color_ebc?: number;
}
