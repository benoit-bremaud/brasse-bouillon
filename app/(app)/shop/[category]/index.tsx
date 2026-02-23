import { ShopCategoryScreen } from "@/features/shop/presentation/ShopCategoryScreen";
import { useLocalSearchParams } from "expo-router";

export default function ShopCategoryRoute() {
  const { category } = useLocalSearchParams<{ category?: string | string[] }>();
  const normalizedCategory = Array.isArray(category) ? category[0] : category;

  return <ShopCategoryScreen categoryParam={normalizedCategory} />;
}
