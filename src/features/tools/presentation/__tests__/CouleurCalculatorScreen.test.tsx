import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { CouleurCalculatorScreen } from "../CouleurCalculatorScreen";

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
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

describe("CouleurCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the screen with initial content", () => {
    render(<CouleurCalculatorScreen />);

    expect(screen.getByText("🎨 Calculs Couleur")).toBeTruthy();
    expect(screen.getByText("MCU · SRM · EBC")).toBeTruthy();
    expect(screen.getByText("Rapide")).toBeTruthy();
    expect(screen.getByText("Inversé")).toBeTruthy();
    expect(screen.getByText("Palette")).toBeTruthy();
  });

  it("shows the 'Rapide' tab content by default", () => {
    render(<CouleurCalculatorScreen />);

    expect(screen.getByText("Volume de brassage")).toBeTruthy();
    expect(screen.getByText("Malts de la recette")).toBeTruthy();
    expect(screen.getByText("Résultats calculés")).toBeTruthy();
  });

  it("displays initial malts from catalog", () => {
    render(<CouleurCalculatorScreen />);

    // Pilsner (index 0) and Cara 50 (index 7) as initial malts
    expect(screen.getByText("Pilsner")).toBeTruthy();
    expect(screen.getByText("Cara 50")).toBeTruthy();
  });

  it("displays lovibond values for each malt", () => {
    render(<CouleurCalculatorScreen />);

    expect(screen.getByText("Lovibond : 2°L")).toBeTruthy();
    expect(screen.getByText("Lovibond : 50°L")).toBeTruthy();
  });

  it("shows calculated MCU, SRM and EBC labels in rapide tab", () => {
    render(<CouleurCalculatorScreen />);

    expect(screen.getByText("MCU")).toBeTruthy();
    expect(screen.getByText("SRM")).toBeTruthy();
    expect(screen.getByText("EBC")).toBeTruthy();
  });

  it("shows numeric results in rapide tab", () => {
    render(<CouleurCalculatorScreen />);

    // MCU, SRM, EBC should show decimal values
    const decimals = screen.getAllByText(/\d+\.\d+/);
    expect(decimals.length).toBeGreaterThanOrEqual(3);
  });

  it("shows color preview with SRM value in rapide tab", () => {
    render(<CouleurCalculatorScreen />);

    // Color preview shows SRM value (e.g. "SRM 9.0")
    expect(screen.getByText(/SRM \d+\.\d+/)).toBeTruthy();
  });

  it("shows style label in color preview", () => {
    render(<CouleurCalculatorScreen />);

    // Default malts (Pilsner 4kg + Cara 50 0.5kg @ 20L) → SRM ~9 → "Doré"
    expect(screen.getByText("Doré")).toBeTruthy();
  });

  it("allows adding new malts", () => {
    render(<CouleurCalculatorScreen />);

    const addButton = screen.getByText("+ Ajouter");
    fireEvent.press(addButton);

    // Should now show 3 lovibond specs
    const lovibondSpecs = screen.getAllByText(/Lovibond : \d+°L/);
    expect(lovibondSpecs).toHaveLength(3);
  });

  it("allows removing malts when more than one exists", () => {
    render(<CouleurCalculatorScreen />);

    // Add a malt first so we have 3
    fireEvent.press(screen.getByText("+ Ajouter"));

    const removeButtons = screen.getAllByText("×");
    expect(removeButtons.length).toBeGreaterThan(0);

    fireEvent.press(removeButtons[0]);

    // Back to 2 malts
    const lovibondSpecs = screen.getAllByText(/Lovibond : \d+°L/);
    expect(lovibondSpecs).toHaveLength(2);
  });

  it("handles weight input changes without crashing", () => {
    render(<CouleurCalculatorScreen />);

    const weightInputs = screen.getAllByDisplayValue("4");
    expect(weightInputs.length).toBeGreaterThan(0);

    fireEvent.changeText(weightInputs[0], "6");

    // MCU, SRM and EBC labels still visible after recalculation
    expect(screen.getByText("MCU")).toBeTruthy();
    expect(screen.getByText("SRM")).toBeTruthy();
    expect(screen.getByText("EBC")).toBeTruthy();
  });

  describe("Inversé tab", () => {
    it("switches to inverse tab and shows its content", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("Paramètres cibles")).toBeTruthy();
      expect(
        screen.getByText(
          "Quelle quantité de malt pour atteindre une couleur cible ?",
        ),
      ).toBeTruthy();
    });

    it("shows target SRM and volume inputs in inverse tab", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("SRM cible")).toBeTruthy();
      expect(screen.getByText("Volume (L)")).toBeTruthy();
    });

    it("shows malt selector in inverse tab", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("Malt colorant principal")).toBeTruthy();
      // Crystal 40 is the initial malt (INITIAL_PRIMARY_MALT_INDEX = 10)
      expect(screen.getByText("Crystal 40")).toBeTruthy();
      expect(screen.getByText("40°L")).toBeTruthy();
    });

    it("shows required kg result in inverse tab", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("Quantité nécessaire")).toBeTruthy();
      expect(screen.getByText(/\d+\.\d{2} kg/)).toBeTruthy();
      expect(screen.getByText(/de Crystal 40/)).toBeTruthy();
    });

    it("shows color preview for target SRM in inverse tab", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      // Target SRM 15 → label "Ambré clair"
      expect(screen.getByText("SRM 15 cible")).toBeTruthy();
      expect(screen.getByText("Ambré clair")).toBeTruthy();
    });

    it("cycles to next malt with › button", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      const nextButton = screen.getByText("›");
      fireEvent.press(nextButton);

      // After pressing next, malt changes (Crystal 60 is index 11)
      expect(screen.getByText("Crystal 60")).toBeTruthy();
    });

    it("cycles to previous malt with ‹ button", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      const prevButton = screen.getByText("‹");
      fireEvent.press(prevButton);

      // After pressing prev from Crystal 40 (index 10), goes to Carapils (index 9)
      expect(screen.getByText("Carapils")).toBeTruthy();
    });

    it("updates result when target SRM input changes", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      const srmInput = screen.getByDisplayValue("15");
      fireEvent.changeText(srmInput, "25");

      expect(screen.getByText(/\d+\.\d{2} kg/)).toBeTruthy();
    });
  });

  describe("Palette tab", () => {
    it("switches to palette tab and shows its content", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Palette"));

      expect(screen.getByText("Palette de référence SRM")).toBeTruthy();
      expect(screen.getByText("EBC ≈ SRM × 1,97")).toBeTruthy();
    });

    it("shows SRM values 1 through 40 in the palette", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Palette"));

      // SRM value labels are rendered as numbers 1-40
      // Check a few key values
      const allTexts = screen
        .getAllByText(/^\d+$/)
        .map((el) => el.props.children);
      const srmNumbers = allTexts.map(Number).filter((n) => n >= 1 && n <= 40);

      expect(srmNumbers).toContain(1);
      expect(srmNumbers).toContain(20);
      expect(srmNumbers).toContain(40);
    });

    it("shows EBC values in palette swatches", () => {
      render(<CouleurCalculatorScreen />);

      fireEvent.press(screen.getByText("Palette"));

      // EBC for SRM 1 = 1.97 ≈ "2 EBC"
      expect(screen.getByText("2 EBC")).toBeTruthy();
      // EBC for SRM 10 = 19.7 ≈ "20 EBC"
      expect(screen.getByText("20 EBC")).toBeTruthy();
    });
  });
});
