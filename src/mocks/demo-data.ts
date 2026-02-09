import {
  Batch,
  BatchStep,
  BatchSummary,
} from "@/features/batches/domain/batch.types";
import { Recipe, RecipeStep } from "@/features/recipes/domain/recipe.types";

import { User } from "@/features/auth/domain/auth.types";

export type Equipment = {
  id: string;
  name: string;
  type: "all-in-one" | "kettle" | "fermenter";
  volumeLiters: number;
  efficiencyPercent: number;
  notes?: string;
};

export type Ingredient = {
  id: string;
  name: string;
  category: "grain" | "hop" | "yeast" | "misc";
  origin?: string;
  usage: "mash" | "boil" | "fermentation" | "packaging";
};

export const demoUsers: User[] = [
  {
    id: "u-demo-1",
    email: "marie.brasseur@example.com",
    username: "marie.brew",
    firstName: "Marie",
    lastName: "Dupont",
    role: "user",
    isActive: true,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-08T07:00:00.000Z",
  },
  {
    id: "u-demo-2",
    email: "leo.ferment@example.com",
    username: "leo.ferment",
    firstName: "Léo",
    lastName: "Martin",
    role: "moderator",
    isActive: true,
    createdAt: "2026-01-20T09:30:00.000Z",
    updatedAt: "2026-02-05T18:20:00.000Z",
  },
  {
    id: "u-demo-3",
    email: "admin.brasse@example.com",
    username: "admin.brasse",
    firstName: "Camille",
    lastName: "Admin",
    role: "admin",
    isActive: true,
    createdAt: "2026-01-01T12:00:00.000Z",
    updatedAt: "2026-02-07T11:40:00.000Z",
  },
];

export const demoEquipments: Equipment[] = [
  {
    id: "eq-1",
    name: "Braumeister 20L",
    type: "all-in-one",
    volumeLiters: 20,
    efficiencyPercent: 72,
    notes: "Sonde température intégrée",
  },
  {
    id: "eq-2",
    name: "Cuve d’ébullition 35L",
    type: "kettle",
    volumeLiters: 35,
    efficiencyPercent: 68,
  },
  {
    id: "eq-3",
    name: "Fermenteur inox 30L",
    type: "fermenter",
    volumeLiters: 30,
    efficiencyPercent: 0,
    notes: "Thermowell + valve tri-clamp",
  },
];

export const demoIngredients: Ingredient[] = [
  {
    id: "ing-1",
    name: "Pale Ale Malt",
    category: "grain",
    origin: "France",
    usage: "mash",
  },
  {
    id: "ing-2",
    name: "Munich Malt",
    category: "grain",
    origin: "Germany",
    usage: "mash",
  },
  {
    id: "ing-3",
    name: "Citra",
    category: "hop",
    origin: "USA",
    usage: "boil",
  },
  {
    id: "ing-4",
    name: "SafAle US-05",
    category: "yeast",
    origin: "France",
    usage: "fermentation",
  },
  {
    id: "ing-5",
    name: "Zeste d’orange",
    category: "misc",
    origin: "Espagne",
    usage: "boil",
  },
];

