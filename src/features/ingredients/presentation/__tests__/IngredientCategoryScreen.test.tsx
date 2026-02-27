import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { listIngredientsByCategory } from "@/features/ingredients/application/ingredients.use-cases";
import { IngredientCategoryScreen } from "@/features/ingredients/presentation/IngredientCategoryScreen";
import React from "react";

const mockPush = jest.fn();

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
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/ingredients/application/ingredients.use-cases", () => ({
  listIngredientsByCategory: jest.fn(),
}));

const mockedListIngredientsByCategory =
  listIngredientsByCategory as jest.MockedFunction<
    typeof listIngredientsByCategory
  >;

function renderIngredientCategoryScreen(categoryParam = "malt") {
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
      <IngredientCategoryScreen categoryParam={categoryParam} />
    </QueryClientProvider>,
  );
}

describe("IngredientCategoryScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedListIngredientsByCategory.mockReset();
    mockedListIngredientsByCategory.mockResolvedValue([
      {
        id: "malt-1",
        name: "Pale Ale Malt",
        category: "malt",
        origin: "France",
        supplier: "Malterie du Château",
        maltType: "base",
        ebc: 6,
        potentialSg: 1.037,
        maxPercent: 100,
      },
    ]);
  });

  it("renders themed category title and ingredient row", async () => {
    renderIngredientCategoryScreen("malt");

    expect(await screen.findByText("La Malterie 🌾")).toBeTruthy();
    expect(screen.getByText("Recherche et filtres rapides")).toBeTruthy();
    expect(screen.getByText("Pale Ale Malt")).toBeTruthy();
    expect(screen.getByText("Type: base • EBC: 6")).toBeTruthy();
  });

  it("navigates to ingredient details from list item", async () => {
    renderIngredientCategoryScreen("malt");

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Voir la fiche Pale Ale Malt"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]/[id]",
      params: { category: "malt", id: "malt-1" },
    });
  });
});
