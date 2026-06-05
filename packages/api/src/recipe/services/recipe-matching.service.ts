import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';
import { ScanCatalogItemOrmEntity } from '../../scan/entities/scan-catalog-item.orm.entity';
import {
  RankedRecipeDto,
  RankedRecipeResponseDto,
} from '../dtos/ranked-recipe.dto';
import { styleSimilarity } from './bjcp-style-family';
import {
  SCAN_MATCH_C_MIN,
  SCAN_MATCH_S_MIN,
} from './recipe-matching.constants';

/**
 * The beer characteristics the matcher scores against — style, ABV,
 * bitterness (IBU) and colour (EBC). This is the *only* input the
 * ranking needs; it is deliberately decoupled from how the beer was
 * identified (a `scan_catalog_items` row, a beer-encyclopedia
 * `BeerRead`, …) so matching works for any source (scan cutover #1186).
 * See docs/architecture/diagrams/recipes/06-sequence-recipe-matching.md.
 */
export interface BeerCharacteristics {
  style: string | null;
  abv?: number | null;
  ibu?: number | null;
  color_ebc?: number | null;
}

/**
 * Score-based recipe matching — **v2** per ADR-0016
 * (docs/architecture/diagrams/recipes/06-sequence-recipe-matching.md).
 *
 * The headline score is the **match strength**: a weighted, completeness-aware
 * SIMILARITY only. Community quality (rating) is no longer blended into the
 * score — `avg_rating` is now purely a tie-break (ADR-0016 ranks on similarity,
 * rating departages equal matches).
 *
 *   matchStrength = official&style-compatible ? 100 :
 *                   Σ[weight × localSim] / Σ[weight] over present criteria
 *                   (Gower renormalisation — a missing criterion drops from
 *                    BOTH numerator and denominator, never a 0 penalty)
 *
 *   Full-data weights (ADR-0016 D1):
 *     style 40, colour 22, bitterness 18, ABV 14   (ingredients 6 deferred)
 *
 *   completeness  = Σ[present weight] / 100         (ADR-0016 D4)
 *                   a separate confidence signal — how much of the full picture
 *                   the comparison used. Caps at 0.94 until ingredients (6) are
 *                   compared.
 *
 *   Acceptance (ADR-0016 D5): a candidate is shown only when
 *     matchStrength ≥ SCAN_MATCH_S_MIN AND completeness ≥ SCAN_MATCH_C_MIN.
 *   The filter runs over ALL scored candidates BEFORE the top-N truncation, so
 *   a reliable match ranked just below an unreliable one is never hidden.
 *   `low_confidence` is `true` when nothing passes (empty rankings → the mobile
 *   shows an honest "no reliable equivalent" state).
 *
 * The official-recipe shortcut stays style-gated (#1193 / D6): `is_official`
 * AND a positive style local-similarity → matchStrength 100; an off-style
 * official is ranked on its honest similarity instead and does not bypass D5.
 *
 * Local-similarity scales (0..100):
 * - style — graded by BJCP family (`./bjcp-style-family`): same style 100,
 *   same family 70, same colour+strength tier 40, else 0 (null when either side
 *   is unclassifiable → dropped).
 * - ABV — linear `max(0, 100 - 25 × |gap|)` so 0% gap → 100, 4%+ → 0
 * - bitterness — categorical match on the IBU bands from vocab-mapping
 * - colour — categorical match on the EBC bands from vocab-mapping
 */
@Injectable()
export class RecipeMatchingService {
  constructor(
    @InjectRepository(RecipeOrmEntity)
    private readonly recipeRepo: Repository<RecipeOrmEntity>,
    @InjectRepository(ScanCatalogItemOrmEntity)
    private readonly catalogRepo: Repository<ScanCatalogItemOrmEntity>,
  ) {}

  /**
   * Full weight of all five ADR-0016 criteria (style 40 + colour 22 + IBU 18 +
   * ABV 14 + ingredients 6). The completeness denominator; ingredients are not
   * compared yet, so completeness currently caps at 94/100.
   */
  private static readonly TOTAL_CRITERIA_WEIGHT = 100;

