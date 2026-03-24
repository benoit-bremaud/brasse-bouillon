export type RecipeVisibility = "private" | "unlisted" | "public";

export type RecipeStats = {
  ibu: number;
  abv: number;
  og: number;
  fg: number;
  volumeLiters: number;
  colorEbc?: number;
};

export type RecipeIngredientUnit = "kg" | "g" | "l" | "ml" | "unit";

export type RecipeIngredientRef = {
  ingredientId: string;
  amount: number;
  unit: RecipeIngredientUnit;
  timing?: string | null;
  notes?: string | null;
};

export type RecipeEquipmentRef = {
  equipmentId: string;
  role?: string | null;
  notes?: string | null;
};

export type Recipe = {
  id: string;
  ownerId: string;
  name: string;
  description?: string | null;
  stats?: RecipeStats | null;
  ingredients?: RecipeIngredientRef[];
  equipment?: RecipeEquipmentRef[];
  visibility: RecipeVisibility;
  version: number;
  rootRecipeId: string;
  parentRecipeId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RecipeStepType =
  | "mash"
  | "boil"
  | "whirlpool"
  | "fermentation"
  | "packaging";

export type RecipeStep = {
  recipeId: string;
  stepOrder: number;
  type: RecipeStepType;
  label: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};
