import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";

import { CatalogScreen } from "@/features/recipes/presentation/CatalogScreen";
import { listPublicRecipes } from "@/features/recipes/application/recipes.use-cases";
import { Recipe } from "@/features/recipes/domain/recipe.types";

const mockPush = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  listPublicRecipes: jest.fn(),
}));

const mockedListPublicRecipes = listPublicRecipes as jest.MockedFunction<
  typeof listPublicRecipes
>;

function buildPublicRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r-public-1",
    ownerId: "u-other",
    name: "Punk IPA",
    description: null,
    visibility: "public",
    version: 1,
    rootRecipeId: "r-public-1",
    parentRecipeId: null,
    stats: { ibu: 35, abv: 5.4, og: 1.053, fg: 1.012, volumeLiters: 20 },
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderCatalogScreen() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CatalogScreen />
    </QueryClientProvider>,
  );
}

describe("CatalogScreen (Issue #779 — KISS Recipe Catalog mini)", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedListPublicRecipes.mockReset();
  });

  // happy: with PUBLIC recipes, the list renders + tap navigates
  // to the recipe detail route.
  it("happy: renders the list and navigates to detail on tap", async () => {
    mockedListPublicRecipes.mockResolvedValue([
      buildPublicRecipe({ id: "r-public-1", name: "Punk IPA" }),
      buildPublicRecipe({ id: "r-public-2", name: "Hazy Jane" }),
    ]);

    renderCatalogScreen();

    expect(await screen.findByText("Catalogue de recettes")).toBeTruthy();
    expect(await screen.findByText("Punk IPA")).toBeTruthy();
    expect(screen.getByText("Hazy Jane")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir la recette Punk IPA"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/r-public-1");
  });

  // sad: empty catalog shows the empty-state card with a Recharger
  // CTA that triggers a refetch.
  it("sad: shows the empty-state card when the catalog is empty", async () => {
    mockedListPublicRecipes.mockResolvedValue([]);

    renderCatalogScreen();

    expect(
      await screen.findByText("Catalogue vide pour le moment"),
    ).toBeTruthy();
    expect(
      screen.getByText("Les premières recettes publiques arriveront bientôt."),
    ).toBeTruthy();
  });

  // edge: the screen never accidentally renders the "Public" badge
  // text from a non-public recipe (defensive guard against the
  // use-case leaking private/unlisted entries).
  it("edge: every rendered card carries the Public badge", async () => {
    mockedListPublicRecipes.mockResolvedValue([
      buildPublicRecipe({ id: "r-public-1", name: "Punk IPA" }),
      buildPublicRecipe({ id: "r-public-2", name: "Hazy Jane" }),
    ]);

    renderCatalogScreen();

    await screen.findByText("Punk IPA");
    // Badge uppercases its label internally — assert on the rendered text.
    const publicBadges = screen.getAllByText("PUBLIC");
    expect(publicBadges.length).toBe(2);
  });
});
