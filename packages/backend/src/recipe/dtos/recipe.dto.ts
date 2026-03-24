import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';

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

  // Brewing metrics and targets
  @ApiPropertyOptional({ nullable: true })
  batch_size_l?: number | null;

  @ApiPropertyOptional({ nullable: true })
  boil_time_min?: number | null;

  @ApiPropertyOptional({ nullable: true })
  og_target?: number | null;

  @ApiPropertyOptional({ nullable: true })
  fg_target?: number | null;

  @ApiPropertyOptional({ nullable: true })
  abv_estimated?: number | null;

  @ApiPropertyOptional({ nullable: true })
  ibu_target?: number | null;

  @ApiPropertyOptional({ nullable: true })
  ebc_target?: number | null;

  @ApiPropertyOptional({ nullable: true })
  efficiency_target?: number | null;

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
      batch_size_l: e.batch_size_l ?? null,
      boil_time_min: e.boil_time_min ?? null,
      og_target: e.og_target ?? null,
      fg_target: e.fg_target ?? null,
      abv_estimated: e.abv_estimated ?? null,
      ibu_target: e.ibu_target ?? null,
      ebc_target: e.ebc_target ?? null,
      efficiency_target: e.efficiency_target ?? null,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
