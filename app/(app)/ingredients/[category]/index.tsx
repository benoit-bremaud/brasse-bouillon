import { IngredientCategoryScreen } from "@/features/ingredients/presentation/IngredientCategoryScreen";
import { useLocalSearchParams } from "expo-router";

export default function IngredientCategoryRoute() {
  const { category } = useLocalSearchParams<{ category?: string | string[] }>();

  return <IngredientCategoryScreen categoryParam={category} />;
}
