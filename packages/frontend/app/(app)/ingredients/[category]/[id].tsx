import { IngredientDetailsScreen } from "@/features/ingredients/presentation/IngredientDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function IngredientDetailsRoute() {
  const {
    category,
    id,
    returnTo,
    returnRecipeId,
    returnCategory,
    returnSearch,
    returnEbcMin,
    returnEbcMax,
    returnAlphaMin,
    returnAttenuationMin,
  } = useLocalSearchParams<{
    category?: string | string[];
    id?: string | string[];
    returnTo?: string | string[];
    returnRecipeId?: string | string[];
    returnCategory?: string | string[];
    returnSearch?: string | string[];
    returnEbcMin?: string | string[];
    returnEbcMax?: string | string[];
    returnAlphaMin?: string | string[];
    returnAttenuationMin?: string | string[];
  }>();

  return (
    <IngredientDetailsScreen
      categoryParam={category}
      ingredientIdParam={id}
      returnToParam={returnTo}
      returnRecipeIdParam={returnRecipeId}
      returnCategoryParam={returnCategory}
      returnSearchParam={returnSearch}
      returnEbcMinParam={returnEbcMin}
      returnEbcMaxParam={returnEbcMax}
      returnAlphaMinParam={returnAlphaMin}
      returnAttenuationMinParam={returnAttenuationMin}
    />
  );
}
