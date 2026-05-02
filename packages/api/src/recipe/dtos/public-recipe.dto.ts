import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';

/**
 * Public-facing projection of a Recipe for the discovery catalog
 * (Issue #779). Drops `owner_id` so an anonymous-ish reader of the
 * catalog cannot enumerate the internal user IDs of recipe authors,
 * and drops other ownership-adjacent fields the catalog UI does not
 * need (`imported_from_recipe_id`, `import_provenance`, etc.).
 *
 * The brewing metric fields and the quality fields stay — they are
 * the basis of the card display + the matching algo.
 */
export class PublicRecipeDto {
  @ApiProperty()
  id: string;

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

  // Brewing metrics — feed the card stats row.
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

  // Quality fields used by the matching algo + sorting/badging.
  @ApiPropertyOptional({ nullable: true })
  avg_rating?: number | null;

  @ApiProperty()
  brew_count: number;

  @ApiPropertyOptional({ nullable: true })
  last_brewed_at?: Date | null;

  @ApiProperty()
  is_official: boolean;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  static fromEntity(e: RecipeOrmEntity): PublicRecipeDto {
    return {
      id: e.id,
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
      avg_rating: e.avg_rating ?? null,
      brew_count: e.brew_count,
      last_brewed_at: e.last_brewed_at ?? null,
      is_official: e.is_official,
      created_at: e.created_at,
      updated_at: e.updated_at,
    };
  }
}
