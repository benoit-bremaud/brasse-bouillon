import type { WaterStylePresetId } from "@/features/tools/domain/water-profiles";
import type { RecipeStepType } from "@/features/recipes/domain/recipe.types";

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
  { id: "phases", label: "Phases de brassage" },
  { id: "recipe", label: "Étapes de la recette" },
  { id: "compact", label: "Condensé" },
];

/**
 * French display labels for the recipe step type enum. The API serves
 * the raw enum value (`mash`, `boil`, …); the Brewing tab renders this
 * map so the step-type chip reads in French (#1172). The per-step
 * `label`/`description` text still comes from the recipe data itself.
 */
export const RECIPE_STEP_TYPE_LABELS: Record<RecipeStepType, string> = {
  mash: "Empâtage",
  boil: "Ébullition",
  whirlpool: "Whirlpool",
  fermentation: "Fermentation",
  packaging: "Conditionnement",
};

export type BrewingPhase = {
  id: string;
  title: string;
  details: string;
};

export const BREWING_PHASES: BrewingPhase[] = [
  {
    id: "malting",
    title: "🌾 MALTAGE",
    details: "Préparation et activation des enzymes du grain.",
  },
  {
    id: "milling",
    title: "🔨 CONCASSAGE",
    details:
      "Concasser le grain pour exposer l'amidon en préservant les enveloppes.",
  },
  {
    id: "mashing",
    title: "🪣 EMPÂTAGE",
    details:
      "Maische avec paliers de température pour la conversion des sucres.",
  },
  {
    id: "lautering",
    title: "🔽 FILTRATION",
    details: "Séparer le moût sucré des drêches.",
  },
  {
    id: "sparging",
    title: "💧 RINÇAGE",
    details: "Rincer les drêches pour récupérer les sucres restants.",
  },
  {
    id: "boiling",
    title: "🔥 ÉBULLITION",
    details: "60 à 90 minutes pour la stérilisation et la concentration.",
  },
  {
    id: "hopping",
    title: "🌿 HOUBLONNAGE",
    details: "Construire l'amertume, la saveur et le profil aromatique.",
  },
  {
    id: "cooling",
    title: "❄️ REFROIDISSEMENT",
    details:
      "Refroidir rapidement le moût jusqu'à la température d'ensemencement.",
  },
  {
    id: "pitching",
    title: "🧫 ENSEMENCEMENT",
    details: "Inoculer le moût avec la souche de levure choisie.",
  },
  {
    id: "primary-fermentation",
    title: "🍺 FERMENTATION PRIMAIRE",
    details: "Phase de fermentation principale, 1 à 2 semaines.",
  },
  {
    id: "secondary-fermentation",
    title: "🔄 FERMENTATION SECONDAIRE",
    details: "Garde et affinage des arômes.",
  },
  {
    id: "packaging",
    title: "🍶 CONDITIONNEMENT",
    details: "Mise en bouteille ou en fût.",
  },
  {
    id: "maturation",
    title: "✅ MATURATION",
    details: "Carbonatation et intégration finale des saveurs.",
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
