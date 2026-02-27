export type IngredientCategory = "malt" | "hop" | "yeast";

type IngredientBase = {
  id: string;
  name: string;
  category: IngredientCategory;
  origin?: string;
  supplier?: string;
  notes?: string;
};

export type MaltIngredient = IngredientBase & {
  category: "malt";
  maltType: "base" | "caramel" | "roasted" | "specialty";
  ebc: number;
  potentialSg: number;
  maxPercent: number;
};

export type HopIngredient = IngredientBase & {
  category: "hop";
  form: "pellet" | "whole";
  hopUse: "bittering" | "aroma" | "dual";
  alphaAcid: number;
  betaAcid: number;
};

export type YeastIngredient = IngredientBase & {
  category: "yeast";
  yeastType: "ale" | "lager" | "wheat" | "belgian";
  attenuationMin: number;
  attenuationMax: number;
  flocculation: "low" | "medium" | "high";
  fermentationMinC: number;
  fermentationMaxC: number;
};

export type Ingredient = MaltIngredient | HopIngredient | YeastIngredient;

export type IngredientFilters = {
  search?: string;
  ebcMin?: number;
  ebcMax?: number;
  alphaAcidMin?: number;
  attenuationMin?: number;
};

export type IngredientCategorySummary = {
  category: IngredientCategory;
  count: number;
};
