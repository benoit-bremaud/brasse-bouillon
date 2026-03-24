import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeAdditiveOrmEntity } from '../entities/recipe-additive.orm.entity';
import { RecipeAdditiveType } from '../domain/enums/recipe-additive-type.enum';
import { RecipeStepType } from '../domain/enums/recipe-step-type.enum';

export class RecipeAdditiveDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  recipe_id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: RecipeAdditiveType })
  type: RecipeAdditiveType;

  @ApiProperty()
  amount_g: number;

  @ApiProperty({ enum: RecipeStepType })
  addition_step: RecipeStepType;

  @ApiPropertyOptional({ nullable: true })
  addition_time_min: number | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: RecipeAdditiveOrmEntity): RecipeAdditiveDto {
    const dto = new RecipeAdditiveDto();
    dto.id = e.id;
    dto.recipe_id = e.recipe_id;
    dto.name = e.name;
    dto.type = e.type;
    dto.amount_g = e.amount_g;
    dto.addition_step = e.addition_step;
    dto.addition_time_min = e.addition_time_min ?? null;
    dto.created_at = e.created_at;
    dto.updated_at = e.updated_at;
    return dto;
  }
}
