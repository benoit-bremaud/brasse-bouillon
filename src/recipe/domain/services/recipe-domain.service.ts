import { Recipe, RecipeId, UserId } from '../entities/recipe.entity';
import { RecipeVisibility } from '../enums/recipe-visibility.enum';

export interface CreateRecipeInput {
  id: RecipeId;
  ownerId: UserId;
  name: string;
  description?: string;
  visibility?: RecipeVisibility;
}

export interface ForkRecipeInput {
  /** Identifier for the newly created forked recipe */
  id: RecipeId;

  /**
   * Owner of the fork. If omitted, the owner of the source
   * recipe will be reused.
   */
  ownerId?: UserId;

  /** Optional override for name */
  name?: string;

  /** Optional override for description */
  description?: string;

  /** Optional override for visibility */
  visibility?: RecipeVisibility;
}

/**
 * Pure domain service for creating and forking recipes.
 *
 * This service encapsulates the business rules around:
 * - Initial recipe creation
 * - Versioning and forking
 *
 * It is intentionally framework-agnostic and can be used in
 * application services or use-cases without pulling in NestJS
 * or database concerns.
 */
export class RecipeDomainService {
  constructor(private readonly now: () => Date = () => new Date()) {}

  /**
   * Creates a brand new root recipe (version 1).
   */
  createRecipe(input: CreateRecipeInput): Recipe {
    const createdAt = this.now();

    return {
      id: input.id,
      ownerId: input.ownerId,
      name: input.name,
      description: input.description,
      visibility: input.visibility ?? RecipeVisibility.PRIVATE,
      version: 1,
      rootRecipeId: input.id,
      parentRecipeId: undefined,
      createdAt,
      updatedAt: createdAt,
    };
  }

  /**
   * Creates a new recipe version by forking an existing one.
   *
   * Rules:
   * - Version is incremented relative to the source recipe.
   * - rootRecipeId remains the original root id for the lineage.
   * - parentRecipeId points to the direct parent recipe.
   * - Owner defaults to the source owner unless overridden.
   */
  forkRecipe(source: Recipe, input: ForkRecipeInput): Recipe {
    const createdAt = this.now();

    return {
      id: input.id,
      ownerId: input.ownerId ?? source.ownerId,
      name: input.name ?? source.name,
      description: input.description ?? source.description,
      visibility: input.visibility ?? source.visibility,
      version: source.version + 1,
      rootRecipeId: source.rootRecipeId,
      parentRecipeId: source.id,
      createdAt,
      updatedAt: createdAt,
    };
  }
}
