import { useLocalSearchParams } from "expo-router";

import { RecipeDetailsScreen } from "@/features/recipes/presentation/RecipeDetailsScreen";

export default function RecipeDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <RecipeDetailsScreen recipeId={String(id ?? "")} />;
}
