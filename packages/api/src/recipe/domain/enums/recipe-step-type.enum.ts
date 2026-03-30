/**
 * RecipeStepType
 *
 * High-level brewing workflow steps for a recipe.
 * The order is important for the standard brewing flow:
 * - MASH -> BOIL -> WHIRLPOOL -> FERMENTATION -> PACKAGING
 */
export enum RecipeStepType {
  MASH = 'mash',
  BOIL = 'boil',
  WHIRLPOOL = 'whirlpool',
  FERMENTATION = 'fermentation',
  PACKAGING = 'packaging',
}
