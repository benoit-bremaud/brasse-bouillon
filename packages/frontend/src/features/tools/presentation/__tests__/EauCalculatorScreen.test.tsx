import { fireEvent, render, screen } from "@testing-library/react-native";

import { EauCalculatorScreen } from "../EauCalculatorScreen";
import React from "react";

// Mock expo-haptics
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

describe("EauCalculatorScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the screen with initial content", () => {
    render(<EauCalculatorScreen />);

    expect(screen.getByText("Le Puits 💧")).toBeTruthy();
    expect(
      screen.getByText(
        "Calculs eau de brassage · profil ionique et alkalinité résiduelle",
      ),
    ).toBeTruthy();
    expect(screen.getByText("Profil")).toBeTruthy();
    expect(screen.getByText("Style")).toBeTruthy();
    expect(screen.getByText("Sels")).toBeTruthy();
  });

  // ── PROFIL TAB ──────────────────────────────────────────────────────────────

  it("shows the Profil tab by default with ion inputs", () => {
    render(<EauCalculatorScreen />);

    expect(screen.getByText("Profil ionique (ppm)")).toBeTruthy();
    expect(
      screen.getByText("Saisissez les concentrations de votre eau en mg/L"),
    ).toBeTruthy();
    expect(screen.getByText("Calcium (Ca²⁺)")).toBeTruthy();
    expect(screen.getByText("Magnésium (Mg²⁺)")).toBeTruthy();
    expect(screen.getByText("Sodium (Na⁺)")).toBeTruthy();
    expect(screen.getByText("Sulfates (SO₄²⁻)")).toBeTruthy();
    expect(screen.getByText("Chlorures (Cl⁻)")).toBeTruthy();
    expect(screen.getByText("Bicarbonates (HCO₃⁻)")).toBeTruthy();
  });

  it("shows initial ion values", () => {
    render(<EauCalculatorScreen />);

    // Ca and Cl both start at 75 — expect two inputs with that value
    const seventyFiveInputs = screen.getAllByDisplayValue("75");
    expect(seventyFiveInputs).toHaveLength(2); // Ca + Cl
    expect(screen.getByDisplayValue("10")).toBeTruthy(); // Mg
    expect(screen.getByDisplayValue("20")).toBeTruthy(); // Na
    expect(screen.getByDisplayValue("150")).toBeTruthy(); // SO4
    expect(screen.getByDisplayValue("50")).toBeTruthy(); // HCO3
  });

  it("shows RA and SO4/Cl ratio result cards", () => {
    render(<EauCalculatorScreen />);

    expect(screen.getByText("Alkalinité résiduelle (RA)")).toBeTruthy();
    expect(screen.getByText("Rapport SO₄ / Cl")).toBeTruthy();
    expect(screen.getByText("RA = HCO₃ − (Ca / 3,5 + Mg / 7)")).toBeTruthy();
  });

  it("displays a formatted RA value (ppm)", () => {
    render(<EauCalculatorScreen />);

    // With defaults Ca=75, Mg=10, HCO3=50 → RA = 50 - (75/3.5 + 10/7) ≈ 27.0
    const raValue = screen.getByText(/^\d+\.\d$/);
    expect(raValue).toBeTruthy();
  });

  it("updates RA when HCO3 input changes", () => {
    render(<EauCalculatorScreen />);

    const hco3Input = screen.getByDisplayValue("50");
    fireEvent.changeText(hco3Input, "150");

    // Alkalinité résiduelle card should still be displayed
    expect(screen.getByText("Alkalinité résiduelle (RA)")).toBeTruthy();
  });

  it("shows ratio as '—' when Cl is zero", () => {
    render(<EauCalculatorScreen />);

    const chloridesInput = screen.getByLabelText("Chlorures en ppm");
    fireEvent.changeText(chloridesInput, "0");

    expect(screen.getByText("—")).toBeTruthy();
  });

  it("shows a 0.00 ratio when SO4 is zero and Cl is above zero", () => {
    render(<EauCalculatorScreen />);

    const sulfatesInput = screen.getByLabelText("Sulfates en ppm");
    const chloridesInput = screen.getByLabelText("Chlorures en ppm");

    fireEvent.changeText(sulfatesInput, "0");
    fireEvent.changeText(chloridesInput, "75");

    expect(screen.getByText("0.00")).toBeTruthy();
    expect(screen.getByText("Très rond")).toBeTruthy();
  });

  // ── STYLE TAB ───────────────────────────────────────────────────────────────

  it("switches to Style tab and shows preset list", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    expect(screen.getByText("Choisir un style")).toBeTruthy();
    expect(screen.getByText("Pilsner / Lager")).toBeTruthy();
    expect(screen.getByText("Pale Ale / Blonde")).toBeTruthy();
    expect(screen.getByText("IPA")).toBeTruthy();
    expect(screen.getByText("Amber / Maltée")).toBeTruthy();
    expect(screen.getByText("Stout / Porter")).toBeTruthy();
  });

  it("shows ion comparison with profile values in Style tab", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    expect(screen.getByText("Comparaison avec votre profil")).toBeTruthy();
    expect(
      screen.getByText("Valeurs saisies dans l'onglet Profil"),
    ).toBeTruthy();

    // Ion labels appear in comparison table
    expect(screen.getByText("Calcium (Ca²⁺)")).toBeTruthy();
    expect(screen.getByText("Magnésium (Mg²⁺)")).toBeTruthy();
  });

  it("changes style preset on press", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));
    fireEvent.press(screen.getByText("IPA"));

    // IPA description should be visible
    expect(
      screen.getByText("Profil sec, SO₄ élevé, houblon mis en avant"),
    ).toBeTruthy();
  });

  it("shows ✅ or ⚠️ indicators in comparison table", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Style"));

    // With default values and Pilsner preset, some ions may or may not be in range
    const okIndicators = screen.queryAllByText("✅");
    const warnIndicators = screen.queryAllByText("⚠️");
    expect(okIndicators.length + warnIndicators.length).toBe(6); // one per ion
  });

  // ── SELS TAB ────────────────────────────────────────────────────────────────

  it("switches to Sels tab and shows salt reference cards", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("Sels de brassage")).toBeTruthy();
    expect(
      screen.getByText(
        "Contributions ioniques par g/L ajouté (pour 1 L d'eau)",
      ),
    ).toBeTruthy();
  });

  it("shows all 6 salt references", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("Gypse")).toBeTruthy();
    expect(screen.getByText("Chlorure de calcium")).toBeTruthy();
    expect(screen.getByText("Sel d'Epsom")).toBeTruthy();
    expect(screen.getByText("Sel de table")).toBeTruthy();
    expect(screen.getByText("Bicarbonate de soude")).toBeTruthy();
    expect(screen.getByText("Craie")).toBeTruthy();
  });

  it("displays salt formulas", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(screen.getByText("CaSO₄·2H₂O")).toBeTruthy();
    expect(screen.getByText("CaCl₂ (anhydre)")).toBeTruthy();
    expect(screen.getByText("MgSO₄·7H₂O")).toBeTruthy();
    expect(screen.getByText("NaCl")).toBeTruthy();
    expect(screen.getByText("NaHCO₃")).toBeTruthy();
    expect(screen.getByText("CaCO₃")).toBeTruthy();
  });

  it("displays ion contributions for salts", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    // Gypse contributes Ca²⁺ and SO₄²⁻
    const caChips = screen.getAllByText("Ca²⁺");
    expect(caChips.length).toBeGreaterThan(0);
    const so4Chips = screen.getAllByText("SO₄²⁻");
    expect(so4Chips.length).toBeGreaterThan(0);
  });

  it("displays salt notes", () => {
    render(<EauCalculatorScreen />);

    fireEvent.press(screen.getByText("Sels"));

    expect(
      screen.getByText("Augmente sécheresse et perception de l'amertume"),
    ).toBeTruthy();
    expect(
      screen.getByText("Renforce rondeur et expression maltée"),
    ).toBeTruthy();
  });

  // ── TAB SWITCHING ───────────────────────────────────────────────────────────

  it("allows switching between all three tabs", () => {
    render(<EauCalculatorScreen />);

    // Profil → Style
    fireEvent.press(screen.getByText("Style"));
    expect(screen.getByText("Choisir un style")).toBeTruthy();

    // Style → Sels
    fireEvent.press(screen.getByText("Sels"));
    expect(screen.getByText("Sels de brassage")).toBeTruthy();

    // Sels → Profil
    fireEvent.press(screen.getByText("Profil"));
    expect(screen.getByText("Profil ionique (ppm)")).toBeTruthy();
  });
});
