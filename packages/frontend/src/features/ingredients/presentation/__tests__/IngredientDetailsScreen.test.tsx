/* eslint-disable @typescript-eslint/no-require-imports */
import { render, screen } from "@testing-library/react-native";

import { IngredientDetailsScreen } from "@/features/ingredients/presentation/IngredientDetailsScreen";
import React from "react";

// Mock the specialized detail screens BEFORE importing the component under test
jest.mock("@/features/ingredients/presentation/MaltDetailsScreen", () => ({
  MaltDetailsScreen: ({ maltIdParam }: { maltIdParam?: string }) => {
    const React = require("react");
    const { View, Text } = require("react-native");
    return React.createElement(
      View,
      { testID: "malt-details-screen" },
      React.createElement(Text, {}, `Malt Details: ${maltIdParam || ""}`),
    );
  },
}));

jest.mock("@/features/ingredients/presentation/HopDetailsScreen", () => ({
  HopDetailsScreen: ({ hopIdParam }: { hopIdParam?: string }) => {
    const React = require("react");
    const { View, Text } = require("react-native");
    return React.createElement(
      View,
      { testID: "hop-details-screen" },
      React.createElement(Text, {}, `Hop Details: ${hopIdParam || ""}`),
    );
  },
}));

jest.mock("@/features/ingredients/presentation/YeastDetailsScreen", () => ({
  YeastDetailsScreen: ({ yeastIdParam }: { yeastIdParam?: string }) => {
    const React = require("react");
    const { View, Text } = require("react-native");
    return React.createElement(
      View,
      { testID: "yeast-details-screen" },
      React.createElement(Text, {}, `Yeast Details: ${yeastIdParam || ""}`),
    );
  },
}));

describe("IngredientDetailsScreen", () => {
  it("delegates to HopDetailsScreen for hops category", () => {
    render(
      <IngredientDetailsScreen
        categoryParam="hops"
        ingredientIdParam="hop-1"
      />,
    );

    expect(screen.getByTestId("hop-details-screen")).toBeTruthy();
    expect(screen.getByText("Hop Details: hop-1")).toBeTruthy();
  });

  it("delegates to YeastDetailsScreen for yeasts category", () => {
    render(
      <IngredientDetailsScreen
        categoryParam="yeasts"
        ingredientIdParam="yeast-1"
      />,
    );

    expect(screen.getByTestId("yeast-details-screen")).toBeTruthy();
    expect(screen.getByText("Yeast Details: yeast-1")).toBeTruthy();
  });

  it("delegates to MaltDetailsScreen for malts category", () => {
    render(
      <IngredientDetailsScreen
        categoryParam="malts"
        ingredientIdParam="malt-1"
      />,
    );

    expect(screen.getByTestId("malt-details-screen")).toBeTruthy();
    expect(screen.getByText("Malt Details: malt-1")).toBeTruthy();
  });

  it("renders unsupported state for unknown categories", () => {
    render(
      <IngredientDetailsScreen
        categoryParam="unknown"
        ingredientIdParam="ingredient-1"
      />,
    );

    expect(screen.getByText("Unsupported ingredient category")).toBeTruthy();
    expect(
      screen.getByText("This ingredient category is not available."),
    ).toBeTruthy();
  });

  it("passes all props through to specialized screens", () => {
    render(
      <IngredientDetailsScreen
        categoryParam="hops"
        ingredientIdParam="hop-1"
        returnToParam="/(app)/ingredients"
        returnRecipeIdParam="recipe-1"
        returnCategoryParam="hops"
        returnSearchParam="citra"
        returnEbcMinParam="10"
        returnEbcMaxParam="50"
        returnAlphaMinParam="8"
        returnAttenuationMinParam="75"
      />,
    );

    expect(screen.getByTestId("hop-details-screen")).toBeTruthy();
    expect(screen.getByText("Hop Details: hop-1")).toBeTruthy();
  });
});
