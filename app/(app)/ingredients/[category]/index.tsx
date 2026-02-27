import { IngredientCategoryScreen } from "@/features/ingredients/presentation/IngredientCategoryScreen";
import { useLocalSearchParams } from "expo-router";

export default function IngredientCategoryRoute() {
  const { category, search, ebcMin, ebcMax } = useLocalSearchParams<{
    category?: string | string[];
    search?: string | string[];
    ebcMin?: string | string[];
    ebcMax?: string | string[];
  }>();

  return (
    <IngredientCategoryScreen
      categoryParam={category}
      searchParam={search}
      ebcMinParam={ebcMin}
      ebcMaxParam={ebcMax}
    />
  );
}
