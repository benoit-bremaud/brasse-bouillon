import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { RecipeDifficultyLevel } from '../domain/enums/recipe-difficulty-level.enum';
import { RecipeDifficultyReasonDto } from './recipe-difficulty-reason.dto';
import { RecipeDto } from './recipe.dto';
import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';

/**
 * Fields of `RecipeDto` the public catalog must NOT expose. Centralises
 * the projection rule so the controller and any future caller share a
 * single source of truth — adding a new ownership-adjacent field on
 * `RecipeDto` will not silently leak through the catalog as long as
 * the field is added here.
 *
 * Issue #779 Copilot review #4 (privacy guard).
 */
const SENSITIVE_FIELDS_STRIPPED_FOR_PUBLIC_CATALOG = [
  'owner_id',
  'imported_from_recipe_id',
  'import_provenance',
] as const satisfies ReadonlyArray<keyof RecipeDto>;

type SensitiveFieldName =
  (typeof SENSITIVE_FIELDS_STRIPPED_FOR_PUBLIC_CATALOG)[number];

/**
 * Public-facing projection of a Recipe for the discovery catalog
 * (Issue #779). Composed from `RecipeDto` minus
 * `SENSITIVE_FIELDS_STRIPPED_FOR_PUBLIC_CATALOG` so any future
 * brewing/metric field added to `RecipeDto` flows through here
 * automatically — and any future ownership-adjacent field added
 * to `RecipeDto` is opt-in (not opt-out) on the public projection.
 */
export class PublicRecipeDto implements Omit<RecipeDto, SensitiveFieldName> {
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

  // Brewing-difficulty badge (ADR-0024) — surfaced on catalog cards.
  @ApiProperty({ enum: RecipeDifficultyLevel })
  difficulty_computed: RecipeDifficultyLevel;

  @ApiPropertyOptional({ enum: RecipeDifficultyLevel, nullable: true })
  difficulty_override?: RecipeDifficultyLevel | null;

  @ApiProperty({ enum: RecipeDifficultyLevel })
  difficulty_effective: RecipeDifficultyLevel;

  @ApiProperty({ type: [RecipeDifficultyReasonDto] })
  difficulty_reasons: RecipeDifficultyReasonDto[];

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
    const full = RecipeDto.fromEntity(e);
    const projected: Partial<RecipeDto> = { ...full };
    for (const field of SENSITIVE_FIELDS_STRIPPED_FOR_PUBLIC_CATALOG) {
      delete projected[field];
    }
    return projected as PublicRecipeDto;
  }
}
