export type RecipeVisibility = "private" | "unlisted" | "public";

/** Brewing-difficulty level of a recipe (how hard it is to brew). ADR-0024. */
export type RecipeDifficultyLevel = "facile" | "intermediaire" | "avance";

/** One stored tap-to-explain line for the difficulty badge (ADR-0024 D4). */
export type RecipeDifficultyReason = {
  factor: string;
  tier: number;
  sentence: string;
};

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
  // Issue #779 — optional because the public catalog API
  // (`GET /recipes/public`) projects through `PublicRecipeDto`
  // which strips `owner_id` to avoid leaking author UUIDs to every
  // authenticated reader. The Mon Carnet path still receives the
  // full DTO with `owner_id`. Reading code must not assume the
  // field is present on a recipe sourced from the catalog.
  ownerId?: string;
  name: string;
  description?: string | null;
  stats?: RecipeStats | null;
  ingredients?: RecipeIngredientRef[];
  equipment?: RecipeEquipmentRef[];
  visibility: RecipeVisibility;
  version: number;
  rootRecipeId: string;
  parentRecipeId?: string | null;
  // Brewing-difficulty badge (ADR-0024). Optional — absent on recipes fetched
  // before the feature, and the mobile is a pure consumer (never computes it).
  // The badge shows `difficultyEffective` (= override ?? computed).
  difficultyComputed?: RecipeDifficultyLevel;
  difficultyOverride?: RecipeDifficultyLevel | null;
  difficultyEffective?: RecipeDifficultyLevel;
  difficultyReasons?: RecipeDifficultyReason[];
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
