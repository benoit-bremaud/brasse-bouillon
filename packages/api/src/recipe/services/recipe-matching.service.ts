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

/**
 * Score-based recipe matching — full brainstorm scan-2026-04-24 §3
 * formula. Extends the minimal-viable scope shipped in PR #773 with
 * the four remaining components, weight renormalization when a
 * criterion is missing, and the `low_confidence` flag on the
 * response.
 *
 *   SIMILARITY (70%) = official ? 100 :
 *                      style × 50 + ABV × 25 + bitterness × 15 + color × 10
 *                      (weights renormalized if a criterion is missing)
 *
 *   QUALITY    (30%) = avg_rating × 60 + brew_count_confidence × 30 + recency × 10
 *                      (weights renormalized if a criterion is missing)
 *
 *   FINAL            = similarity × 0.7 + quality × 0.3
 *
 *   low_confidence   = true when the best match scores below 40
 *                      (response envelope flag, lets the UI display
 *                      a discreet "no very similar recipe" warning).
 *
 * The official-recipe shortcut still applies — `is_official=true`
 * sets similarity to 100 by definition; quality still varies.
 *
 * Sub-score scales (0..100):
 * - style — exact match 100, family containment 70, else 0
 * - ABV — linear `max(0, 100 - 25 × |gap|)` so 0% gap → 100, 4%+ → 0
 * - bitterness — categorical match on soft / marked / very marked
 *   bands derived from the docs/product/vocab-mapping.md table
 * - color — categorical match on pale / amber / brown / black bands
 *   from the same vocab mapping (EBC scale)
 * - avg_rating — linear `((rating - 1) / 4) × 80 + 20` so 1.0 → 20,
 *   5.0 → 100 ; null → 0 (do not crowd out rated peers)
 * - brew_count_confidence — logarithmic: 0 → 0, 1 → 30, 5 → 60,
 *   20 → 80, 100 → 95, 500+ → 100. Prevents a recent excellent
 *   recipe from being unfairly downgraded versus old recipes with
 *   many brews.
 * - recency — decay from `last_brewed_at`: <30d → 100, <90d → 80,
 *   <1yr → 60, <2yr → 40, 2yr+ → 20, null → 0.
 */
@Injectable()
export class RecipeMatchingService {
  constructor(
    @InjectRepository(RecipeOrmEntity)
    private readonly recipeRepo: Repository<RecipeOrmEntity>,
    @InjectRepository(ScanCatalogItemOrmEntity)
    private readonly catalogRepo: Repository<ScanCatalogItemOrmEntity>,
  ) {}

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

    const candidates = await this.recipeRepo.find({
      where: { visibility: RecipeVisibility.PUBLIC },
    });

    const scored = candidates.map(
      (recipe): RankedRecipeDto => ({
        recipe,
        score: this.computeFinalScore(beer, recipe),
      }),
    );

