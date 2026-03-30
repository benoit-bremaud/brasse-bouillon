import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { AvancesCalculatorScreen } from "../AvancesCalculatorScreen";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

describe("AvancesCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial header and tabs", () => {
    render(<AvancesCalculatorScreen />);

    expect(screen.getByText("🧪 Calculs avancés")).toBeTruthy();
    expect(screen.getByText("Enzymes")).toBeTruthy();
    expect(screen.getByText("Moût")).toBeTruthy();
    expect(screen.getByText("Altitude")).toBeTruthy();
  });

  it("shows enzymes tab by default", () => {
    render(<AvancesCalculatorScreen />);

    expect(screen.getByText("Puissance diastasique")).toBeTruthy();
    expect(screen.getByText("Résultats enzymatiques")).toBeTruthy();
    expect(screen.getByText("Puissance totale")).toBeTruthy();
    expect(screen.getByText("Moyenne pondérée")).toBeTruthy();
  });

  it("handles malt weight and wk input changes", () => {
    render(<AvancesCalculatorScreen />);

    fireEvent.changeText(screen.getByTestId("adv-malt-1-weight-input"), "5");
    fireEvent.changeText(screen.getByTestId("adv-malt-1-wk-input"), "280");

    expect(screen.getByText("Capacité de conversion")).toBeTruthy();
  });

  it("switches to mout tab", () => {
    render(<AvancesCalculatorScreen />);

    fireEvent.press(screen.getByText("Moût"));

    expect(screen.getByText("Indices analytiques")).toBeTruthy();
    expect(screen.getByText("Diagnostic moût")).toBeTruthy();
    expect(screen.getByText("Indice de Kolbach")).toBeTruthy();
  });

  it("handles mout inputs", () => {
    render(<AvancesCalculatorScreen />);

    fireEvent.press(screen.getByText("Moût"));

    fireEvent.changeText(
      screen.getByTestId("adv-soluble-nitrogen-input"),
      "0.8",
    );
    fireEvent.changeText(screen.getByTestId("adv-total-nitrogen-input"), "1.9");
    fireEvent.changeText(screen.getByTestId("adv-beta-glucans-input"), "180");
    fireEvent.changeText(screen.getByTestId("adv-og-input"), "1.055");

    expect(screen.getByText("Viscosité estimée")).toBeTruthy();
    expect(screen.getByText("FAN estimé")).toBeTruthy();
  });

  it("switches to altitude tab", () => {
    render(<AvancesCalculatorScreen />);

    fireEvent.press(screen.getByText("Altitude"));

    expect(screen.getByText("Contexte de brassage")).toBeTruthy();
    expect(screen.getByText("Corrections altitude")).toBeTruthy();
    expect(screen.getByText("IBU cible ajusté")).toBeTruthy();
  });

  it("handles altitude inputs", () => {
    render(<AvancesCalculatorScreen />);

    fireEvent.press(screen.getByText("Altitude"));

    fireEvent.changeText(screen.getByTestId("adv-altitude-input"), "800");
    fireEvent.changeText(screen.getByTestId("adv-ibu-target-input"), "45");

    expect(screen.getByText("Facteur IBU")).toBeTruthy();
    expect(screen.getByText("IBU cible ajusté")).toBeTruthy();
  });
});
