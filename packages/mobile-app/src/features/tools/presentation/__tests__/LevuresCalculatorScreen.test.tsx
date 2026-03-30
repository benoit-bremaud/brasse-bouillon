import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { LevuresCalculatorScreen } from "../LevuresCalculatorScreen";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

describe("LevuresCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial header and tabs", () => {
    render(<LevuresCalculatorScreen />);

    expect(screen.getByText("🧫 Calculs Levures")).toBeTruthy();
    expect(screen.getByText("Pitch")).toBeTruthy();
    expect(screen.getByText("Atténuation")).toBeTruthy();
    expect(screen.getByText("Sachets")).toBeTruthy();
  });

  it("shows pitch tab by default", () => {
    render(<LevuresCalculatorScreen />);

    expect(screen.getByText("Paramètres brassin")).toBeTruthy();
    expect(screen.getByText("Besoin cellulaire")).toBeTruthy();
    expect(screen.getByText("Pitch rate appliqué")).toBeTruthy();
  });

  it("switches to attenuation tab", () => {
    render(<LevuresCalculatorScreen />);

    fireEvent.press(screen.getByText("Atténuation"));

    expect(screen.getByText("Prévision fermentation")).toBeTruthy();
    expect(screen.getByText("Résultats prévus")).toBeTruthy();
    expect(screen.getByText("FG estimée")).toBeTruthy();
    expect(screen.getByText("ABV estimé")).toBeTruthy();
  });

  it("switches to sachets tab", () => {
    render(<LevuresCalculatorScreen />);

    fireEvent.press(screen.getByText("Sachets"));

    expect(screen.getByText("Dimensionnement sachets")).toBeTruthy();
    expect(screen.getByText("Nombre de sachets")).toBeTruthy();
  });

  it("handles og and volume input in pitch tab", () => {
    render(<LevuresCalculatorScreen />);

    fireEvent.changeText(screen.getByTestId("yeast-og-input"), "1.070");
    fireEvent.changeText(screen.getByTestId("yeast-volume-input"), "25");

    expect(screen.getByText("Cellules requises")).toBeTruthy();
    expect(screen.getByText(/Md/)).toBeTruthy();
  });

  it("switches fermentation type to lager", () => {
    render(<LevuresCalculatorScreen />);

    fireEvent.press(screen.getByText("Lager"));

    expect(screen.getByText("Pitch rate appliqué")).toBeTruthy();
    expect(screen.getByText(/M\/mL\/°P/)).toBeTruthy();
  });

  it("handles attenuation input change", () => {
    render(<LevuresCalculatorScreen />);

    fireEvent.press(screen.getByText("Atténuation"));
    fireEvent.changeText(screen.getByTestId("attenuation-input"), "75");

    expect(screen.getByText("FG estimée")).toBeTruthy();
    expect(screen.getByText("ABV estimé")).toBeTruthy();
  });

  it("handles sachets sizing inputs", () => {
    render(<LevuresCalculatorScreen />);

    fireEvent.press(screen.getByText("Sachets"));
    fireEvent.changeText(screen.getByTestId("pack-cells-input"), "180");
    fireEvent.changeText(screen.getByTestId("pack-viability-input"), "90");

    expect(screen.getByText("sachets recommandés")).toBeTruthy();
  });
});
