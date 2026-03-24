import type { WaterStylePresetId } from "@/features/tools/domain/water-profiles";

export type RecipeVolumeInputMode = "manual" | "equipment";

export const RECIPE_VOLUME_INPUT_MODES: {
  id: RecipeVolumeInputMode;
  label: string;
  helper: string;
}[] = [
  {
    id: "manual",
    label: "Target volume",
    helper: "Set the desired liters directly.",
  },
  {
    id: "equipment",
    label: "Equipment capacity",
    helper: "Use your selected kettle max volume.",
  },
];

export type RecipeProcessDisplayMode = "phases" | "recipe" | "compact";

export const RECIPE_PROCESS_DISPLAY_OPTIONS: {
  id: RecipeProcessDisplayMode;
  label: string;
}[] = [
  { id: "phases", label: "Brew phases" },
  { id: "recipe", label: "Recipe steps" },
  { id: "compact", label: "Compact" },
];

export type BrewingPhase = {
  id: string;
  title: string;
  details: string;
};

export const BREWING_PHASES: BrewingPhase[] = [
  {
    id: "malting",
    title: "🌾 MALTING",
    details: "Preparation and activation of grain enzymes.",
  },
  {
    id: "milling",
    title: "🔨 MILLING",
    details: "Crush grains to expose starch while preserving husks.",
  },
  {
    id: "mashing",
    title: "🪣 MASHING",
    details: "Maische with temperature rests for sugar conversion.",
  },
  {
    id: "lautering",
    title: "🔽 LAUTERING",
    details: "Separate sweet wort from spent grains.",
  },
  {
    id: "sparging",
    title: "💧 SPARGING",
    details: "Rinse grains to recover remaining sugars.",
  },
  {
    id: "boiling",
    title: "🔥 BOIL",
    details: "60 to 90 minutes for sterilization and concentration.",
  },
  {
    id: "hopping",
    title: "🌿 HOPPING",
    details: "Build bitterness, flavor, and aroma profile.",
  },
  {
    id: "cooling",
    title: "❄️ COOLING",
    details: "Rapidly cool wort from boiling to yeast pitch range.",
  },
  {
    id: "pitching",
    title: "🧫 YEAST PITCHING",
    details: "Inoculate wort with selected yeast strain.",
  },
  {
    id: "primary-fermentation",
    title: "🍺 PRIMARY FERMENTATION",
    details: "Main fermentation phase for 1 to 2 weeks.",
  },
  {
    id: "secondary-fermentation",
    title: "🔄 SECONDARY FERMENTATION",
    details: "Conditioning and flavor refinement.",
  },
  {
    id: "packaging",
    title: "🍶 PACKAGING",
    details: "Bottle or keg preparation.",
  },
  {
    id: "maturation",
    title: "✅ MATURATION",
    details: "Carbonation and final flavor integration.",
  },
];

export type RecipeIngredientGroupKey = "malt" | "hop" | "yeast" | "other";

export const RECIPE_INGREDIENT_GROUP_ORDER: RecipeIngredientGroupKey[] = [
  "malt",
  "hop",
  "yeast",
  "other",
];

export const RECIPE_INGREDIENT_GROUP_LABELS: Record<
  RecipeIngredientGroupKey,
  string
> = {
  malt: "Malts",
  hop: "Hops",
  yeast: "Yeasts",
  other: "Others",
};

export type NonPublicWaterPreference = "style" | "default" | "location";

export const NON_PUBLIC_WATER_PREFERENCE_OPTIONS: {
  id: NonPublicWaterPreference;
  label: string;
}[] = [
  { id: "style", label: "Style preset" },
  { id: "default", label: "Balanced default" },
  { id: "location", label: "Location profile" },
];

export const PUBLIC_RECIPE_WATER_PRESET_BY_ID: Record<
  string,
  WaterStylePresetId
> = {
  "r-demo-2": "pale-ale",
  "r-demo-5": "pilsner-lager",
  "r-demo-8": "pilsner-lager",
  "r-demo-11": "stout-porter",
  "r-demo-14": "amber-maltee",
};
