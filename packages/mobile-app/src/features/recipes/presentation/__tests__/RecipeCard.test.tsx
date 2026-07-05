import React from "react";
import { render, screen } from "@testing-library/react-native";

import { RecipeCard } from "@/features/recipes/presentation/RecipeCard";
import type { Recipe } from "@/features/recipes/domain/recipe.types";

const baseRecipe: Recipe = {
  id: "r-1",
  name: "Session IPA",
  visibility: "private",
  version: 1,
  rootRecipeId: "r-1",
  stats: {
    ibu: 42,
    abv: 5.1,
    og: 1.048,
    fg: 1.01,
    volumeLiters: 20,
    colorEbc: 11,
  },
  difficultyEffective: "intermediaire",
  difficultyReasons: [{ factor: "F2", tier: 1, sentence: "bière assez forte" }],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("RecipeCard — difficulty badge", () => {
  it("happy: shows the difficulty badge display-only (the card owns the tap)", () => {
    render(<RecipeCard recipe={baseRecipe} onPress={() => {}} />);

    expect(screen.getByText("INTERMÉDIAIRE")).toBeTruthy();
    // Display-only: the badge must NOT nest a tap-to-explain button inside the
    // card's own Pressable (RN nested-touchable anti-pattern).
    expect(screen.queryByLabelText("Difficulté : Intermédiaire")).toBeNull();
  });

  it("edge: renders no badge for a recipe without difficulty (pre-feature)", () => {
    render(
      <RecipeCard
        recipe={{
          ...baseRecipe,
          difficultyEffective: undefined,
          difficultyReasons: undefined,
        }}
        onPress={() => {}}
      />,
    );

    expect(screen.queryByText("INTERMÉDIAIRE")).toBeNull();
    expect(screen.queryByText("FACILE")).toBeNull();
    expect(screen.queryByText("AVANCÉ")).toBeNull();
  });

  it("edge: renders no badge for a backend placeholder (level set, empty reasons)", () => {
    // The migration defaults un-recomputed rows to `facile` with empty reasons —
    // the card must NOT show a misleading badge until a real recompute lands.
    render(
      <RecipeCard
        recipe={{
          ...baseRecipe,
          difficultyEffective: "facile",
          difficultyReasons: [],
        }}
        onPress={() => {}}
      />,
    );

    expect(screen.queryByText("FACILE")).toBeNull();
  });
});
