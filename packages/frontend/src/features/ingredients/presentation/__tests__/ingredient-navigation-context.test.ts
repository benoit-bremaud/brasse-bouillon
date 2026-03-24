import {
  buildIngredientCategoryBackNavigationParams,
  buildIngredientCategoryInitialFilters,
  buildIngredientCategoryReturnContextParams,
  buildIngredientDetailsReturnParams,
  buildRecipeBackNavigationTarget,
  normalizeIngredientReturnContextParams,
} from "@/features/ingredients/presentation/ingredient-navigation-context";

describe("ingredient-navigation-context", () => {
  it("normalizes category filters from route params", () => {
    const filters = buildIngredientCategoryInitialFilters({
      searchParam: [" cascade "],
      alphaMinParam: "8",
      attenuationMinParam: undefined,
    });

    expect(filters).toEqual({
      search: " cascade ",
      ebcMin: "",
      ebcMax: "",
      alphaMin: "8",
      attenuationMin: "",
    });
  });

  it("builds category return context with trimmed values", () => {
    const context = buildIngredientCategoryReturnContextParams("hop", {
      search: " citra ",
      ebcMin: "",
      ebcMax: "",
      alphaMin: " 8 ",
      attenuationMin: "",
    });

    expect(context).toEqual({
      returnTo: "/(app)/ingredients/[category]",
      returnCategory: "hop",
      returnSearch: "citra",
      returnEbcMin: undefined,
      returnEbcMax: undefined,
      returnAlphaMin: "8",
      returnAttenuationMin: undefined,
    });
  });

  it("normalizes all supported return context params", () => {
    const context = normalizeIngredientReturnContextParams({
      returnToParam: ["/(app)/ingredients/[category]"],
      returnCategoryParam: "yeast",
      returnSearchParam: ["us-05"],
      returnEbcMinParam: "4",
      returnEbcMaxParam: "12",
      returnAlphaMinParam: "8",
      returnAttenuationMinParam: "75",
      returnRecipeIdParam: "r1",
    });

    expect(context).toEqual({
      returnTo: "/(app)/ingredients/[category]",
      returnCategory: "yeast",
      returnSearch: "us-05",
      returnEbcMin: "4",
      returnEbcMax: "12",
      returnAlphaMin: "8",
      returnAttenuationMin: "75",
      returnRecipeId: "r1",
    });
  });

  it("ignores unsupported category in normalized return context", () => {
    const context = normalizeIngredientReturnContextParams({
      returnCategoryParam: "water",
    });

    expect(context.returnCategory).toBeUndefined();
  });

  it("builds recipe back target only when route and id exist", () => {
    expect(
      buildRecipeBackNavigationTarget({
        returnTo: "/(app)/recipes/[id]",
        returnRecipeId: "r1",
      }),
    ).toEqual({
      pathname: "/(app)/recipes/[id]",
      params: { id: "r1" },
    });

    expect(
      buildRecipeBackNavigationTarget({
        returnTo: "/(app)/recipes/[id]",
      }),
    ).toBeNull();
  });

  it("builds hop category back params with alpha filter", () => {
    const target = buildIngredientCategoryBackNavigationParams({
      returnTo: "/(app)/ingredients/[category]",
      returnCategory: "hop",
      returnSearch: "citra",
      returnAlphaMin: "8",
    });

    expect(target).toEqual({
      pathname: "/(app)/ingredients/[category]",
      params: {
        category: "hop",
        search: "citra",
        alphaMin: "8",
      },
    });
  });

  it("builds yeast category back params with attenuation filter", () => {
    const target = buildIngredientCategoryBackNavigationParams({
      returnTo: "/(app)/ingredients/[category]",
      returnCategory: "yeast",
      returnSearch: "us-05",
      returnAttenuationMin: "75",
    });

    expect(target).toEqual({
      pathname: "/(app)/ingredients/[category]",
      params: {
        category: "yeast",
        search: "us-05",
        attenuationMin: "75",
      },
    });
  });

  it("returns null category back target without required route context", () => {
    expect(
      buildIngredientCategoryBackNavigationParams({
        returnCategory: "malt",
      }),
    ).toBeNull();
  });

  it("builds details return params including all available context", () => {
    const params = buildIngredientDetailsReturnParams("hop-1", {
      returnTo: "/(app)/ingredients/[category]",
      returnRecipeId: "r1",
      returnCategory: "hop",
      returnSearch: "citra",
      returnEbcMin: "4",
      returnEbcMax: "12",
      returnAlphaMin: "8",
      returnAttenuationMin: "75",
    });

    expect(params).toEqual({
      id: "hop-1",
      returnTo: "/(app)/ingredients/[category]",
      returnRecipeId: "r1",
      returnCategory: "hop",
      returnSearch: "citra",
      returnEbcMin: "4",
      returnEbcMax: "12",
      returnAlphaMin: "8",
      returnAttenuationMin: "75",
    });
  });
});
