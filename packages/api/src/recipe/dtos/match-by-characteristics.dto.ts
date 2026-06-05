import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Body for `POST /recipes/match` — the recognised beer's characteristics
 * the matcher scores against (style × 50 + ABV × 25 + IBU × 15 +
 * colour × 10). Every field is optional: a missing criterion is dropped
 * and the remaining weights are renormalised, so a beer with only a
 * style + ABV still ranks.
 *
 * Decouples matching from the `scan_catalog_items` id (scan cutover
 * #1186) — see docs/architecture/diagrams/recipes/06-sequence-recipe-matching.md.
 */
export class MatchByCharacteristicsDto {
  @IsOptional()
  @IsString()
  style?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  abv?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  ibu?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  colorEbc?: number;
}