    // Deterministic ordering: primary on score desc, secondary on
    // avg_rating desc (a higher-rated peer wins ties), tertiary on
    // recipe id ascending (lexicographic, stable across DBs and
    // restarts). Without these tie-breakers the ranking falls back
    // on the DB return order which is not guaranteed — Codex P2 on
    // PR #773.
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const ratingDelta =
        (b.recipe.avg_rating ?? 0) - (a.recipe.avg_rating ?? 0);
      if (ratingDelta !== 0) return ratingDelta;
      return a.recipe.id.localeCompare(b.recipe.id);
    });

    const top = scored.slice(0, Math.max(1, Math.min(limit, 10)));
    const lowConfidence = top.length === 0 || top[0].score < 40;

    return {
      rankings: top,
      low_confidence: lowConfidence,
    };
  }

  /**
   * Final score for a single recipe against a beer. Range 0..100.
   * Combines similarity (70%) and quality (30%), each computed with
   * weight renormalization if a sub-criterion is missing.
   *
   * The official-recipe shortcut wins outright on the similarity
   * axis only — quality still varies, so two officials can be
   * ranked relative to each other by their rating/brew_count/recency.
   */
  computeFinalScore(
    beer: ScanCatalogItemOrmEntity,
    recipe: RecipeOrmEntity,
  ): number {
    const similarity = recipe.is_official
      ? 100
      : this.computeSimilarity(beer, recipe);
    const quality = this.computeQuality(recipe);
    return similarity * 0.7 + quality * 0.3;
  }

  /**
   * Similarity score (0..100). Combines style (50%), ABV (25%),
   * bitterness (15%) and color (10%). When a criterion is missing
   * (null on either side), its weight is redistributed pro-rata to
   * the criteria that ARE present — so a recipe with no IBU still
   * gets a fair chance instead of an automatic -15 penalty.
   *
   * Returns 0 if all four criteria are missing.
   */
  computeSimilarity(
    beer: ScanCatalogItemOrmEntity,
    recipe: RecipeOrmEntity,
  ): number {
    const components: { weight: number; score: number | null }[] = [
      { weight: 50, score: this.maybeStyleScore(beer.style, recipe.style) },
      { weight: 25, score: this.maybeAbvScore(beer.abv, recipe.abv_estimated) },
      {
        weight: 15,
        score: this.maybeBitternessScore(beer.ibu, recipe.ibu_target),
      },
      {
        weight: 10,
        score: this.maybeColorScore(beer.color_ebc, recipe.ebc_target),
      },
    ];
    return this.weightedAverageWithRenorm(components);
  }

  /**
   * Quality score (0..100). Combines avg_rating (60%),
   * brew_count_confidence (30%) and recency (10%). Same
   * renormalization principle as similarity — a recipe without
   * brew history still gets credit for its rating instead of an
   * automatic -40 penalty.
   *
   * Returns 0 if all three criteria are missing.
   */
  computeQuality(recipe: RecipeOrmEntity): number {
    const components: { weight: number; score: number | null }[] = [
      { weight: 60, score: this.maybeRatingScore(recipe.avg_rating) },
      {
        weight: 30,
        score: this.maybeBrewCountScore(recipe.brew_count),
      },
      {
        weight: 10,
        score: this.maybeRecencyScore(recipe.last_brewed_at),
      },
    ];
    return this.weightedAverageWithRenorm(components);
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

  scoreStyle(
    beerStyle: string | null | undefined,
    recipeStyle: string | null | undefined,
  ): number {
    if (!beerStyle || !recipeStyle) return 0;
    const a = beerStyle.trim().toLowerCase();
    const b = recipeStyle.trim().toLowerCase();
    if (!a || !b) return 0;
    if (a === b) return 100;
    if (a.includes(b) || b.includes(a)) return 70;
    return 0;
  }

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

  scoreQuality(avgRating: number | null | undefined): number {
    if (avgRating === null || avgRating === undefined) return 0;
    if (avgRating <= 0) return 0;
    const clamped = Math.max(1, Math.min(5, avgRating));
    return ((clamped - 1) / 4) * 80 + 20;
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

  /**
   * Brew count confidence (0..100). Logarithmic so that a recent
   * excellent recipe with one brew is not unfairly downgraded
   * versus an old recipe with many brews:
   *   0 → 0, 1 → 30, 5 → 60, 20 → 80, 100 → 95, 500+ → 100.
   *
   * Linear interpolation between the documented anchors. Null /
   * negative inputs return 0.
   */
  scoreBrewCount(brewCount: number | null | undefined): number {
    if (brewCount === null || brewCount === undefined) return 0;
    if (brewCount <= 0) return 0;
    // Anchor table — strictly monotonic.
    const anchors: { count: number; score: number }[] = [
      { count: 1, score: 30 },
      { count: 5, score: 60 },
      { count: 20, score: 80 },
      { count: 100, score: 95 },
      { count: 500, score: 100 },
    ];
    if (brewCount <= anchors[0].count) return anchors[0].score * brewCount;
    if (brewCount >= anchors[anchors.length - 1].count) {
      return anchors[anchors.length - 1].score;
    }
    for (let i = 0; i < anchors.length - 1; i += 1) {
      const lo = anchors[i];
      const hi = anchors[i + 1];
      if (brewCount >= lo.count && brewCount <= hi.count) {
        const t = (brewCount - lo.count) / (hi.count - lo.count);
        return lo.score + t * (hi.score - lo.score);
      }
    }
    return 0;
  }

  /**
   * Recency decay (0..100). Penalizes stale recipes:
   *   <30 days → 100, <90 → 80, <365 → 60, <730 → 40, 2y+ → 20.
   *   null → 0 (never brewed).
   */
  scoreRecency(lastBrewedAt: Date | string | null | undefined): number {
    if (lastBrewedAt === null || lastBrewedAt === undefined) return 0;
    const date =
      lastBrewedAt instanceof Date ? lastBrewedAt : new Date(lastBrewedAt);
    if (Number.isNaN(date.getTime())) return 0;
    const ageDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays < 30) return 100;
    if (ageDays < 90) return 80;
    if (ageDays < 365) return 60;
    if (ageDays < 730) return 40;
    return 20;
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
    if (!beerStyle || !recipeStyle) return null;
    return this.scoreStyle(beerStyle, recipeStyle);
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

  private maybeRatingScore(
    avgRating: number | null | undefined,
  ): number | null {
    if (avgRating === null || avgRating === undefined) return null;
    return this.scoreQuality(avgRating);
  }

  private maybeBrewCountScore(
    brewCount: number | null | undefined,
  ): number | null {
    if (brewCount === null || brewCount === undefined || brewCount <= 0) {
      return null;
    }
    return this.scoreBrewCount(brewCount);
  }

  private maybeRecencyScore(
    lastBrewedAt: Date | string | null | undefined,
  ): number | null {
    if (lastBrewedAt === null || lastBrewedAt === undefined) return null;
    return this.scoreRecency(lastBrewedAt);
  }
}
