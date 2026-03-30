import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { CarbonatationCalculatorScreen } from "../CarbonatationCalculatorScreen";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

describe("CarbonatationCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial header and tabs", () => {
    render(<CarbonatationCalculatorScreen />);

    expect(screen.getByText("🍾 Calculs Carbonatation")).toBeTruthy();
    expect(screen.getByText("Priming")).toBeTruthy();
    expect(screen.getByText("Pression")).toBeTruthy();
    expect(screen.getByText("Styles")).toBeTruthy();
  });

  it("shows priming content by default", () => {
    render(<CarbonatationCalculatorScreen />);

    expect(screen.getByText("Paramètres priming")).toBeTruthy();
    expect(screen.getByText("Dose de sucre")).toBeTruthy();
    expect(screen.getByText("CO₂ résiduel estimé")).toBeTruthy();
  });

  it("switches to pression tab", () => {
    render(<CarbonatationCalculatorScreen />);

    fireEvent.press(screen.getByText("Pression"));

    expect(screen.getByText("Force carbonation (fût)")).toBeTruthy();
    expect(screen.getByText("Pression cible")).toBeTruthy();
    expect(screen.getByText(/psi/)).toBeTruthy();
  });

  it("switches to styles tab", () => {
    render(<CarbonatationCalculatorScreen />);

    fireEvent.press(screen.getByText("Styles"));

    expect(screen.getByText("Références CO₂ par style")).toBeTruthy();
    expect(screen.getByText("Positionnement actuel")).toBeTruthy();
    expect(screen.getAllByText("Pale Ale / IPA").length).toBeGreaterThan(0);
  });

  it("handles target co2 input changes", () => {
    render(<CarbonatationCalculatorScreen />);

    fireEvent.changeText(screen.getByTestId("co2-target-input"), "2.8");

    expect(screen.getByText("Dose de sucre")).toBeTruthy();
    expect(screen.getByText("CO₂ à produire")).toBeTruthy();
  });

  it("switches sugar type", () => {
    render(<CarbonatationCalculatorScreen />);

    fireEvent.press(screen.getByText("Saccharose"));

    expect(screen.getByText("Dose de sucre")).toBeTruthy();
    expect(screen.getByText("CO₂ à produire")).toBeTruthy();
  });
});
