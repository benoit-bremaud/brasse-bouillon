import { mapRecipe } from "@/features/recipes/data/recipes.api";

/**
 * Issue #779 — coverage guard on the API mapper for the catalog
 * read paths. Pins three contracts that the in-screen tests do not
 * exercise (because they run in demo mode where `recipe.stats`
 * comes pre-populated):
 *
 *   1. `mapRecipe` lifts every brewing metric field on the API DTO
 *      into the mobile `Recipe.stats` shape, even when only a
 *      subset is populated. Without this test the cards would
 *      silently lose stats whenever the API DTO contract shifts —
 *      which is exactly what Copilot caught on PR #845 round-1.
 *   2. `mapRecipe` returns `stats: null` when every metric field is
 *      null on the DTO. The screens' `stats ? … : null` guard
 *      relies on it; a future change that returns `stats: { ibu: 0
 *      … }` for empty payloads would silently render a fake "0 IBU
 *      / 0% ABV / 0L" row.
 *   3. `mapRecipe` accepts a missing `owner_id` on the DTO without
 *      throwing — the catalog response strips it via
 *      `PublicRecipeDto`, and the mapper must let the missing
 *      field flow through to `Recipe.ownerId === undefined`
 *      (the domain type was made optional to model exactly this).
 *      Round-2 + round-3 Copilot reviews on PR #845 both flagged
 *      this contract drift.
 */
type DtoLike = {
  id: string;
  owner_id?: string;
  name: string;
  description?: string | null;
  visibility: "public" | "private" | "unlisted";
  version: number;
  root_recipe_id: string;
  parent_recipe_id?: string | null;
  batch_size_l?: number | null;
  og_target?: number | null;
  fg_target?: number | null;
  abv_estimated?: number | null;
  ibu_target?: number | null;
  ebc_target?: number | null;
  created_at: string;
  updated_at: string;
};

function buildDto(overrides: Partial<DtoLike> = {}): DtoLike {
  return {
    id: "r-1",
    owner_id: "u-1",
    name: "Recipe",
    visibility: "public",
    version: 1,
    root_recipe_id: "r-1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("mapRecipe (Issue #779 — catalog API mapper coverage)", () => {
  it("happy: lifts every brewing metric field into Recipe.stats", () => {
    const recipe = mapRecipe(
      buildDto({
        ibu_target: 35,
        abv_estimated: 5.4,
        og_target: 1.053,
        fg_target: 1.012,
        batch_size_l: 20,
        ebc_target: 18,
      }),
    );

    expect(recipe.stats).toEqual({
      ibu: 35,
      abv: 5.4,
      og: 1.053,
      fg: 1.012,
      volumeLiters: 20,
      colorEbc: 18,
    });
  });

  it("sad: returns stats null when every brewing metric field is null", () => {
    const recipe = mapRecipe(
      buildDto({
        ibu_target: null,
        abv_estimated: null,
        og_target: null,
        fg_target: null,
        batch_size_l: null,
        ebc_target: null,
      }),
    );

    expect(recipe.stats).toBeNull();
  });

  it("sad: returns stats null when no brewing metric field is set at all", () => {
    const recipe = mapRecipe(buildDto({}));
    expect(recipe.stats).toBeNull();
  });

  it("edge: returns a populated stats object even when only one metric is set", () => {
    const recipe = mapRecipe(buildDto({ ibu_target: 42 }));
    expect(recipe.stats).not.toBeNull();
    expect(recipe.stats?.ibu).toBe(42);
    // The other metrics fall back to the documented `?? 0` defaults
    // so the screens can render the row without optional-chaining
    // every field.
    expect(recipe.stats?.abv).toBe(0);
    expect(recipe.stats?.colorEbc).toBeUndefined();
  });

  it("edge: accepts a DTO without owner_id (catalog projection) and yields ownerId undefined", () => {
    const recipe = mapRecipe(
      buildDto({
        // The catalog projection strips owner_id — the mapper must
        // tolerate the absence without throwing.
        owner_id: undefined,
      }),
    );

    expect(recipe.ownerId).toBeUndefined();
    expect(recipe.id).toBe("r-1");
    expect(recipe.name).toBe("Recipe");
  });
});
