import { RecipeOrmEntity } from '../entities/recipe.orm.entity';

/**
 * Single ranked-recipe item — recipe row plus its computed **match strength**
 * (`score`, 0..100, ADR-0016) and its **completeness** (0..1, ADR-0016 D4: how
 * much of the full picture the comparison used — a separate confidence signal,
 * distinct from the match strength). The per-criterion breakdown is
 * intentionally NOT exposed; the client needs the ordering, the headline number
 * and the completeness.
 */
export interface RankedRecipeDto {
  recipe: RecipeOrmEntity;
  score: number;
  completeness: number;
}

/**
 * Response envelope for `POST /recipes/match` and the legacy
 * `GET /recipes/match/:beerId` (Issue #699, matcher v2 ADR-0016).
 *
 * - `rankings` — the candidates that cleared the acceptance thresholds
 *   (ADR-0016 D5: match strength ≥ `SCAN_MATCH_S_MIN` AND completeness ≥
 *   `SCAN_MATCH_C_MIN`), ordered by descending match strength with
 *   deterministic tie-breakers on `avg_rating` then `id`. Each carries its
 *   `completeness`.
 * - `low_confidence` — `true` when **nothing** cleared the thresholds (empty
 *   `rankings`). The mobile renders an honest *"no reliable equivalent"* empty
 *   state rather than a misleading closest match.
 */
export interface RankedRecipeResponseDto {
  rankings: RankedRecipeDto[];
  low_confidence: boolean;
}
