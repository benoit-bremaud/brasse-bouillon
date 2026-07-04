import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { RecipeDifficultyDomainService } from '../domain/services/recipe-difficulty.domain.service';
import {
  DifficultyInput,
  DifficultyResult,
} from '../domain/services/recipe-difficulty.types';
import { RecipeYeastType } from '../domain/enums/recipe-yeast-type.enum';
import { RecipeAdditiveOrmEntity } from '../entities/recipe-additive.orm.entity';
import { RecipeFermentableOrmEntity } from '../entities/recipe-fermentable.orm.entity';
import { RecipeHopOrmEntity } from '../entities/recipe-hop.orm.entity';
import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeWaterOrmEntity } from '../entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from '../entities/recipe-yeast.orm.entity';

/**
 * Application service that keeps a recipe's stored brewing difficulty in sync
 * with its data (ADR-0024 D3). It is the only writer of `difficulty_computed` /
 * `difficulty_reasons`; the author override is written by the recipe update
 * flow and never touched here. The scoring rules themselves live in the pure
 * `RecipeDifficultyDomainService` — this service only adapts the persisted
 * recipe + its sub-entities onto the domain input and persists the result.
 *
 * Called after every mutation that can change the score: recipe create/update,
 * community import, and each ingredient (fermentable / hop / yeast / additive /
 * water) mutation.
 */
@Injectable()
export class RecipeDifficultyService {
  constructor(
    @InjectRepository(RecipeOrmEntity)
    private readonly recipeRepo: Repository<RecipeOrmEntity>,
  ) {}

  /**
   * Recomputes and persists `difficulty_computed` + `difficulty_reasons` for a
   * recipe. Pass the transaction `manager` when called inside one (create /
   * import) so the recompute participates in the same transaction; omit it for
   * the standalone ingredient mutations (their own save already committed —
   * a recompute is idempotent and self-heals on the next mutation).
   *
   * Returns the computed result, or `null` if the recipe no longer exists
   * (e.g. it was deleted between the mutation and the recompute).
   */
  async recomputeForRecipe(
    recipeId: string,
    manager?: EntityManager,
  ): Promise<DifficultyResult | null> {
    const em = manager ?? this.recipeRepo.manager;
    const recipeRepo = em.getRepository(RecipeOrmEntity);

    const recipe = await recipeRepo.findOne({ where: { id: recipeId } });
    if (!recipe) {
      return null;
    }

    const input = await this.buildInput(recipe, em);
    const result = RecipeDifficultyDomainService.compute(input);

    recipe.difficulty_computed = result.computed;
    recipe.difficulty_reasons = result.reasons;
    await recipeRepo.save(recipe);

    return result;
  }

  /** Maps a recipe + its sub-entities onto the pure domain input shape. */
  private async buildInput(
    recipe: RecipeOrmEntity,
    em: EntityManager,
  ): Promise<DifficultyInput> {
    const recipeId = recipe.id;
    const [yeasts, water, fermentables, hops, additives] = await Promise.all([
      // Ordered so the multi-yeast "first row within a class wins" reduction is
      // deterministic (a bare find() has no defined row order).
      em.getRepository(RecipeYeastOrmEntity).find({
        where: { recipe_id: recipeId },
        order: { created_at: 'ASC' },
      }),
      em.getRepository(RecipeWaterOrmEntity).findOne({
        where: { recipe_id: recipeId },
      }),
      em.getRepository(RecipeFermentableOrmEntity).find({
        where: { recipe_id: recipeId },
      }),
      em.getRepository(RecipeHopOrmEntity).find({
        where: { recipe_id: recipeId },
      }),
      em.getRepository(RecipeAdditiveOrmEntity).find({
        where: { recipe_id: recipeId },
      }),
    ]);

    return {
      ogTarget: recipe.og_target ?? null,
      abvEstimated: recipe.abv_estimated ?? null,
      ebcTarget: recipe.ebc_target ?? null,
      yeast: this.reduceYeast(yeasts),
      water: water
        ? {
            phTarget: water.ph_target ?? null,
            calciumPpm: water.calcium_ppm ?? null,
            magnesiumPpm: water.magnesium_ppm ?? null,
            sulfatePpm: water.sulfate_ppm ?? null,
            chloridePpm: water.chloride_ppm ?? null,
          }
        : null,
      distinctFermentables: this.distinctCount(fermentables.map((f) => f.name)),
      distinctHopVarieties: this.distinctCount(hops.map((h) => h.variety)),
      additives: additives.length,
    };
  }

  /**
   * Reduces a recipe's yeasts (0..*) to the single worst-case yeast the domain
   * scores. The class priority mirrors the domain's `yeastClass` ranking —
   * wild/brett > lager > ale — and among a class the first row wins, carrying
   * its own fermentation temperature. A recipe normally has one yeast; the rare
   * divergent multi-ale case falls back to the first ale (author override is the
   * escape hatch). Documented v1 reduction (spec §6).
   */
  private reduceYeast(
    yeasts: RecipeYeastOrmEntity[],
  ): DifficultyInput['yeast'] {
    if (yeasts.length === 0) {
      return null;
    }
    const dominant =
      yeasts.find(
        (y) =>
          y.type === RecipeYeastType.WILD || y.type === RecipeYeastType.BRETT,
      ) ??
      yeasts.find((y) => y.type === RecipeYeastType.LAGER) ??
      yeasts[0];
    return {
      type: dominant.type,
      temperatureMaxC: dominant.temperature_max_c ?? null,
    };
  }

  /** Counts distinct non-empty values, case-insensitively (F6 varieties). */
  private distinctCount(
    values: ReadonlyArray<string | null | undefined>,
  ): number {
    const seen = new Set<string>();
    for (const value of values) {
      const key = value?.trim().toLowerCase();
      if (key) {
        seen.add(key);
      }
    }
    return seen.size;
  }
}
