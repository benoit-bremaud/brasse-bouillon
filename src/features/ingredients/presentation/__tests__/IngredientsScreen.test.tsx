import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { IngredientsScreen } from "@/features/ingredients/presentation/IngredientsScreen";
import React from "react";
import { listIngredientCategoriesSummary } from "@/features/ingredients/application/ingredients.use-cases";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/ingredients/application/ingredients.use-cases", () => ({
  listIngredientCategoriesSummary: jest.fn(),
}));

const mockedListIngredientCategoriesSummary =
  listIngredientCategoriesSummary as jest.MockedFunction<
    typeof listIngredientCategoriesSummary
  >;

function renderIngredientsScreen() {
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
      <IngredientsScreen />
    </QueryClientProvider>,
  );
}

describe("IngredientsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockedListIngredientCategoriesSummary.mockReset();
    mockedListIngredientCategoriesSummary.mockResolvedValue([
      { category: "malt", count: 12 },
      { category: "hop", count: 8 },
      { category: "yeast", count: 5 },
    ]);
  });

  it("renders categories with themed titles", async () => {
    renderIngredientsScreen();

    expect(await screen.findByText("Ingrédients")).toBeTruthy();
    expect(screen.getByText("Catalogue par catégorie")).toBeTruthy();
    expect(screen.getByText("La Malterie 🌾")).toBeTruthy();
    expect(screen.getByText("La Houblonnière 🌿")).toBeTruthy();
    expect(screen.getByText("Le Fermentoir 🧫")).toBeTruthy();
  });

  it("navigates to category details when pressing a card", async () => {
    renderIngredientsScreen();

    expect(await screen.findByText("La Malterie 🌾")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir la catégorie Malts"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]",
      params: { category: "malt" },
    });
  });

  it("navigates back to dashboard from header action", async () => {
    renderIngredientsScreen();

    expect(await screen.findByText("Ingrédients")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Retour à l'accueil"));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });

  it("shows empty state when no category is returned", async () => {
    mockedListIngredientCategoriesSummary.mockResolvedValue([]);

    renderIngredientsScreen();

    expect(await screen.findByText("Aucune catégorie disponible")).toBeTruthy();
    expect(
      screen.getByText("Vérifiez la source de données et réessayez."),
    ).toBeTruthy();
  });
});
