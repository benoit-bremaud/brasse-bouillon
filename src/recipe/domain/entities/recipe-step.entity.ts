import { RecipeStepType } from '../enums/recipe-step-type.enum';

/**
 * Domain representation of a single step in a brewing recipe.
 *
 * This model is intentionally simple and framework-agnostic.
 * Detailed fields (e.g. temperatures, volumes, timers) will be
 * introduced in future iterations.
 */
export interface RecipeStep {
  /**
   * Position of the step within the recipe workflow (0-based).
   */
  readonly order: number;

  /**
   * High-level type of the step (mash/boil/whirlpool/fermentation/packaging).
   */
  readonly type: RecipeStepType;

  /**
   * Short human-readable label.
   */
  readonly label: string;

  /**
   * Optional longer description or instructions.
   */
  readonly description?: string;
}
