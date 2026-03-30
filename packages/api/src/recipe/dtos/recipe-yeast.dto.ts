import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeYeastOrmEntity } from '../entities/recipe-yeast.orm.entity';
import { RecipeYeastType } from '../domain/enums/recipe-yeast-type.enum';

export class RecipeYeastDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  recipe_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: RecipeYeastType })
  type: RecipeYeastType;

  @ApiProperty()
  amount_g: number;

  @ApiPropertyOptional({ nullable: true })
  attenuation_percent: number | null;

  @ApiPropertyOptional({ nullable: true })
  temperature_min_c: number | null;

  @ApiPropertyOptional({ nullable: true })
  temperature_max_c: number | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: RecipeYeastOrmEntity): RecipeYeastDto {
    const dto = new RecipeYeastDto();
    dto.id = e.id;
    dto.recipe_id = e.recipe_id;
    dto.name = e.name;
    dto.type = e.type;
    dto.amount_g = e.amount_g;
    dto.attenuation_percent = e.attenuation_percent ?? null;
    dto.temperature_min_c = e.temperature_min_c ?? null;
    dto.temperature_max_c = e.temperature_max_c ?? null;
    dto.created_at = e.created_at;
    dto.updated_at = e.updated_at;
    return dto;
  }
}
