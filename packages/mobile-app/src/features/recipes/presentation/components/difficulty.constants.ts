import { RecipeDifficultyLevel } from "@/features/recipes/domain/recipe.types";

/** French UI labels for each difficulty level (UI stays French). */
export const DIFFICULTY_LABELS: Record<RecipeDifficultyLevel, string> = {
  facile: "Facile",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

/** Maps a difficulty level onto a `Badge` variant (green / amber / red). */
export const DIFFICULTY_VARIANTS: Record<
  RecipeDifficultyLevel,
  "success" | "warning" | "error"
> = {
  facile: "success",
  intermediaire: "warning",
  avance: "error",
};
