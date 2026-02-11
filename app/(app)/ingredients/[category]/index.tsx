import { IngredientCategoryScreen } from "@/features/ingredients/presentation/IngredientCategoryScreen";
import { useLocalSearchParams } from "expo-router";

export default function IngredientCategoryRoute() {
  const { category } = useLocalSearchParams<{ category?: string | string[] }>();
  const normalizedCategory = Array.isArray(category) ? category[0] : category;

  return <IngredientCategoryScreen categoryParam={normalizedCategory} />;
}
