export type IngredientCategory = "malt" | "hop" | "yeast" | "misc";

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

/**
 * BeerXML 1.0 `<MISC>`: spices, finings, water agents, herbs, flavour
 * adjuncts — the "Accessoires" rayon.
 *
 * Every spec is optional, unlike the other variants, because the catalog
 * columns are genuinely nullable: a fining has no `useFor`, a spice has no
 * `timeMin`. Requiring them would force the mapper to invent values.
 * `miscType` stays a plain string rather than a literal union, mirroring
 * `MiscProduct`: the API serves it free-form and nothing validates it, so a
 * union here would claim a guarantee we do not enforce.
 */
export type MiscIngredient = IngredientBase & {
  category: "misc";
  miscType?: string;
  useAt?: string;
  useFor?: string;
  timeMin?: number;
};

export type Ingredient =
  | MaltIngredient
  | HopIngredient
  | YeastIngredient
  | MiscIngredient;

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
