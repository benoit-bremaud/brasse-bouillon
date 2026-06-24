import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";

import { IngredientReadinessScreen } from "@/features/recipes/presentation/IngredientReadinessScreen";
import {
  getRecipeDetailsViewModel,
  type RecipeDetailsIngredientItem,
} from "@/features/recipes/application/recipes.use-cases";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  getRecipeDetailsViewModel: jest.fn(),
}));

const mockGetViewModel = getRecipeDetailsViewModel as jest.Mock;

const PILSNER_ROW = "ingredient-readiness-row-ferm-1-no-timing-0";
const CASCADE_ROW = "ingredient-readiness-row-hop-1-no-timing-1";
const PILSNER_MISSING = "ingredient-readiness-missing-ferm-1-no-timing-0";
const CASCADE_MISSING = "ingredient-readiness-missing-hop-1-no-timing-1";

function buildViewModel(ingredients: RecipeDetailsIngredientItem[]) {
  return {
    recipe: {
      id: "r1",
      name: "Blonde Facile",
      visibility: "public",
      version: 1,
      rootRecipeId: "r1",
      parentRecipeId: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
    steps: [],
    equipment: [],
    ingredients,
  };
}

const TWO_INGREDIENTS: RecipeDetailsIngredientItem[] = [
  {
    ingredientId: "ferm-1",
    name: "Pilsner Malt",
    category: "malt",
    amount: 0.9,
    unit: "kg",
    timing: null,
    notes: null,
    ingredient: null,
  },
  {
    ingredientId: "hop-1",
    name: "Cascade",
    category: "hop",
    amount: 5,
    unit: "g",
    timing: null,
    notes: null,
    ingredient: null,
  },
];

function renderScreen(recipeId = "r1") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Number.POSITIVE_INFINITY },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <IngredientReadinessScreen recipeId={recipeId} />
    </QueryClientProvider>,
  );
}

describe("IngredientReadinessScreen (A2)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("happy: lists each ingredient unchecked with every item missing", async () => {
    mockGetViewModel.mockResolvedValue(buildViewModel(TWO_INGREDIENTS));

    renderScreen();

    expect(await screen.findByText("Pilsner Malt")).toBeTruthy();
    expect(screen.getByText("Cascade")).toBeTruthy();
    // Both rows present, both still missing, not ready.
    expect(screen.getByTestId(PILSNER_ROW)).toBeTruthy();
    expect(screen.getByTestId(CASCADE_ROW)).toBeTruthy();
    expect(screen.getByTestId(PILSNER_MISSING)).toBeTruthy();
    expect(screen.getByTestId(CASCADE_MISSING)).toBeTruthy();
    expect(screen.queryByText("PRÊT")).toBeNull();
  });

  it("interaction: ticking items clears the missing recap, untick is reversible", async () => {
    mockGetViewModel.mockResolvedValue(buildViewModel(TWO_INGREDIENTS));

    renderScreen();
    await screen.findByText("Pilsner Malt");

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);

    // Tick the first ingredient → its missing entry disappears.
    fireEvent.press(checkboxes[0]);
    expect(screen.queryByTestId(PILSNER_MISSING)).toBeNull();
    expect(screen.getByTestId(CASCADE_MISSING)).toBeTruthy();
    expect(screen.queryByText("PRÊT")).toBeNull();

    // Tick the second → all complete, "Prêt" badge shows.
    fireEvent.press(screen.getAllByRole("checkbox")[1]);
    expect(screen.queryByTestId(CASCADE_MISSING)).toBeNull();
    expect(screen.getByText("PRÊT")).toBeTruthy();
    expect(
      screen.getByText("Tu as tous les ingrédients de la recette."),
    ).toBeTruthy();

    // Untick the first → reversible: it is missing again, no longer ready.
    fireEvent.press(screen.getAllByRole("checkbox")[0]);
    expect(screen.getByTestId(PILSNER_MISSING)).toBeTruthy();
    expect(screen.queryByText("PRÊT")).toBeNull();
  });

  it("sad/edge: shows the empty state when the recipe has no ingredients", async () => {
    mockGetViewModel.mockResolvedValue(buildViewModel([]));

    renderScreen();

    expect(await screen.findByText("Aucun ingrédient listé")).toBeTruthy();
    expect(screen.queryByText("Ce qu'il te manque")).toBeNull();
  });

  it("sad: shows an error with retry when the recipe fails to load", async () => {
    mockGetViewModel.mockRejectedValue(new Error("network down"));

    renderScreen();

    expect(await screen.findByText("Réessayer")).toBeTruthy();
    expect(screen.queryByText("Pilsner Malt")).toBeNull();
  });
});
