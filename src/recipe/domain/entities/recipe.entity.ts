import { RecipeVisibility } from '../enums/recipe-visibility.enum';

/**
 * Unique identifier type for a Recipe aggregate.
 */
export type RecipeId = string;

/**
 * Unique identifier type for a User.
 */
export type UserId = string;

/**
 * Core domain representation of a brewing recipe.
 *
 * This entity is framework-agnostic and must not depend on
 * NestJS, TypeORM, or any infrastructure concerns.
 *
 * Versioning and forking model:
 * - Each saved variant of a recipe is a new Recipe instance.
 * - `version` starts at 1 for the original recipe.
 * - `rootRecipeId` points to the very first recipe in the chain.
 * - `parentRecipeId` points to the direct parent of the current version.
 *   This allows building a version tree or history graph.
 */
export interface Recipe {
  /** Technical identifier of this specific recipe version */
  readonly id: RecipeId;

  /** Owner of the recipe (creator or fork owner) */
  readonly ownerId: UserId;

  /** Human-readable name of the recipe */
  readonly name: string;

  /** Optional short description or summary */
  readonly description?: string;

  /** Visibility and sharing settings */
  readonly visibility: RecipeVisibility;

  /**
   * Version number within the recipe lineage.
   * Starts at 1 for the original recipe and increments on fork/version.
   */
  readonly version: number;

  /** Identifier of the original recipe in the lineage (root of the tree) */
  readonly rootRecipeId: RecipeId;

  /** Identifier of the direct parent version in the lineage */
  readonly parentRecipeId?: RecipeId;

  /** Creation timestamp */
  readonly createdAt: Date;

  /** Last update timestamp */
  readonly updatedAt: Date;
}
