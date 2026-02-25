import { fireEvent, render, screen } from "@testing-library/react-native";

import { IngredientCategoryScreen } from "@/features/ingredients/presentation/IngredientCategoryScreen";
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
  listIngredientsByCategory: jest.fn().mockResolvedValue([
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
  ]),
}));

describe("IngredientCategoryScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("renders themed category title and ingredient row", async () => {
    render(<IngredientCategoryScreen categoryParam="malt" />);

    expect(await screen.findByText("La Malterie 🌾")).toBeTruthy();
    expect(screen.getByText("Recherche et filtres rapides")).toBeTruthy();
    expect(screen.getByText("Pale Ale Malt")).toBeTruthy();
    expect(screen.getByText("Type: base • EBC: 6")).toBeTruthy();
  });

  it("navigates to ingredient details from list item", async () => {
    render(<IngredientCategoryScreen categoryParam="malt" />);

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Voir la fiche Pale Ale Malt"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]/[id]",
      params: { category: "malt", id: "malt-1" },
    });
  });
});
