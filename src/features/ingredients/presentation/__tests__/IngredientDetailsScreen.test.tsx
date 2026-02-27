import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { getIngredientDetails } from "@/features/ingredients/application/ingredients.use-cases";
import { IngredientDetailsScreen } from "@/features/ingredients/presentation/IngredientDetailsScreen";
import React from "react";

const mockPush = jest.fn();

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
  getIngredientDetails: jest.fn(),
}));

const mockedGetIngredientDetails = getIngredientDetails as jest.MockedFunction<
  typeof getIngredientDetails
>;

type RenderIngredientDetailsScreenOptions = {
  categoryParam?: string | string[];
  ingredientIdParam?: string | string[];
  returnToParam?: string | string[];
  returnRecipeIdParam?: string | string[];
  returnCategoryParam?: string | string[];
  returnSearchParam?: string | string[];
  returnEbcMinParam?: string | string[];
  returnEbcMaxParam?: string | string[];
  returnAlphaMinParam?: string | string[];
  returnAttenuationMinParam?: string | string[];
};

function renderIngredientDetailsScreen({
  categoryParam = "hop",
  ingredientIdParam = "hop-1",
  returnToParam,
  returnRecipeIdParam,
  returnCategoryParam,
  returnSearchParam,
  returnEbcMinParam,
  returnEbcMaxParam,
  returnAlphaMinParam,
  returnAttenuationMinParam,
}: RenderIngredientDetailsScreenOptions = {}) {
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
      <IngredientDetailsScreen
        categoryParam={categoryParam}
        ingredientIdParam={ingredientIdParam}
        returnToParam={returnToParam}
        returnRecipeIdParam={returnRecipeIdParam}
        returnCategoryParam={returnCategoryParam}
        returnSearchParam={returnSearchParam}
        returnEbcMinParam={returnEbcMinParam}
        returnEbcMaxParam={returnEbcMaxParam}
        returnAlphaMinParam={returnAlphaMinParam}
        returnAttenuationMinParam={returnAttenuationMinParam}
      />
    </QueryClientProvider>,
  );
}

describe("IngredientDetailsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedGetIngredientDetails.mockReset();
    mockedGetIngredientDetails.mockResolvedValue({
      id: "hop-1",
      name: "Citra",
      category: "hop",
      origin: "USA",
      supplier: "Yakima Chief",
      form: "pellet",
      hopUse: "aroma",
      alphaAcid: 12.5,
      betaAcid: 4,
    });
  });

  it("renders ingredient sheet and technical details", async () => {
    renderIngredientDetailsScreen();

    expect(await screen.findByText("Citra")).toBeTruthy();
    expect(screen.getByText("La Houblonnière 🌿")).toBeTruthy();
    expect(screen.getByText("Origin: USA")).toBeTruthy();
    expect(screen.getByText("Supplier: Yakima Chief")).toBeTruthy();
    expect(screen.getByText("Form: pellet")).toBeTruthy();
    expect(screen.getByText("Usage: aroma")).toBeTruthy();
    expect(screen.getByText("Alpha acids: 12.5%")).toBeTruthy();
    expect(screen.getByText("Beta acids: 4%")).toBeTruthy();
  });

  it("navigates back to recipe details when recipe context is provided", async () => {
    renderIngredientDetailsScreen({
      returnToParam: "/(app)/recipes/[id]",
      returnRecipeIdParam: "r1",
    });

    expect(await screen.findByText("Citra")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/recipes/[id]",
      params: { id: "r1" },
    });
  });

  it("navigates back to hop category with preserved filters", async () => {
    renderIngredientDetailsScreen({
      returnToParam: "/(app)/ingredients/[category]",
      returnCategoryParam: "hop",
      returnSearchParam: "citra",
      returnAlphaMinParam: "8",
    });

    expect(await screen.findByText("Citra")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]",
      params: {
        category: "hop",
        search: "citra",
        alphaMin: "8",
      },
    });
  });

  it("navigates back to yeast category with preserved filters", async () => {
    mockedGetIngredientDetails.mockResolvedValueOnce({
      id: "yeast-1",
      name: "US-05",
      category: "yeast",
      origin: "USA",
      supplier: "Fermentis",
      yeastType: "ale",
      attenuationMin: 78,
      attenuationMax: 82,
      flocculation: "medium",
      fermentationMinC: 18,
      fermentationMaxC: 22,
    });

    renderIngredientDetailsScreen({
      categoryParam: "yeast",
      ingredientIdParam: "yeast-1",
      returnToParam: "/(app)/ingredients/[category]",
      returnCategoryParam: "yeast",
      returnSearchParam: "us-05",
      returnAttenuationMinParam: "75",
    });

    expect(await screen.findByText("US-05")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]",
      params: {
        category: "yeast",
        search: "us-05",
        attenuationMin: "75",
      },
    });
  });

  it("falls back to direct return route when only returnTo is provided", async () => {
    renderIngredientDetailsScreen({
      returnToParam: "/(app)/dashboard",
    });

    expect(await screen.findByText("Citra")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard");
  });

  it("falls back to category route when there is no return context", async () => {
    renderIngredientDetailsScreen({
      categoryParam: "hop",
      ingredientIdParam: "hop-1",
    });

    expect(await screen.findByText("Citra")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]",
      params: { category: "hop" },
    });
  });

  it("shows empty state when route params are missing", async () => {
    renderIngredientDetailsScreen({
      categoryParam: "",
      ingredientIdParam: "",
    });

    expect(await screen.findByText("Unavailable sheet")).toBeTruthy();
    expect(mockedGetIngredientDetails).not.toHaveBeenCalled();
  });

  it("shows empty state when ingredient is not found", async () => {
    mockedGetIngredientDetails.mockResolvedValueOnce(null);

    renderIngredientDetailsScreen({
      categoryParam: "hop",
      ingredientIdParam: "hop-missing",
    });

    expect(await screen.findByText("Ingredient not found")).toBeTruthy();
  });
});
