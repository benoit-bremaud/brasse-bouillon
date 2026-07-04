import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { DifficultyBadge } from "../DifficultyBadge";

describe("DifficultyBadge", () => {
  it("happy: renders the French uppercase label (display-only, not a button)", () => {
    render(<DifficultyBadge level="intermediaire" />);

    expect(screen.getByText("INTERMÉDIAIRE")).toBeTruthy();
    // A display-only badge exposes no button — the card owns the tap.
    expect(screen.queryByLabelText("Difficulté : Intermédiaire")).toBeNull();
  });

  it("happy: interactive badge opens the tap-to-explain with the stored reason", () => {
    render(
      <DifficultyBadge
        level="avance"
        computed="avance"
        reasons={[
          { factor: "F2", tier: 2, sentence: "grosse bière : starter requis" },
        ]}
        interactive
      />,
    );

    expect(screen.queryByText("grosse bière : starter requis")).toBeNull();

    fireEvent.press(screen.getByLabelText("Difficulté : Avancé"));
    expect(screen.getByText("grosse bière : starter requis")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("J'ai compris"));
    expect(screen.queryByText("grosse bière : starter requis")).toBeNull();
  });

  it("edge: an override surfaces the « calculé : … » hint and an empty reasons list", () => {
    render(
      <DifficultyBadge
        level="avance"
        computed="intermediaire"
        reasons={[]}
        interactive
      />,
    );

    fireEvent.press(screen.getByLabelText("Difficulté : Avancé"));
    expect(screen.getByText(/calculé : Intermédiaire/)).toBeTruthy();
    expect(screen.getByText(/Aucune explication disponible/)).toBeTruthy();
  });
});
