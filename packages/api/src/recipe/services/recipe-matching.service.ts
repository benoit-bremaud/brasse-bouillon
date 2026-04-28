import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';
import { ScanCatalogItemOrmEntity } from '../../scan/entities/scan-catalog-item.orm.entity';
import { RankedRecipeDto } from '../dtos/ranked-recipe.dto';

/**
 * Score-based recipe matching (Issue #699 — minimal viable demo scope).
 *
 * The 2026-04-24 brainstorm specifies a 7-component formula. This
 * implementation ships the two heaviest similarity weights plus the
 * dominant quality signal, which is enough to order the curated top-3
 * editorially:
 *
 *   similarity (75%) = style (50%) + ABV (25%)
 *   quality    (25%) = avg_rating
 *   final      = similarity + quality        // already 0..100
 *
 * Bitterness, color, brew_count_confidence and recency are deferred
 * to v0.2 — they refine the ranking but rarely change the top-3 on
 * the curated seed set, and the demo runs against that seed.
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
  ): Promise<RankedRecipeDto[]> {
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

    const scored = candidates.map((recipe) => ({
      recipe,
      score: this.computeFinalScore(beer, recipe),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.max(1, Math.min(limit, 10)));
  }

  /**
   * Final score for a single recipe against a beer. Range 0..100.
   * The official-recipe shortcut wins outright — flagged content
   * always tops the editorial ranking regardless of metrics drift.
   */
  computeFinalScore(
    beer: ScanCatalogItemOrmEntity,
    recipe: RecipeOrmEntity,
  ): number {
    if (recipe.is_official) {
      return 100;
    }
    const similarity =
      this.scoreStyle(beer.style, recipe.style) * 0.5 +
      this.scoreAbv(beer.abv, recipe.abv_estimated) * 0.25;
    const quality = this.scoreQuality(recipe.avg_rating) * 0.25;
    return similarity + quality;
  }

  /**
   * Style similarity (0..100). Exact match → 100, same-family
   * substring containment (e.g. "IPA" ⊂ "Session IPA") → 70, else → 0.
   * Comparison is case-insensitive and ignores leading/trailing space.
   */
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

  /**
   * ABV similarity (0..100). Linear decay 25 points per percent gap:
   * 0% → 100, 2% → 50, 4%+ → 0. Either side missing → 0.
   */
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
   * Quality signal from `avg_rating` (0..100). Linear map:
   * 1.0 → 20, 5.0 → 100. Null avg_rating → 0 (an unrated recipe
   * should not crowd out a well-rated peer of similar similarity).
   */
  scoreQuality(avgRating: number | null | undefined): number {
    if (avgRating === null || avgRating === undefined) return 0;
    if (avgRating <= 0) return 0;
    const clamped = Math.max(1, Math.min(5, avgRating));
    return ((clamped - 1) / 4) * 80 + 20;
  }
}