  async rankForBeer(
    beerCatalogItemId: string,
    limit = 3,
  ): Promise<RankedRecipeResponseDto> {
    const beer = await this.catalogRepo.findOne({
      where: { id: beerCatalogItemId },
    });
    if (!beer) {
      throw new NotFoundException(
        `Beer catalog item ${beerCatalogItemId} not found`,
      );
    }
    return this.rankByCharacteristics(beer, limit);
  }

  /**
   * Rank PUBLIC recipes against a beer's characteristics (style, ABV,
   * IBU, colour) — the source-agnostic core of the matcher. `rankForBeer`
   * is a thin wrapper that loads a `scan_catalog_items` row and delegates
   * here; the mobile scan fiche calls this directly with the recognised
   * beer's characteristics (from the encyclopedia or NestJS), so matching
   * no longer depends on a scan-catalog id (#1186). Scoring, ordering and
   * the `low_confidence` rule are unchanged.
   */
  async rankByCharacteristics(
    beer: BeerCharacteristics,
    limit = 3,
  ): Promise<RankedRecipeResponseDto> {
    const candidates = await this.recipeRepo.find({
      where: { visibility: RecipeVisibility.PUBLIC },
    });

    const scored = candidates.map(
      (recipe): RankedRecipeDto => ({
        recipe,
        score: this.computeFinalScore(beer, recipe),
        completeness: this.computeCompleteness(beer, recipe),
      }),
    );

    // ADR-0016 D5: filter the FULL scored set BEFORE truncating to top-N, so a
    // reliable match ranked just below a high-strength-but-low-completeness
    // candidate is never hidden by the cut. A candidate is shown only when its
    // match strength AND its completeness both clear the thresholds.
    const accepted = scored.filter(
      (s) => s.score >= SCAN_MATCH_S_MIN && s.completeness >= SCAN_MATCH_C_MIN,
    );

    // Deterministic ordering: match strength desc, then avg_rating desc (a
    // higher-rated peer wins ties — rating is a tie-break only since v2,
    // ADR-0016), then recipe id ascending (lexicographic, stable across DBs and
    // restarts; without it the ranking falls back on the DB return order which
    // is not guaranteed — Codex P2 on PR #773).
    accepted.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ratingDelta =
        (b.recipe.avg_rating ?? 0) - (a.recipe.avg_rating ?? 0);
      if (ratingDelta !== 0) return ratingDelta;
      return a.recipe.id.localeCompare(b.recipe.id);
    });

    const top = accepted.slice(0, Math.max(1, Math.min(limit, 10)));

    // `low_confidence` is true when nothing cleared the acceptance thresholds —
    // the mobile renders an honest "no reliable equivalent" empty state rather
    // than a misleading closest match (ADR-0016 D5).
    const lowConfidence = top.length === 0;

    return {
      rankings: top,
      low_confidence: lowConfidence,
    };
  }

  /**
   * Match strength for a single recipe against a beer (0..100) = SIMILARITY
   * only (ADR-0016). The style-gated official shortcut (#1193 / D6) returns 100
   * for a style-compatible official (`is_official` AND a positive style
   * sub-score); an off-style official is ranked on its honest similarity
   * instead, so a same-style non-official can outrank it. Community quality is
   * NOT blended in — `avg_rating` is a tie-break in `rankByCharacteristics`,
   * not part of the score.
   */
  computeFinalScore(
    beer: BeerCharacteristics,
    recipe: RecipeOrmEntity,
  ): number {
    const styleScore = this.maybeStyleScore(beer.style, recipe.style);
    const styleCompatible = styleScore !== null && styleScore > 0;
    if (recipe.is_official && styleCompatible) {
      return 100;
    }
    return this.computeSimilarity(beer, recipe);
  }

  /**
   * The comparable similarity criteria with their ADR-0016 full-data weights
   * (style 40, colour 22, bitterness 18, ABV 14). Each `score` is the local
   * similarity (0..100) or `null` when the criterion is absent on either side
   * (→ dropped by Gower renormalisation). Shared by `computeSimilarity` (the
   * weighted average) and `computeCompleteness` (the present-weight ratio) so
   * the two can never drift.
   */
  private similarityComponents(
    beer: BeerCharacteristics,
    recipe: RecipeOrmEntity,
  ): { weight: number; score: number | null }[] {
    return [
      { weight: 40, score: this.maybeStyleScore(beer.style, recipe.style) },
      {
        weight: 22,
        score: this.maybeColorScore(beer.color_ebc, recipe.ebc_target),
      },
      {
        weight: 18,
        score: this.maybeBitternessScore(beer.ibu, recipe.ibu_target),
      },
      { weight: 14, score: this.maybeAbvScore(beer.abv, recipe.abv_estimated) },
    ];
  }

  /**
   * Similarity (0..100): the renormalised weighted average over the present
   * criteria (ADR-0016 D3, Gower — a missing criterion drops from both
   * numerator and denominator). Returns 0 when no criterion is comparable.
   */
  computeSimilarity(
    beer: BeerCharacteristics,
    recipe: RecipeOrmEntity,
  ): number {
    return this.weightedAverageWithRenorm(
      this.similarityComponents(beer, recipe),
    );
  }

  /**
   * Completeness (0..1): how much of the full ADR-0016 picture the comparison
   * actually used = Σ present weight / 100. The denominator is the full
   * five-criterion total; the ingredients criterion (weight 6) is not compared
   * yet, so completeness caps at 0.94 for now — an honest reflection that we
   * never have the whole picture (ADR-0016 D4).
   */
  computeCompleteness(
    beer: BeerCharacteristics,
    recipe: RecipeOrmEntity,
  ): number {
    const presentWeight = this.similarityComponents(beer, recipe)
      .filter((c) => c.score !== null)
      .reduce((sum, c) => sum + c.weight, 0);
    return presentWeight / RecipeMatchingService.TOTAL_CRITERIA_WEIGHT;
  }

  /**
   * Weighted-average helper with renormalization on missing
   * components. Components with `score === null` are dropped, the
   * remaining weights are redistributed pro-rata, and the average
   * is computed over the present components only.
   *
   * Edge: if every component is null, returns 0.
   */
  private weightedAverageWithRenorm(
    components: { weight: number; score: number | null }[],
  ): number {
    const present = components.filter(
      (c): c is { weight: number; score: number } => c.score !== null,
    );
    if (present.length === 0) return 0;
    const totalWeight = present.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight === 0) return 0;
    return (
      present.reduce((sum, c) => sum + c.score * c.weight, 0) / totalWeight
    );
  }

  // ------------------------------------------------------------------
  // Sub-score helpers — each returns 0..100, or null if the input is
  // missing on either side (which signals the renormalization helper
  // to drop the component from the weighted average rather than
  // counting it as 0).
  // ------------------------------------------------------------------

  scoreAbv(
    beerAbv: number | null | undefined,
    recipeAbv: number | null | undefined,
  ): number {
    if (
      beerAbv === null ||
      beerAbv === undefined ||
      recipeAbv === null ||
      recipeAbv === undefined
    ) {
      return 0;
    }
    const gap = Math.abs(beerAbv - recipeAbv);
    return Math.max(0, 100 - 25 * gap);
  }

  /**
   * Bitterness similarity (0..100). Categorical match on the IBU
   * bands from `docs/product/vocab-mapping.md`:
   *   <20 IBU = soft, 20-40 = marked, 40-60 = very marked,
   *   60-80 = intense, 80+ = extreme.
   *
   * Same band → 100, neighbouring band → 60, two-or-more bands
   * apart → 0. Either side missing → 0 (consumer should drop via
   * `maybeBitternessScore`).
   */
  scoreBitterness(
    beerIbu: number | null | undefined,
    recipeIbu: number | null | undefined,
  ): number {
    if (
      beerIbu === null ||
      beerIbu === undefined ||
      recipeIbu === null ||
      recipeIbu === undefined
    ) {
      return 0;
    }
    const beerBand = this.ibuBand(beerIbu);
    const recipeBand = this.ibuBand(recipeIbu);
    const distance = Math.abs(beerBand - recipeBand);
    if (distance === 0) return 100;
    if (distance === 1) return 60;
    return 0;
  }

  private ibuBand(ibu: number): number {
    if (ibu < 20) return 0;
    if (ibu < 40) return 1;
    if (ibu < 60) return 2;
    if (ibu < 80) return 3;
    return 4;
  }

  /**
   * Color similarity (0..100). Categorical match on the EBC bands
   * from `docs/product/vocab-mapping.md`:
   *   <8 EBC = pale, 8-16 = doré, 16-30 = ambré, 30-60 = brun,
   *   60+ = noir.
   *
   * Same band → 100, neighbouring band → 60, two-or-more bands
   * apart → 0. Either side missing → 0 (consumer should drop via
   * `maybeColorScore`).
   */
  scoreColor(
    beerEbc: number | null | undefined,
    recipeEbc: number | null | undefined,
  ): number {
    if (
      beerEbc === null ||
      beerEbc === undefined ||
      recipeEbc === null ||
      recipeEbc === undefined
    ) {
      return 0;
    }
    const beerBand = this.ebcBand(beerEbc);
    const recipeBand = this.ebcBand(recipeEbc);
    const distance = Math.abs(beerBand - recipeBand);
    if (distance === 0) return 100;
    if (distance === 1) return 60;
    return 0;
  }

  private ebcBand(ebc: number): number {
    if (ebc < 8) return 0;
    if (ebc < 16) return 1;
    if (ebc < 30) return 2;
    if (ebc < 60) return 3;
    return 4;
  }

  // ------------------------------------------------------------------
  // Renormalization-friendly wrappers — return null when the input is
  // missing so `weightedAverageWithRenorm` drops the weight rather
  // than counting a 0 score (which would unfairly penalize the
  // recipe). Public consumers stick to the `score*` methods above
  // for direct testing without renorm coupling.
  // ------------------------------------------------------------------

  private maybeStyleScore(
    beerStyle: string | null | undefined,
    recipeStyle: string | null | undefined,
  ): number | null {
    // Graded by BJCP family (ADR-0016 D2). `styleSimilarity` returns 0..1 — or
    // `null` when either side is blank/unclassifiable, so the criterion drops
    // out of the renormalisation rather than scoring a 0 penalty (Copilot
    // review on #1190). Scale to the 0..100 local-similarity range.
    const sim = styleSimilarity(beerStyle ?? null, recipeStyle ?? null);
    return sim === null ? null : sim * 100;
  }

  private maybeAbvScore(
    beerAbv: number | null | undefined,
    recipeAbv: number | null | undefined,
  ): number | null {
    if (
      beerAbv === null ||
      beerAbv === undefined ||
      recipeAbv === null ||
      recipeAbv === undefined
    ) {
      return null;
    }
    return this.scoreAbv(beerAbv, recipeAbv);
  }

  private maybeBitternessScore(
    beerIbu: number | null | undefined,
    recipeIbu: number | null | undefined,
  ): number | null {
    if (
      beerIbu === null ||
      beerIbu === undefined ||
      recipeIbu === null ||
      recipeIbu === undefined
    ) {
      return null;
    }
    return this.scoreBitterness(beerIbu, recipeIbu);
  }

  private maybeColorScore(
    beerEbc: number | null | undefined,
    recipeEbc: number | null | undefined,
  ): number | null {
    if (
      beerEbc === null ||
      beerEbc === undefined ||
      recipeEbc === null ||
      recipeEbc === undefined
    ) {
      return null;
    }
    return this.scoreColor(beerEbc, recipeEbc);
  }
}
