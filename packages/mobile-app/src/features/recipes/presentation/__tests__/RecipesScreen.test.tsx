import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { RecipesScreen } from "@/features/recipes/presentation/RecipesScreen";
import {
  listPublicRecipes,
  listRecipes,
} from "@/features/recipes/application/recipes.use-cases";
import type { Recipe } from "@/features/recipes/domain/recipe.types";

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
  listRecipes: jest.fn(),
  listPublicRecipes: jest.fn(),
}));

const FAKE_MY_RECIPE: Recipe = {
  id: "r-mine-1",
  name: "My Saison",
  description: "Personal recipe",
  visibility: "private",
  version: 1,
  rootRecipeId: "r-mine-1",
  parentRecipeId: null,
  createdAt: "2026-04-01T00:00:00Z",
  updatedAt: "2026-04-01T00:00:00Z",
};

const FAKE_PUBLIC_RECIPE: Recipe = {
  id: "r-public-1",
  name: "Punk IPA Clone",
  description: "BrewDog DIY Dog",
  visibility: "public",
  version: 1,
  rootRecipeId: "r-public-1",
  parentRecipeId: null,
  createdAt: "2026-04-01T00:00:00Z",
  updatedAt: "2026-04-01T00:00:00Z",
};

function renderHub() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RecipesScreen />
    </QueryClientProvider>,
  );
}

describe("RecipesScreen — Mes Recettes Hub (Issue #740 Round 2)", () => {
  beforeEach(() => {
    mockPush.mockReset();
    (listRecipes as jest.Mock).mockReset();
    (listPublicRecipes as jest.Mock).mockReset();
  });

  it("renders the Recettes hub header and the two hub sections", async () => {
    (listRecipes as jest.Mock).mockResolvedValue([FAKE_MY_RECIPE]);
    (listPublicRecipes as jest.Mock).mockResolvedValue([FAKE_PUBLIC_RECIPE]);

    renderHub();

    expect(await screen.findByText("Recettes")).toBeTruthy();
    expect(
      screen.getByText("Mon carnet et les recettes de la communauté"),
    ).toBeTruthy();
    expect(screen.getByTestId("hub-my-recipes-section")).toBeTruthy();
    expect(screen.getByTestId("hub-discover-section")).toBeTruthy();
    expect(screen.getByText("Mes recettes")).toBeTruthy();
    expect(screen.getByText("Découvrir")).toBeTruthy();
    expect(screen.getByText("My Saison")).toBeTruthy();
    expect(screen.getByText("Punk IPA Clone")).toBeTruthy();
  });

  // Issue #740 Round 2 — Pattern A landing.
  // When the user has no recipes, the empty state is the only forward
  // path and must surface the scan CTA. Pinning this assertion guards
  // the bootstrap flow for new users (Léa, Nicolas).
  it("shows the scan CTA in the empty state when the carnet is empty", async () => {
    (listRecipes as jest.Mock).mockResolvedValue([]);
    (listPublicRecipes as jest.Mock).mockResolvedValue([FAKE_PUBLIC_RECIPE]);

    renderHub();

    expect(
      await screen.findByText("Aucune recette pour l'instant"),
    ).toBeTruthy();
    expect(screen.getByLabelText("Scanner ta 1ère bière")).toBeTruthy();
  });

  it("navigates to the scan flow when tapping the empty-state CTA", async () => {
    (listRecipes as jest.Mock).mockResolvedValue([]);
    (listPublicRecipes as jest.Mock).mockResolvedValue([]);

    renderHub();

    await screen.findByText("Aucune recette pour l'instant");

    fireEvent.press(screen.getByLabelText("Scanner ta 1ère bière"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard/scan");
  });

  // Pressing the recipe name `Text` is brittle because the press
  // handler lives on the surrounding `Pressable` in `RecipeCard`. We
  // press the accessibility label instead so the test pins the
  // contract used by assistive tech and survives card-layout tweaks
  // (Copilot review on PR #917).
  it("navigates to a recipe detail when tapping a card in Mes recettes", async () => {
    (listRecipes as jest.Mock).mockResolvedValue([FAKE_MY_RECIPE]);
    (listPublicRecipes as jest.Mock).mockResolvedValue([]);

    renderHub();

    await screen.findByText("My Saison");

    // Prefix match: the card's accessible label now appends ", créée le <date>"
    // when the recipe has a createdAt (date omitted here for timezone-robustness).
    fireEvent.press(screen.getByLabelText(/^Ouvrir la recette My Saison/));

    expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/r-mine-1");
  });

  it("navigates to the catalog from the Découvrir Voir tout pill", async () => {
    (listRecipes as jest.Mock).mockResolvedValue([FAKE_MY_RECIPE]);
    (listPublicRecipes as jest.Mock).mockResolvedValue([FAKE_PUBLIC_RECIPE]);

    renderHub();

    await screen.findByText("Découvrir");

    fireEvent.press(screen.getByTestId("hub-discover-see-all"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/catalog");
  });

  // Same accessibility-label pattern as the Mes recettes test above
  // (Copilot review on PR #917).
  it("navigates to a public recipe detail when tapping a Découvrir card", async () => {
    (listRecipes as jest.Mock).mockResolvedValue([FAKE_MY_RECIPE]);
    (listPublicRecipes as jest.Mock).mockResolvedValue([FAKE_PUBLIC_RECIPE]);

    renderHub();

    await screen.findByText("Punk IPA Clone");

    fireEvent.press(screen.getByLabelText(/^Ouvrir la recette Punk IPA Clone/));

    expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/r-public-1");
  });

  // Issue #740 Round 2 — the Découvrir section caps at 5 previews; the
  // "Voir tout" pill is the only path to the full catalog.
  it("caps the Découvrir preview at 5 recipes", async () => {
    const manyPublic = Array.from({ length: 8 }, (_, index) => ({
      ...FAKE_PUBLIC_RECIPE,
      id: `r-public-${index + 1}`,
      name: `Public Recipe ${index + 1}`,
    }));
    (listRecipes as jest.Mock).mockResolvedValue([]);
    (listPublicRecipes as jest.Mock).mockResolvedValue(manyPublic);

    renderHub();

    await screen.findByText("Public Recipe 1");

    expect(screen.getByText("Public Recipe 5")).toBeTruthy();
    expect(screen.queryByText("Public Recipe 6")).toBeNull();
    expect(screen.queryByText("Public Recipe 8")).toBeNull();
  });

  it("shows the Découvrir empty placeholder when no public recipes are available", async () => {
    (listRecipes as jest.Mock).mockResolvedValue([FAKE_MY_RECIPE]);
    (listPublicRecipes as jest.Mock).mockResolvedValue([]);

    renderHub();

    await screen.findByText("Découvrir");

    expect(screen.getByText("Le catalogue arrive bientôt.")).toBeTruthy();
  });
});
