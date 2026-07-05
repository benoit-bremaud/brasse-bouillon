import React from "react";
import { render, screen } from "@testing-library/react-native";

import { DifficultyExplainModal } from "../DifficultyExplainModal";

describe("DifficultyExplainModal", () => {
  it("happy: shows the level title + reasons, no override hint when computed matches", () => {
    render(
      <DifficultyExplainModal
        visible
        level="facile"
        computed="facile"
        reasons={[
          { factor: "facile", tier: 0, sentence: "Recette accessible" },
        ]}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("Difficulté : Facile")).toBeTruthy();
    expect(screen.getByText("Recette accessible")).toBeTruthy();
    expect(screen.queryByText(/calculé :/)).toBeNull();
  });

  it("sad: renders nothing when hidden", () => {
    render(
      <DifficultyExplainModal
        visible={false}
        level="facile"
        reasons={[
          { factor: "facile", tier: 0, sentence: "Recette accessible" },
        ]}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByText("Recette accessible")).toBeNull();
  });
});
