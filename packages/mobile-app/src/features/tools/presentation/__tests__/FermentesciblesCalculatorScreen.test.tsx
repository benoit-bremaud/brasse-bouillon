import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { FermentesciblesCalculatorScreen } from "../FermentesciblesCalculatorScreen";

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
  NotificationFeedbackType: { Success: "success" },
}));

// Mock @react-native-community/slider
jest.mock("@react-native-community/slider", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const MockReact = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return function MockSlider(props: { testID?: string }) {
    return MockReact.createElement(View, {
      testID: `slider-${props.testID || "default"}`,
      ...props,
    });
  };
});

describe("FermentesciblesCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the screen with initial content", () => {
    render(<FermentesciblesCalculatorScreen />);

    expect(screen.getByText("🍺 Calculs Fermentescibles")).toBeTruthy();
    expect(screen.getByText("Densité initiale et malts")).toBeTruthy();
    expect(screen.getByText("Rapide")).toBeTruthy();
    expect(screen.getByText("Inversé")).toBeTruthy();
    expect(screen.getByText("Expert")).toBeTruthy();
  });

  it("shows the 'Rapide' tab content by default", () => {
    render(<FermentesciblesCalculatorScreen />);

    expect(screen.getByText("Paramètres de brassage")).toBeTruthy();
    expect(screen.getByText("Malts de la recette")).toBeTruthy();
    expect(screen.getByText("Résultats calculés")).toBeTruthy();
  });

  it("displays initial malts from catalog", () => {
    render(<FermentesciblesCalculatorScreen />);

    // Should show Pilsner (index 0) and Munich (index 2) as initial malts
    expect(screen.getByText("Pilsner")).toBeTruthy();
    expect(screen.getByText("Munich")).toBeTruthy();
  });

  it("shows calculated results with proper format", () => {
    render(<FermentesciblesCalculatorScreen />);

    expect(screen.getByText("OG prédit")).toBeTruthy();
    expect(screen.getByText("Points de gravité")).toBeTruthy();
    expect(screen.getByText("EFM moyen")).toBeTruthy();

    // Should show formatted decimal values
    const ogValue = screen.getByText(/1\.\d{3}/);
    expect(ogValue).toBeTruthy();
  });

  it("allows switching between tabs", () => {
    render(<FermentesciblesCalculatorScreen />);

    // Switch to Inversé tab
    const inverseTab = screen.getByText("Inversé");
    fireEvent.press(inverseTab);

    expect(screen.getByText("Calcul inversé")).toBeTruthy();
    expect(
      screen.getByText("Déterminer la quantité de malt pour une OG cible"),
    ).toBeTruthy();

    // Switch to Expert tab
    const expertTab = screen.getByText("Expert");
    fireEvent.press(expertTab);

    expect(screen.getByText("Conversions")).toBeTruthy();
    expect(screen.getByText("Correction température")).toBeTruthy();
  });

  it("shows inverse calculation content in Inversé tab", () => {
    render(<FermentesciblesCalculatorScreen />);

    fireEvent.press(screen.getByText("Inversé"));

    expect(screen.getByText("OG cible")).toBeTruthy();
    expect(screen.getByText("Volume (L)")).toBeTruthy();
    expect(screen.getByText("Rendement (%)")).toBeTruthy();
    expect(screen.getByText("Quantité nécessaire")).toBeTruthy();

    // Should show calculated kg value
    expect(screen.getByText(/\d+\.\d{2} kg/)).toBeTruthy();
    expect(screen.getByText(/de Pilsner/)).toBeTruthy();
  });

  it("shows conversion tools in Expert tab", () => {
    render(<FermentesciblesCalculatorScreen />);

    fireEvent.press(screen.getByText("Expert"));

    expect(screen.getByText("SG à convertir")).toBeTruthy();
    expect(screen.getByText("Points")).toBeTruthy();
    expect(screen.getByText("°Plato")).toBeTruthy();

    expect(screen.getByText("SG mesuré")).toBeTruthy();
    expect(screen.getByText("Température (°C)")).toBeTruthy();
    expect(screen.getByText("SG corrigé (20°C)")).toBeTruthy();
  });

  it("allows adding new malts", () => {
    render(<FermentesciblesCalculatorScreen />);

    const addButton = screen.getByText("+ Ajouter");
    fireEvent.press(addButton);

    // Should show 3 malts now (initial 2 + 1 added)
    const maltRows = screen.getAllByText(/PPG:/);
    expect(maltRows).toHaveLength(3);
  });

  it("allows removing malts when more than one exists", () => {
    render(<FermentesciblesCalculatorScreen />);

    // Add a malt first to have more than 2
    fireEvent.press(screen.getByText("+ Ajouter"));

    // Should show remove button (×) for malts when there are multiple
    const removeButtons = screen.getAllByText("×");
    expect(removeButtons.length).toBeGreaterThan(0);

    // Remove one malt
    fireEvent.press(removeButtons[0]);

    // Should still have at least 2 malts
    const maltRows = screen.getAllByText(/PPG:/);
    expect(maltRows.length).toBeGreaterThanOrEqual(2);
  });

  it("handles weight input changes", () => {
    render(<FermentesciblesCalculatorScreen />);

    const weightInputs = screen.getAllByDisplayValue("4");
    expect(weightInputs.length).toBeGreaterThan(0);

    // Change weight value
    fireEvent.changeText(weightInputs[0], "5");

    // Should trigger recalculation (checked by ensuring no crash)
    expect(screen.getByText("OG prédit")).toBeTruthy();
  });

  it("handles target OG input in inverse mode", () => {
    render(<FermentesciblesCalculatorScreen />);

    fireEvent.press(screen.getByText("Inversé"));

    const targetOgInput = screen.getByDisplayValue("1.065");
    fireEvent.changeText(targetOgInput, "1.070");

    // Should show updated calculation
    expect(screen.getByText(/\d+\.\d{2} kg/)).toBeTruthy();
  });

  it("handles SG conversion input in expert mode", () => {
    render(<FermentesciblesCalculatorScreen />);

    fireEvent.press(screen.getByText("Expert"));

    // Both sgToConvert and measuredSg start at 1.065, take the first one
    const sgInputs = screen.getAllByDisplayValue("1.065");
    fireEvent.changeText(sgInputs[0], "1.050");

    // Should show updated conversions
    expect(screen.getByText(/\d+\.\d°P/)).toBeTruthy();
  });

  it("shows copy results button in rapide mode", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Alert } = require("react-native");
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);

    render(<FermentesciblesCalculatorScreen />);

    const copyButton = screen.getByText("Copier les résultats");
    expect(copyButton).toBeTruthy();

    fireEvent.press(copyButton);

    expect(alertSpy).toHaveBeenCalledWith(
      "Résultats copiés",
      "Les calculs sont maintenant dans votre presse-papier.",
    );

    alertSpy.mockRestore();
  });
});
