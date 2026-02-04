import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';
import { RecipeOrmEntity } from '../entities/recipe.orm.entity';

export class RecipeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  owner_id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description?: string | null;

  @ApiProperty({ enum: RecipeVisibility })
  visibility: RecipeVisibility;

  @ApiProperty()
  version: number;

  @ApiProperty()
  root_recipe_id: string;

  @ApiPropertyOptional({ nullable: true })
  parent_recipe_id?: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: RecipeOrmEntity): RecipeDto {
    return {
      id: e.id,
      owner_id: e.owner_id,
      name: e.name,
      description: e.description ?? null,
      visibility: e.visibility,
      version: e.version,
      root_recipe_id: e.root_recipe_id,
      parent_recipe_id: e.parent_recipe_id ?? null,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
