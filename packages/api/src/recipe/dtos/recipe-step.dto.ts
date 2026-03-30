import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeStepType } from '../domain/enums/recipe-step-type.enum';
import { RecipeStepOrmEntity } from '../entities/recipe-step.orm.entity';

export class RecipeStepDto {
  @ApiProperty()
  recipe_id: string;

  @ApiProperty()
  step_order: number;

  @ApiProperty({ enum: RecipeStepType })
  type: RecipeStepType;

  @ApiProperty()
  label: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: RecipeStepOrmEntity): RecipeStepDto {
    return {
      recipe_id: e.recipe_id,
      step_order: e.step_order,
      type: e.type,
      label: e.label,
      description: e.description ?? null,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
