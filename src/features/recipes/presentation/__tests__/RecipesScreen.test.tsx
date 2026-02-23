import { render, screen } from "@testing-library/react-native";

import { RecipesScreen } from "@/features/recipes/presentation/RecipesScreen";
import React from "react";

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  listRecipes: jest.fn().mockResolvedValue([]),
}));

describe("RecipesScreen", () => {
  it("renders header and empty state", async () => {
    render(<RecipesScreen />);

    expect(await screen.findByText("My Recipes")).toBeTruthy();
    expect(await screen.findByText("Aucune recette")).toBeTruthy();
  });
});
