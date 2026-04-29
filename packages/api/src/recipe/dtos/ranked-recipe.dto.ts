import { RecipeOrmEntity } from '../entities/recipe.orm.entity';

/**
 * Single ranked-recipe item — recipe row plus its computed match
 * score (0..100). Score breakdown is intentionally NOT exposed; the
 * client only needs the ordering and the headline number.
 */
export interface RankedRecipeDto {
  recipe: RecipeOrmEntity;
  score: number;
}

/**
 * Response envelope for `GET /recipes/match/:beerId` (Issue #699 +
 * brainstorm scan-2026-04-24 §3 "low_confidence" annotation).
 *
 * - `rankings` — top-N matched recipes ordered by descending score
 *   (with deterministic tie-breakers on `avg_rating` then `id`).
 * - `low_confidence` — `true` when the best match scores below the
 *   40-point threshold. The mobile UI uses this flag to display a
 *   discreet warning *"Aucune recette très similaire dans la base.
 *   Voici les plus proches."* above the equivalent recipes section.
 *
 * The threshold (40) is the inflection point below which the
 * editorial value of the suggestion drops sharply — recipes with
 * neither matching style nor similar ABV nor a strong rating land
 * here, and the user is better served by being told the truth than
 * by being shown a confident-looking but irrelevant top-3.
 */
export interface RankedRecipeResponseDto {
  rankings: RankedRecipeDto[];
  low_confidence: boolean;
}
