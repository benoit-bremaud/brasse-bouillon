import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";

import React from "react";
import { RecipesScreen } from "@/features/recipes/presentation/RecipesScreen";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

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
  it("renders header and empty state", async () => {
    renderRecipesScreen();

    expect(await screen.findByText("My Recipes")).toBeTruthy();
    expect(await screen.findByText("Aucune recette")).toBeTruthy();
  });
});
