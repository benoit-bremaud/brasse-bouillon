import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { RecipesScreen } from "@/features/recipes/presentation/RecipesScreen";

const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: mockReplace,
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
    mockReplace.mockReset();
  });

  it("renders header and empty state", async () => {
    renderRecipesScreen();

    expect(await screen.findByText("My Recipes")).toBeTruthy();
    expect(await screen.findByText("Aucune recette")).toBeTruthy();
  });

  it("navigates back to dashboard from header action", async () => {
    renderRecipesScreen();

    expect(await screen.findByText("My Recipes")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Retour à l'accueil"));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });
});
