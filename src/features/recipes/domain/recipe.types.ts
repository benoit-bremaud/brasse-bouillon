export type RecipeVisibility = 'private' | 'unlisted' | 'public';

export type Recipe = {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  visibility: RecipeVisibility;
  version: number;
  rootRecipeId: string;
  parentRecipeId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecipeStepType =
  | 'mash'
  | 'boil'
  | 'whirlpool'
  | 'fermentation'
  | 'packaging';

export type RecipeStep = {
  recipeId: string;
  stepOrder: number;
  type: RecipeStepType;
  label: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};
