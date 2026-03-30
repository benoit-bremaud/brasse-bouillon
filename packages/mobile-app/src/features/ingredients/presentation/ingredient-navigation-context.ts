import { normalizeRouteParam } from "@/core/navigation/route-params";
import { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";

type OptionalRouteParam = string | string[] | undefined;

const INGREDIENTS_CATEGORY_RETURN_PATH = "/(app)/ingredients/[category]";

export type IngredientCategoryReturnContextParams = {
  returnTo?: string;
  returnCategory?: IngredientCategory;
  returnSearch?: string;
  returnEbcMin?: string;
  returnEbcMax?: string;
  returnAlphaMin?: string;
  returnAttenuationMin?: string;
};

export type RecipeReturnContextParams = {
  returnTo?: string;
  returnRecipeId?: string;
};

export type IngredientDetailsRouteReturnContextParams =
  IngredientCategoryReturnContextParams & RecipeReturnContextParams;

export type IngredientCategoryInitialFiltersParams = {
  searchParam?: OptionalRouteParam;
  ebcMinParam?: OptionalRouteParam;
  ebcMaxParam?: OptionalRouteParam;
  alphaMinParam?: OptionalRouteParam;
  attenuationMinParam?: OptionalRouteParam;
};

export type IngredientCategoryInitialFilters = {
  search: string;
  ebcMin: string;
  ebcMax: string;
  alphaMin: string;
  attenuationMin: string;
};

type IngredientCategoryFiltersInput = {
  search: string;
  ebcMin: string;
  ebcMax: string;
  alphaMin: string;
  attenuationMin: string;
};

export function buildIngredientCategoryInitialFilters(
  params: IngredientCategoryInitialFiltersParams,
): IngredientCategoryInitialFilters {
  return {
    search: normalizeRouteParam(params.searchParam) ?? "",
    ebcMin: normalizeRouteParam(params.ebcMinParam) ?? "",
    ebcMax: normalizeRouteParam(params.ebcMaxParam) ?? "",
    alphaMin: normalizeRouteParam(params.alphaMinParam) ?? "",
    attenuationMin: normalizeRouteParam(params.attenuationMinParam) ?? "",
  };
}

export function buildIngredientCategoryReturnContextParams(
  category: IngredientCategory,
  filters: IngredientCategoryFiltersInput,
): IngredientCategoryReturnContextParams {
  const trimmedSearch = filters.search.trim();
  const trimmedEbcMin = filters.ebcMin.trim();
  const trimmedEbcMax = filters.ebcMax.trim();
  const trimmedAlphaMin = filters.alphaMin.trim();
  const trimmedAttenuationMin = filters.attenuationMin.trim();

  return {
    returnTo: INGREDIENTS_CATEGORY_RETURN_PATH,
    returnCategory: category,
    returnSearch: trimmedSearch || undefined,
    returnEbcMin: trimmedEbcMin || undefined,
    returnEbcMax: trimmedEbcMax || undefined,
    returnAlphaMin: trimmedAlphaMin || undefined,
    returnAttenuationMin: trimmedAttenuationMin || undefined,
  };
}

export function normalizeIngredientReturnContextParams(params: {
  returnToParam?: OptionalRouteParam;
  returnCategoryParam?: OptionalRouteParam;
  returnSearchParam?: OptionalRouteParam;
  returnEbcMinParam?: OptionalRouteParam;
  returnEbcMaxParam?: OptionalRouteParam;
  returnAlphaMinParam?: OptionalRouteParam;
  returnAttenuationMinParam?: OptionalRouteParam;
  returnRecipeIdParam?: OptionalRouteParam;
}): IngredientDetailsRouteReturnContextParams {
  const normalizedReturnCategory = normalizeRouteParam(
    params.returnCategoryParam,
  );

  return {
    returnTo: normalizeRouteParam(params.returnToParam),
    returnCategory: normalizeIngredientCategory(normalizedReturnCategory),
    returnSearch: normalizeRouteParam(params.returnSearchParam),
    returnEbcMin: normalizeRouteParam(params.returnEbcMinParam),
    returnEbcMax: normalizeRouteParam(params.returnEbcMaxParam),
    returnAlphaMin: normalizeRouteParam(params.returnAlphaMinParam),
    returnAttenuationMin: normalizeRouteParam(params.returnAttenuationMinParam),
    returnRecipeId: normalizeRouteParam(params.returnRecipeIdParam),
  };
}

export function buildRecipeBackNavigationTarget(
  context: RecipeReturnContextParams,
): { pathname: string; params: { id: string } } | null {
  if (!context.returnTo || !context.returnRecipeId) {
    return null;
  }

  return {
    pathname: context.returnTo,
    params: {
      id: context.returnRecipeId,
    },
  };
}

export function buildIngredientCategoryBackNavigationParams(
  context: IngredientCategoryReturnContextParams,
): { pathname: string; params: Record<string, string> } | null {
  if (!context.returnTo || !context.returnCategory) {
    return null;
  }

  const params: Record<string, string> = {
    category: context.returnCategory,
  };

  if (context.returnSearch) {
    params.search = context.returnSearch;
  }

  if (context.returnCategory === "malt") {
    if (context.returnEbcMin) {
      params.ebcMin = context.returnEbcMin;
    }

    if (context.returnEbcMax) {
      params.ebcMax = context.returnEbcMax;
    }
  }

  if (context.returnCategory === "hop" && context.returnAlphaMin) {
    params.alphaMin = context.returnAlphaMin;
  }

  if (context.returnCategory === "yeast" && context.returnAttenuationMin) {
    params.attenuationMin = context.returnAttenuationMin;
  }

  return {
    pathname: context.returnTo,
    params,
  };
}

export function buildIngredientDetailsReturnParams(
  ingredientId: string,
  context: IngredientDetailsRouteReturnContextParams,
): Record<string, string> {
  const params: Record<string, string> = {
    id: ingredientId,
  };

  if (context.returnTo) {
    params.returnTo = context.returnTo;
  }

  if (context.returnRecipeId) {
    params.returnRecipeId = context.returnRecipeId;
  }

  if (context.returnCategory) {
    params.returnCategory = context.returnCategory;
  }

  if (context.returnSearch) {
    params.returnSearch = context.returnSearch;
  }

  if (context.returnEbcMin) {
    params.returnEbcMin = context.returnEbcMin;
  }

  if (context.returnEbcMax) {
    params.returnEbcMax = context.returnEbcMax;
  }

  if (context.returnAlphaMin) {
    params.returnAlphaMin = context.returnAlphaMin;
  }

  if (context.returnAttenuationMin) {
    params.returnAttenuationMin = context.returnAttenuationMin;
  }

  return params;
}

function normalizeIngredientCategory(
  value?: string,
): IngredientCategory | undefined {
  if (value === "malt" || value === "hop" || value === "yeast") {
    return value;
  }

  return undefined;
}
