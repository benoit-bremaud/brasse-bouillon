import { RecipeOrmEntity } from '../entities/recipe.orm.entity';

/**
 * Response item shape for `GET /recipes/match/:beerId` (Issue #699).
 *
 * Carries the recipe row plus its computed match score (0..100) so the
 * mobile UI (Issue #700) can render the ranked list without recomputing
 * anything client-side. Score breakdown is intentionally NOT exposed —
 * the client only needs the ordering and the headline number.
 */
export interface RankedRecipeDto {
  recipe: RecipeOrmEntity;
  score: number;
}
