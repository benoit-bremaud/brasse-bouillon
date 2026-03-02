import { normalizeRouteParam } from "@/core/navigation/route-params";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { Screen } from "@/core/ui/Screen";
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
  const isMaltCategory =
    normalizedCategory === "malt" || normalizedCategory === "malts";
  const isHopCategory =
    normalizedCategory === "hop" || normalizedCategory === "hops";
  const isYeastCategory =
    normalizedCategory === "yeast" || normalizedCategory === "yeasts";

  if (isMaltCategory) {
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

  if (isHopCategory) {
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

  if (isYeastCategory) {
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

  // Unsupported category
  return (
    <Screen>
      <EmptyStateCard
        title="Unsupported ingredient category"
        description="This ingredient category is not available."
      />
    </Screen>
  );
}
