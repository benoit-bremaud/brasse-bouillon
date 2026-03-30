/**
 * RecipeVisibility
 *
 * Represents how a recipe can be accessed and shared.
 * - PRIVATE: Only the owner (and admins) can access the recipe.
 * - UNLISTED: Accessible via direct link but not listed in public catalogs.
 * - PUBLIC: Listed and discoverable by all users.
 */
export enum RecipeVisibility {
  PRIVATE = 'private',
  UNLISTED = 'unlisted',
  PUBLIC = 'public',
}
