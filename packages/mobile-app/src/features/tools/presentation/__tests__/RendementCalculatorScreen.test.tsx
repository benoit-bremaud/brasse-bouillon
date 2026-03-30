import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { RendementCalculatorScreen } from "../RendementCalculatorScreen";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

describe("RendementCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial header and tabs", () => {
    render(<RendementCalculatorScreen />);

    expect(screen.getByText("⚙️ Calculs Rendement")).toBeTruthy();
    expect(screen.getByText("Rendement")).toBeTruthy();
    expect(screen.getByText("Volumes")).toBeTruthy();
    expect(screen.getByText("Plan d'eau")).toBeTruthy();
  });

  it("shows rendement content by default", () => {
    render(<RendementCalculatorScreen />);

    expect(screen.getByText("Mesures brassin")).toBeTruthy();
    expect(screen.getByText("Grain bill")).toBeTruthy();
    expect(screen.getByText("Résultats")).toBeTruthy();
    expect(screen.getByText("Rendement global")).toBeTruthy();
  });

  it("switches to the volumes tab", () => {
    render(<RendementCalculatorScreen />);

    fireEvent.press(screen.getByText("Volumes"));

    expect(screen.getByText("Pertes process")).toBeTruthy();
    expect(screen.getByText("Volume pré-ébullition cible")).toBeTruthy();
    expect(screen.getByText("Post-boil chaud estimé")).toBeTruthy();
  });

  it("switches to the eau tab", () => {
    render(<RendementCalculatorScreen />);

    fireEvent.press(screen.getByText("Plan d'eau"));

    expect(screen.getByText("Paramètres empâtage")).toBeTruthy();
    expect(screen.getByText("Eau d'empâtage")).toBeTruthy();
    expect(screen.getByText("Eau de rinçage")).toBeTruthy();
  });

  it("handles OG input changes", () => {
    render(<RendementCalculatorScreen />);

    const ogInput = screen.getByTestId("rendement-og-input");
    fireEvent.changeText(ogInput, "1.070");

    expect(screen.getByText("Rendement global")).toBeTruthy();
    expect(screen.getByText(/\d+\.\d%/)).toBeTruthy();
  });

  it("handles target volume input changes in volumes tab", () => {
    render(<RendementCalculatorScreen />);

    fireEvent.press(screen.getByText("Volumes"));

    const targetInput = screen.getByTestId("volumes-target-input");
    fireEvent.changeText(targetInput, "25");

    expect(screen.getByText("Volume pré-ébullition cible")).toBeTruthy();
    expect(screen.getByText("Post-boil chaud estimé")).toBeTruthy();
  });

  it("handles mash plan grain input changes", () => {
    render(<RendementCalculatorScreen />);

    fireEvent.press(screen.getByText("Plan d'eau"));

    const grainInput = screen.getByTestId("plan-grain-input");
    fireEvent.changeText(grainInput, "5.5");

    expect(screen.getByText("Paramètres empâtage")).toBeTruthy();
    expect(screen.getByText("Eau totale")).toBeTruthy();
  });
});
