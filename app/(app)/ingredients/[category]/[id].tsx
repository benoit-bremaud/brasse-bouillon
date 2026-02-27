import { IngredientDetailsScreen } from "@/features/ingredients/presentation/IngredientDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function IngredientDetailsRoute() {
  const { category, id } = useLocalSearchParams<{
    category?: string | string[];
    id?: string | string[];
  }>();

  return (
    <IngredientDetailsScreen categoryParam={category} ingredientIdParam={id} />
  );
}
