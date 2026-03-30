import { ShopCategoryScreen } from "@/features/shop/presentation/ShopCategoryScreen";
import { useLocalSearchParams } from "expo-router";

export default function ShopCategoryRoute() {
  const { category } = useLocalSearchParams<{ category?: string | string[] }>();

  return <ShopCategoryScreen categoryParam={category} />;
}
