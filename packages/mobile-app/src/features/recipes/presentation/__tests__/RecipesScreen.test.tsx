import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { RecipesScreen } from "@/features/recipes/presentation/RecipesScreen";

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
  listRecipes: jest.fn().mockResolvedValue([]),
}));

function renderRecipesScreen() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Number.POSITIVE_INFINITY,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RecipesScreen />
    </QueryClientProvider>,
  );
}

describe("RecipesScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("renders header and empty state", async () => {
    renderRecipesScreen();

    expect(await screen.findByText("My Recipes")).toBeTruthy();
    expect(await screen.findByText("Aucune recette")).toBeTruthy();
  });

  // Issue #779 — the new "Catalogue" pill in the header is the
  // always-visible entry point into the Recipe Catalog discovery
  // surface. A regression where it stops navigating would silently
  // strip the only header-level path to the new feature.
  it("navigates to /(app)/recipes/catalog when tapping the Catalogue header pill", async () => {
    renderRecipesScreen();

    await screen.findByText("My Recipes");

    fireEvent.press(screen.getByLabelText("Ouvrir le catalogue de recettes"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/catalog");
  });

  // Issue #779 — the empty-state CTA is the second entry point
  // into the Catalog. Together with the header pill the two
  // assertions pin both surfaces of the discovery flow.
  it("navigates to /(app)/recipes/catalog when tapping the empty-state Discover button", async () => {
    renderRecipesScreen();

    await screen.findByText("Aucune recette");

    fireEvent.press(
      screen.getByLabelText("Découvrir le catalogue de recettes"),
    );

    expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/catalog");
  });
});
