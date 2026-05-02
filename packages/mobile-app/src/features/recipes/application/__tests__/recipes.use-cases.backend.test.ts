/**
 * Issue #779 — coverage guard on the backend branch of
 * `listPublicRecipes`. The companion file `recipes.use-cases.test.ts`
 * mocks `dataSource.useDemoData = true`, so it only exercises the
 * demo-mocks branch. This file flips the toggle to `false` and
 * mocks the api layer so the backend code path runs end-to-end.
 *
 * Round-3 Copilot review on PR #845: without this case, an API
 * contract drift on `GET /recipes/public` (e.g. the `owner_id`
 * stripping that ships in this PR) would slip through the existing
 * use-case tests unnoticed.
 */
jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: false,
  },
}));

jest.mock("@/features/recipes/data/recipes.api", () => ({
  listPublic: jest.fn(),
}));

import { listPublic } from "@/features/recipes/data/recipes.api";
import { listPublicRecipes } from "@/features/recipes/application/recipes.use-cases";

const mockedListPublic = listPublic as jest.MockedFunction<typeof listPublic>;

describe("listPublicRecipes — backend mode (Issue #779)", () => {
  beforeEach(() => {
    mockedListPublic.mockReset();
  });

  it("happy: delegates to the api listPublic() and returns its result verbatim", async () => {
    mockedListPublic.mockResolvedValue([
      {
        id: "r-1",
        name: "Public IPA",
        visibility: "public",
        version: 1,
        rootRecipeId: "r-1",
        parentRecipeId: null,
        description: null,
        stats: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const recipes = await listPublicRecipes();

    expect(mockedListPublic).toHaveBeenCalledTimes(1);
    expect(recipes).toHaveLength(1);
    expect(recipes[0].id).toBe("r-1");
  });

  it("edge: tolerates a recipe with no ownerId (PublicRecipeDto strips it)", async () => {
    mockedListPublic.mockResolvedValue([
      {
        id: "r-no-owner",
        // ownerId intentionally omitted to mirror the catalog
        // projection — the use-case must pass it through without
        // synthesising a fake value.
        name: "Anonymous-looking Public Recipe",
        visibility: "public",
        version: 1,
        rootRecipeId: "r-no-owner",
        parentRecipeId: null,
        description: null,
        stats: null,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ]);

    const recipes = await listPublicRecipes();

    expect(recipes[0].ownerId).toBeUndefined();
  });

  it("sad: propagates an empty list from the api layer", async () => {
    mockedListPublic.mockResolvedValue([]);

    const recipes = await listPublicRecipes();

    expect(recipes).toEqual([]);
  });
});
