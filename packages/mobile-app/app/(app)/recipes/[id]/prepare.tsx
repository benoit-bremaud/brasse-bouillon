import { useLocalSearchParams } from "expo-router";

import { BrewPrepScreen } from "@/features/recipes/presentation/BrewPrepScreen";

export default function RecipePrepareRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const recipeId = Array.isArray(id) ? (id[0] ?? "") : (id ?? "");

  return <BrewPrepScreen recipeId={recipeId} />;
}
