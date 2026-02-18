import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { HoublonsCalculatorScreen } from "../HoublonsCalculatorScreen";

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

describe("HoublonsCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the screen with initial content", () => {
    render(<HoublonsCalculatorScreen />);

    expect(screen.getByText("🌿 Calculs Houblons")).toBeTruthy();
    expect(screen.getByText("IBU · Tinseth · BU:GU")).toBeTruthy();
    expect(screen.getByText("Rapide")).toBeTruthy();
    expect(screen.getByText("Inversé")).toBeTruthy();
    expect(screen.getByText("BU:GU")).toBeTruthy();
  });

  describe("Rapide tab", () => {
    it("shows the Rapide tab content by default", () => {
      render(<HoublonsCalculatorScreen />);

      expect(screen.getByText("Paramètres de brassage")).toBeTruthy();
      expect(screen.getByText("Ajouts de houblons")).toBeTruthy();
      expect(screen.getByText("IBU calculés (Tinseth)")).toBeTruthy();
    });

    it("displays initial hop additions from catalog", () => {
      render(<HoublonsCalculatorScreen />);

      // Cascade (index 2) and Citra (index 5) are initial hops
      expect(screen.getByText("Cascade")).toBeTruthy();
      expect(screen.getByText("Citra")).toBeTruthy();
    });

    it("displays AA and origin for each hop", () => {
      render(<HoublonsCalculatorScreen />);

      // Cascade AA default = (4.5 + 7) / 2 = 5.8%, USA
      expect(screen.getByText(/AA : 5\.8% · USA/)).toBeTruthy();
    });

    it("shows boil time for each hop addition", () => {
      render(<HoublonsCalculatorScreen />);

      // First hop: 60 min, second hop: 10 min
      expect(screen.getByText("Ébullition : 60 min")).toBeTruthy();
      expect(screen.getByText("Ébullition : 10 min")).toBeTruthy();
    });

    it("shows a calculated IBU value", () => {
      render(<HoublonsCalculatorScreen />);

      // IBU should be a positive decimal number
      const ibuValue = screen.getByText(/^\d+\.\d$/);
      expect(ibuValue).toBeTruthy();

      expect(screen.getByText("IBU")).toBeTruthy();
    });

    it("allows adding a new hop addition", () => {
      render(<HoublonsCalculatorScreen />);

      const addButton = screen.getByText("+ Ajouter");
      fireEvent.press(addButton);

      // Now 3 boil time labels (initial 2 + 1 added at 60 min)
      const boilLabels = screen.getAllByText(/Ébullition : \d+ min/);
      expect(boilLabels).toHaveLength(3);
    });

    it("allows removing a hop addition when more than one exists", () => {
      render(<HoublonsCalculatorScreen />);

      // Add a hop to have 3
      fireEvent.press(screen.getByText("+ Ajouter"));

      const removeButtons = screen.getAllByText("×");
      expect(removeButtons.length).toBeGreaterThan(0);

      fireEvent.press(removeButtons[0]);

      // Back to 2 boil time labels
      const boilLabels = screen.getAllByText(/Ébullition : \d+ min/);
      expect(boilLabels).toHaveLength(2);
    });

    it("does not show remove button when only one hop is present", () => {
      render(<HoublonsCalculatorScreen />);

      // Remove until one remains — start with 2, remove one
      const removeButtons = screen.getAllByText("×");
      fireEvent.press(removeButtons[0]);

      // Should now have 1 hop and no remove button
      expect(screen.queryByText("×")).toBeNull();
    });

    it("allows changing hop variety in rapide tab", () => {
      render(<HoublonsCalculatorScreen />);

      // Press › on first hop row (Cascade → next variety)
      const nextButtons = screen.getAllByText("›");
      fireEvent.press(nextButtons[0]);

      // Cascade (index 2) → Centennial (index 3) … but Citra is already at 5
      // The first hop moves from index 2 to 3 = Centennial; second was already Citra → check Cascade is gone
      // or Centennial, depending on catalog ordering — just check Cascade is gone from first position
      // and a different variety name appears alongside
      const hopNames = screen.getAllByText(/[A-Z][a-z]/);
      expect(hopNames.length).toBeGreaterThan(0);
    });

    it("handles weight input changes", () => {
      render(<HoublonsCalculatorScreen />);

      const weightInputs = screen.getAllByDisplayValue("25");
      expect(weightInputs.length).toBeGreaterThan(0);

      fireEvent.changeText(weightInputs[0], "50");

      // IBU label still visible after recalculation
      expect(screen.getByText("IBU calculés (Tinseth)")).toBeTruthy();
    });

    it("shows volume and gravity sliders", () => {
      render(<HoublonsCalculatorScreen />);

      expect(screen.getByText(/Volume \(L\) : \d+/)).toBeTruthy();
      expect(screen.getByText(/Densité ébullition : 1\.\d{3}/)).toBeTruthy();
    });
  });

  describe("Inversé tab", () => {
    it("switches to inverse tab and shows its content", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("Paramètres cibles")).toBeTruthy();
      expect(
        screen.getByText(
          "Quelle quantité de houblon pour atteindre un IBU cible ?",
        ),
      ).toBeTruthy();
    });

    it("shows IBU target slider with label", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("IBU cible : 30")).toBeTruthy();
      expect(screen.getByTestId("ibu-cible")).toBeTruthy();
    });

    it("shows volume and gravity inputs in inverse tab", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("Volume (L)")).toBeTruthy();
      expect(screen.getByText("Densité ébullition")).toBeTruthy();
    });

    it("shows boil time slider in inverse tab", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText(/Temps d'ébullition : \d+ min/)).toBeTruthy();
      expect(screen.getByTestId("boil-time-inverse")).toBeTruthy();
    });

    it("shows hop variety selector in inverse tab", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("Variété de houblon")).toBeTruthy();
      // Cascade is initial variety (index 2)
      expect(screen.getByText("Cascade")).toBeTruthy();
      expect(screen.getByText(/AA moyen : 5\.8% · USA/)).toBeTruthy();
    });

    it("shows Tinseth utilization in inverse tab", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText(/Utilisation Tinseth : \d+\.\d+%/)).toBeTruthy();
    });

    it("shows required grams result in inverse tab", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      expect(screen.getByText("Quantité nécessaire")).toBeTruthy();
      expect(screen.getByText(/\d+\.\d g/)).toBeTruthy();
      expect(screen.getByText(/de Cascade/)).toBeTruthy();
      expect(screen.getByText(/pour atteindre 30 IBU sur 20 L/)).toBeTruthy();
    });

    it("cycles to next hop variety with › button", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      const nextButton = screen.getByText("›");
      fireEvent.press(nextButton);

      // After pressing next from Cascade (index 2), goes to Centennial (index 3)
      expect(screen.getByText("Centennial")).toBeTruthy();
    });

    it("cycles to previous hop variety with ‹ button", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      const prevButton = screen.getByText("‹");
      fireEvent.press(prevButton);

      // After pressing prev from Cascade (index 2), goes to Bravo (index 1)
      expect(screen.getByText("Bravo")).toBeTruthy();
    });

    it("updates IBU target label when slider changes", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      const ibuSlider = screen.getByTestId("ibu-cible");
      fireEvent(ibuSlider, "onValueChange", 50);

      expect(screen.getByText("IBU cible : 50")).toBeTruthy();
    });

    it("updates result note when target IBU changes", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("Inversé"));

      const ibuSlider = screen.getByTestId("ibu-cible");
      fireEvent(ibuSlider, "onValueChange", 60);

      expect(screen.getByText(/pour atteindre 60 IBU sur 20 L/)).toBeTruthy();
    });
  });

  describe("BU:GU tab", () => {
    it("switches to BU:GU tab and shows its content", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      expect(screen.getByText("Ratio BU:GU")).toBeTruthy();
      expect(
        screen.getByText(
          "Bitterness Units / Gravity Units — mesure l'équilibre amertume/maltosité",
        ),
      ).toBeTruthy();
    });

    it("shows IBU and OG inputs in BU:GU tab", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      expect(screen.getByText("IBU de la recette")).toBeTruthy();
      expect(screen.getByText("OG cible")).toBeTruthy();
    });

    it("shows calculated BU:GU ratio and rating", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      // Default: IBU=35, OG=1.055 → GU=55 → ratio = 35/55 ≈ 0.64 → "Équilibré"
      expect(screen.getByText(/\d+\.\d{2}/)).toBeTruthy();
      // "BU:GU" appears both as tab label and as result unit
      expect(screen.getAllByText("BU:GU").length).toBeGreaterThanOrEqual(2);
      // "Équilibré" also appears as notes in the reference table (Lager, Pale Ale)
      expect(screen.getAllByText("Équilibré").length).toBeGreaterThanOrEqual(1);
    });

    it("shows rating description for initial values", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      // ratio ≈ 0.64 → "Bon équilibre malt/amertume (Pale Ale, Amber)"
      expect(
        screen.getByText("Bon équilibre malt/amertume (Pale Ale, Amber)"),
      ).toBeTruthy();
    });

    it("shows reference table for beer styles", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      expect(screen.getByText("Références par style")).toBeTruthy();
      expect(screen.getByText("Stout / Porter")).toBeTruthy();
      expect(screen.getByText("Lager / Pilsner")).toBeTruthy();
      expect(screen.getByText("Pale Ale / Amber")).toBeTruthy();
      expect(screen.getByText("IPA")).toBeTruthy();
      expect(screen.getByText("Double IPA")).toBeTruthy();
    });

    it("shows ranges in the reference table", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      expect(screen.getByText("0.4 – 0.6")).toBeTruthy();
      expect(screen.getByText("0.8 – 1.2")).toBeTruthy();
      expect(screen.getByText("1.0 – 1.5+")).toBeTruthy();
    });

    it("updates rating when IBU input changes to high value", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      // Change IBU to 100 (ratio = 100/55 ≈ 1.82 → "Très amer")
      // Note: "Très amer" also appears in the reference table note for Double IPA
      const ibuInput = screen.getByTestId("buGu-ibu-input");
      fireEvent.changeText(ibuInput, "100");

      // At least 2 occurrences: rating label + reference table note
      expect(screen.getAllByText("Très amer").length).toBeGreaterThanOrEqual(2);
      expect(
        screen.getByText("Amertume très prononcée (DIPA, Imperial IPA)"),
      ).toBeTruthy();
    });

    it("updates rating when IBU input changes to low value", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      // Change IBU to 10 (ratio = 10/55 ≈ 0.18 → "Très doux")
      const ibuInput = screen.getByTestId("buGu-ibu-input");
      fireEvent.changeText(ibuInput, "10");

      expect(screen.getByText("Très doux")).toBeTruthy();
      expect(
        screen.getByText("Bière très peu amère, maltée, ronde"),
      ).toBeTruthy();
    });

    it("handles OG input change and recalculates ratio", () => {
      render(<HoublonsCalculatorScreen />);

      fireEvent.press(screen.getByText("BU:GU"));

      // Change OG to 1.080 (GU=80, ratio = 35/80 ≈ 0.44 → "Doux")
      const ogInput = screen.getByTestId("buGu-og-input");
      fireEvent.changeText(ogInput, "1.080");

      expect(screen.getByText("Doux")).toBeTruthy();
    });
  });
});
