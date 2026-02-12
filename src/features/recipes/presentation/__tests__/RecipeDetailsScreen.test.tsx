import { render, screen } from "@testing-library/react-native";

import { RecipeDetailsScreen } from "@/features/recipes/presentation/RecipeDetailsScreen";
import React from "react";

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  getRecipeDetailsViewModel: jest.fn().mockResolvedValue({
    recipe: {
      id: "r1",
      name: "Test Recipe",
      description: "Test description",
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
  it("renders recipe details", async () => {
    render(<RecipeDetailsScreen recipeId="r1" />);

    expect(await screen.findByText("Test Recipe")).toBeTruthy();
    expect(screen.getByText("IBU")).toBeTruthy();
    expect(screen.getByText("Ingredients")).toBeTruthy();
    expect(screen.getByText("Equipment")).toBeTruthy();
    expect(screen.getByText("Steps preview")).toBeTruthy();
    expect(screen.getByText("Start Batch")).toBeTruthy();
    expect(screen.getByText("Citra")).toBeTruthy();
  });
});