export const demoRecipeSteps: RecipeStep[] = [
  {
    recipeId: "r-demo-1",
    stepOrder: 0,
    type: "mash",
    label: "Empâtage 67°C",
    description: "60 min à 67°C",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
  {
    recipeId: "r-demo-1",
    stepOrder: 1,
    type: "boil",
    label: "Ébullition 60 min",
    description: "Ajout houblons à 60/15/0",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
  {
    recipeId: "r-demo-1",
    stepOrder: 2,
    type: "fermentation",
    label: "Fermentation primaire",
    description: "10 jours à 19°C",
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-01T10:00:00.000Z",
  },
];

export const demoRecipes: Recipe[] = [
  {
    id: "r-demo-1",
    ownerId: demoUsers[0].id,
    name: "Session IPA Citra",
    description: "Houblonnée, sèche et fruitée",
    visibility: "private",
    version: 1,
    rootRecipeId: "r-demo-1",
    parentRecipeId: null,
    createdAt: "2026-02-01T10:00:00.000Z",
    updatedAt: "2026-02-08T10:00:00.000Z",
  },
  {
    id: "r-demo-2",
    ownerId: demoUsers[1].id,
    name: "Witbier Orange",
    description: "Blanche légère aux agrumes",
    visibility: "public",
    version: 2,
    rootRecipeId: "r-demo-2",
    parentRecipeId: null,
    createdAt: "2026-01-28T10:00:00.000Z",
    updatedAt: "2026-02-02T09:30:00.000Z",
  },
  {
    id: "r-demo-3",
    ownerId: demoUsers[2].id,
    name: "Amber Ale Maison",
    description: "Caramel + touche toastée",
    visibility: "unlisted",
    version: 3,
    rootRecipeId: "r-demo-3",
    parentRecipeId: null,
    createdAt: "2026-01-15T10:00:00.000Z",
    updatedAt: "2026-02-07T08:00:00.000Z",
  },
];

export const demoBatchSteps: BatchStep[] = [
  {
    batchId: "b-demo-1",
    stepOrder: 0,
    type: "mash",
    label: "Empâtage 67°C",
    description: "Rincer doucement",
    status: "completed",
    startedAt: "2026-02-06T09:00:00.000Z",
    completedAt: "2026-02-06T10:00:00.000Z",
    createdAt: "2026-02-06T09:00:00.000Z",
    updatedAt: "2026-02-06T10:00:00.000Z",
  },
  {
    batchId: "b-demo-1",
    stepOrder: 1,
    type: "boil",
    label: "Ébullition 60 min",
    description: "Ajout houblon Citra",
    status: "in_progress",
    startedAt: "2026-02-06T10:05:00.000Z",
    completedAt: null,
    createdAt: "2026-02-06T10:05:00.000Z",
    updatedAt: "2026-02-06T10:20:00.000Z",
  },
  {
    batchId: "b-demo-1",
    stepOrder: 2,
    type: "fermentation",
    label: "Fermentation primaire",
    description: "19°C",
    status: "pending",
    startedAt: null,
    completedAt: null,
    createdAt: "2026-02-06T10:05:00.000Z",
    updatedAt: "2026-02-06T10:05:00.000Z",
  },
];

export const demoBatchSummaries: BatchSummary[] = [
  {
    id: "b-demo-1",
    ownerId: demoUsers[0].id,
    recipeId: demoRecipes[0].id,
    status: "in_progress",
    currentStepOrder: 1,
    startedAt: "2026-02-06T09:00:00.000Z",
    fermentationStartedAt: null,
    fermentationCompletedAt: null,
    completedAt: null,
    createdAt: "2026-02-06T09:00:00.000Z",
    updatedAt: "2026-02-06T10:20:00.000Z",
  },
  {
    id: "b-demo-2",
    ownerId: demoUsers[1].id,
    recipeId: demoRecipes[1].id,
    status: "completed",
    currentStepOrder: 2,
    startedAt: "2026-01-20T09:00:00.000Z",
    fermentationStartedAt: "2026-01-21T09:00:00.000Z",
    fermentationCompletedAt: "2026-01-30T09:00:00.000Z",
    completedAt: "2026-02-02T09:00:00.000Z",
    createdAt: "2026-01-20T09:00:00.000Z",
    updatedAt: "2026-02-02T09:00:00.000Z",
  },
];

export const demoBatches: Batch[] = [
  {
    ...demoBatchSummaries[0],
    steps: demoBatchSteps,
  },
  {
    ...demoBatchSummaries[1],
    steps: demoBatchSteps.map((step) => ({
      ...step,
      batchId: "b-demo-2",
      status: "completed",
    })),
  },
];
