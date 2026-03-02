import { normalizeRouteParam } from "@/core/navigation/route-params";
import { HopDetailsScreen } from "@/features/ingredients/presentation/HopDetailsScreen";
import { MaltDetailsScreen } from "@/features/ingredients/presentation/MaltDetailsScreen";
import { YeastDetailsScreen } from "@/features/ingredients/presentation/YeastDetailsScreen";
import React from "react";

type Props = {
  categoryParam?: string | string[];
  ingredientIdParam?: string | string[];
  returnToParam?: string | string[];
  returnRecipeIdParam?: string | string[];
  returnCategoryParam?: string | string[];
  returnSearchParam?: string | string[];
  returnEbcMinParam?: string | string[];
  returnEbcMaxParam?: string | string[];
  returnAlphaMinParam?: string | string[];
  returnAttenuationMinParam?: string | string[];
};

export function IngredientDetailsScreen({
  categoryParam,
  ingredientIdParam,
  returnToParam,
  returnRecipeIdParam,
  returnCategoryParam,
  returnSearchParam,
  returnEbcMinParam,
  returnEbcMaxParam,
  returnAlphaMinParam,
  returnAttenuationMinParam,
}: Props) {
  const normalizedCategory = normalizeRouteParam(categoryParam) ?? "";

  if (normalizedCategory === "malts") {
    return (
      <MaltDetailsScreen
        maltIdParam={ingredientIdParam}
        returnToParam={returnToParam}
        returnRecipeIdParam={returnRecipeIdParam}
        returnCategoryParam={returnCategoryParam}
        returnSearchParam={returnSearchParam}
        returnEbcMinParam={returnEbcMinParam}
        returnEbcMaxParam={returnEbcMaxParam}
        returnAlphaMinParam={returnAlphaMinParam}
        returnAttenuationMinParam={returnAttenuationMinParam}
      />
    );
  }

  if (normalizedCategory === "hops") {
    return (
      <HopDetailsScreen
        hopIdParam={ingredientIdParam}
        returnToParam={returnToParam}
        returnRecipeIdParam={returnRecipeIdParam}
        returnCategoryParam={returnCategoryParam}
        returnSearchParam={returnSearchParam}
        returnEbcMinParam={returnEbcMinParam}
        returnEbcMaxParam={returnEbcMaxParam}
        returnAlphaMinParam={returnAlphaMinParam}
        returnAttenuationMinParam={returnAttenuationMinParam}
      />
    );
  }

  if (normalizedCategory === "yeasts") {
    return (
      <YeastDetailsScreen
        yeastIdParam={ingredientIdParam}
        returnToParam={returnToParam}
        returnRecipeIdParam={returnRecipeIdParam}
        returnCategoryParam={returnCategoryParam}
        returnSearchParam={returnSearchParam}
        returnEbcMinParam={returnEbcMinParam}
        returnEbcMaxParam={returnEbcMaxParam}
        returnAlphaMinParam={returnAlphaMinParam}
        returnAttenuationMinParam={returnAttenuationMinParam}
      />
    );
  }

  // Fallback to not found screen if category is not supported
  return (
    <MaltDetailsScreen
      maltIdParam={ingredientIdParam}
      returnToParam={returnToParam}
      returnRecipeIdParam={returnRecipeIdParam}
      returnCategoryParam={returnCategoryParam}
      returnSearchParam={returnSearchParam}
      returnEbcMinParam={returnEbcMinParam}
      returnEbcMaxParam={returnEbcMaxParam}
      returnAlphaMinParam={returnAlphaMinParam}
      returnAttenuationMinParam={returnAttenuationMinParam}
    />
  );
}
