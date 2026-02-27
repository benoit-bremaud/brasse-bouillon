import { MaltDetailsScreen } from "@/features/ingredients/presentation/MaltDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function MaltDetailsRoute() {
  const {
    id,
    returnTo,
    returnRecipeId,
    returnCategory,
    returnSearch,
    returnEbcMin,
    returnEbcMax,
  } = useLocalSearchParams<{
    id?: string | string[];
    returnTo?: string | string[];
    returnRecipeId?: string | string[];
    returnCategory?: string | string[];
    returnSearch?: string | string[];
    returnEbcMin?: string | string[];
    returnEbcMax?: string | string[];
  }>();

  return (
    <MaltDetailsScreen
      maltIdParam={id}
      returnToParam={returnTo}
      returnRecipeIdParam={returnRecipeId}
      returnCategoryParam={returnCategory}
      returnSearchParam={returnSearch}
      returnEbcMinParam={returnEbcMin}
      returnEbcMaxParam={returnEbcMax}
    />
  );
}
