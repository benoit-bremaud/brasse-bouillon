import { IngredientDetailsScreen } from "@/features/ingredients/presentation/IngredientDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function IngredientDetailsRoute() {
  const params = useLocalSearchParams<{
    category?: string | string[];
    id?: string | string[];
  }>();

  const category = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const ingredientId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <IngredientDetailsScreen
      categoryParam={category}
      ingredientIdParam={ingredientId}
    />
  );
}
