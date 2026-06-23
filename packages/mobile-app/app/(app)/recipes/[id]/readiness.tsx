import { useLocalSearchParams } from "expo-router";

import { IngredientReadinessScreen } from "@/features/recipes/presentation/IngredientReadinessScreen";

export default function RecipeReadinessRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const recipeId = Array.isArray(id) ? (id[0] ?? "") : (id ?? "");

  return <IngredientReadinessScreen recipeId={recipeId} />;
}
