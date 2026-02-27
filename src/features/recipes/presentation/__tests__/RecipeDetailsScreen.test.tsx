import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { startBatch } from "@/features/batches/application/batches.use-cases";
import { getRecipeDetailsViewModel } from "@/features/recipes/application/recipes.use-cases";
import { RecipeDetailsScreen } from "@/features/recipes/presentation/RecipeDetailsScreen";
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

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  getRecipeDetailsViewModel: jest.fn().mockResolvedValue({
    recipe: {
      id: "r1",
      name: "Test Recipe",
      description: "Test description",
      visibility: "private",
      stats: {
        ibu: 35,
        abv: 5.4,
        og: 1.052,
        fg: 1.011,
        volumeLiters: 20,
      },
    },
    ingredients: [
      {
        ingredientId: "hop-1",
        amount: 25,
        unit: "g",
        timing: "boil - 10 min",
        notes: null,
        ingredient: {
          id: "hop-1",
          name: "Citra",
          category: "hop",
        },
      },
    ],
    equipment: [
      {
        equipmentId: "eq-1",
        role: "Mash & boil",
        notes: null,
        equipment: {
          id: "eq-1",
          name: "Braumeister 20L",
          type: "all-in-one",
          volumeLiters: 20,
        },
      },
    ],
    steps: [
      {
        recipeId: "r1",
        stepOrder: 0,
        label: "Mash",
        type: "mash",
        description: "Hold at 67°C",
      },
    ],
  }),
}));

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  startBatch: jest.fn().mockResolvedValue({ id: "b1" }),
}));

describe("RecipeDetailsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    (getRecipeDetailsViewModel as jest.Mock).mockClear();
    (startBatch as jest.Mock).mockClear();
  });

  it("renders the redesigned recipe details sections", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();
    expect(screen.getByText("My Recipe Book")).toBeTruthy();
    expect(screen.getByText("IBU")).toBeTruthy();
    expect(screen.getByText("Ingredients by type")).toBeTruthy();
    expect(screen.getByText("Equipment")).toBeTruthy();
    expect(screen.getByText("Water profile compatibility")).toBeTruthy();
    expect(screen.getByText("Process preview")).toBeTruthy();
    expect(screen.getByText("Scale my batch")).toBeTruthy();
    expect(screen.getByText("Start Batch")).toBeTruthy();
    expect(screen.getByText("Citra")).toBeTruthy();
    expect(screen.getByText("Hops")).toBeTruthy();
  });

  it("updates scaled ingredient quantity when target volume changes", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();
    expect(screen.getByText("25 g • boil - 10 min")).toBeTruthy();

    fireEvent.changeText(
      screen.getByTestId("recipe-target-volume-input"),
      "40",
    );

    expect(screen.getByText("50 g • boil - 10 min")).toBeTruthy();
    expect(screen.getByText("40 L")).toBeTruthy();
  });

  it("adds ingredients and equipment to local cart", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getByTestId("recipe-add-ingredient-hop-1-0"));
    expect(screen.getByText("1 lines • 25 total quantity")).toBeTruthy();

    fireEvent.press(screen.getByTestId("recipe-add-equipment-eq-1"));
    expect(screen.getByText("2 lines • 26 total quantity")).toBeTruthy();

    expect(screen.getAllByText("Braumeister 20L").length).toBeGreaterThan(0);
    expect(screen.getByText("1 unit")).toBeTruthy();
  });

  it("adds all ingredients to local cart", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getByTestId("recipe-add-all-ingredients-button"));

    expect(screen.getByText("1 lines • 25 total quantity")).toBeTruthy();
    expect(screen.getByText("25 g")).toBeTruthy();
  });

  it("blocks start batch when target volume exceeds equipment capacity in equipment mode", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getByTestId("recipe-volume-mode-equipment"));
    fireEvent.changeText(
      screen.getByTestId("recipe-target-volume-input"),
      "30",
    );

    expect(screen.getByText("Volume not feasible")).toBeTruthy();

    fireEvent.press(screen.getByText("Start Batch"));
    expect(startBatch).not.toHaveBeenCalled();
  });

  it("starts a batch and navigates to the batch details", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getByText("Start Batch"));

    await waitFor(() => {
      expect(startBatch).toHaveBeenCalledWith("r1");
      expect(mockPush).toHaveBeenCalledWith("/(app)/batches/b1");
    });
  });

  it("navigates to shop from the section action", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getAllByText("Shop")[0]);

    expect(mockPush).toHaveBeenCalledWith("/(app)/shop");
  });

  it("opens ingredient category page when tapping ingredient row", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Open ingredient details for Citra"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/ingredients/hop");
  });

  it("opens malt details page when tapping a malt ingredient row", async () => {
    (getRecipeDetailsViewModel as jest.Mock).mockResolvedValueOnce({
      recipe: {
        id: "r1",
        name: "Test Recipe",
        description: "Test description",
        visibility: "private",
        stats: {
          ibu: 35,
          abv: 5.4,
          og: 1.052,
          fg: 1.011,
          volumeLiters: 20,
        },
      },
      ingredients: [
        {
          ingredientId: "malt-1",
          amount: 4.2,
          unit: "kg",
          timing: "mash",
          notes: null,
          ingredient: {
            id: "malt-1",
            name: "Pale Ale Malt",
            category: "malt",
          },
        },
      ],
      equipment: [],
      steps: [],
    });

    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.press(
      screen.getByLabelText("Open ingredient details for Pale Ale Malt"),
    );

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/malts/[id]",
      params: { id: "malt-1" },
    });
  });

  it("navigates to water calculator from the water section", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getByText("Compare in Water Calculator"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/tools/[slug]/calculator",
      params: { slug: "eau" },
    });
  });

  it("shows recipe steps in recipe process display mode", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getByTestId("recipe-process-filter-recipe"));

    expect(screen.getByText("1. Mash")).toBeTruthy();
    expect(screen.getByText("mash")).toBeTruthy();
    expect(screen.getByText("Hold at 67°C")).toBeTruthy();
  });

  it("shows compact process metrics", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();

    fireEvent.press(screen.getByTestId("recipe-process-filter-compact"));

    expect(screen.getByText("Recipe steps: 1")).toBeTruthy();
    expect(screen.getByText("Ingredients: 1")).toBeTruthy();
    expect(screen.getByText("Equipment: 1")).toBeTruthy();
    expect(screen.getByText("Next key step: Mash")).toBeTruthy();
  });
});
