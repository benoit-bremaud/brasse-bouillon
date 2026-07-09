import React from "react";
import { render, screen } from "@testing-library/react-native";

import { LiveWaterProfilePanel } from "@/features/recipes/presentation/components/LiveWaterProfilePanel";
import type {
  LiveWaterProfile,
  WaterConformity,
} from "@/features/recipes/domain/water-profile.types";

const baseProfile: LiveWaterProfile = {
  codeInsee: "59350",
  year: 2024,
  networkName: "LILLE",
  sampleCount: 100,
  conformity: "C",
  mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
  hardnessFrench: 125.4,
  // Null by default so the existing assertions exercise the year-line fallback;
  // the dated-pastille branch has its own test below.
  freshnessDate: null,
};

const withProfile = (patch: Partial<LiveWaterProfile>) => ({
  ...baseProfile,
  ...patch,
});

describe("LiveWaterProfilePanel", () => {
  it("renders the full profile with hard-water pedagogy and no partial notice", () => {
    render(<LiveWaterProfilePanel profile={baseProfile} />);

    expect(screen.getByTestId("water-profile-panel")).toBeTruthy();
    expect(screen.getByText("LILLE")).toBeTruthy();
    expect(screen.getByText("CONFORME")).toBeTruthy();
    expect(screen.getByLabelText("Conformité : Conforme")).toBeTruthy();
    expect(screen.getByText("116.7 mg/L")).toBeTruthy();
    expect(screen.getByText("125.4 °fH")).toBeTruthy();
    expect(screen.getByText("Eau dure — riche en calcaire.")).toBeTruthy();
    expect(
      screen.getByText(/Plusieurs réseaux peuvent desservir la commune/),
    ).toBeTruthy();
    expect(screen.getByText(/Analyses 2024/)).toBeTruthy();
    expect(screen.queryByText(/Donnée partielle/)).toBeNull();
  });

  it("always labels sodium as non mesuré (never a fabricated 0)", () => {
    render(<LiveWaterProfilePanel profile={baseProfile} />);

    expect(screen.getByText("Sodium")).toBeTruthy();
    expect(screen.getByText("non mesuré")).toBeTruthy();
  });

  it.each<[number, string]>([
    [10, "Eau douce — pauvre en calcaire."],
    [15, "Eau moyennement dure."],
    [20, "Eau moyennement dure."],
    [30, "Eau dure — riche en calcaire."],
    [40, "Eau dure — riche en calcaire."],
  ])(
    "maps hardness %d °fH to the right pedagogy sentence",
    (hardness, text) => {
      render(
        <LiveWaterProfilePanel
          profile={withProfile({ hardnessFrench: hardness })}
        />,
      );
      expect(screen.getByText(text)).toBeTruthy();
    },
  );

  it("shows a partial notice + dashes for a missing ion, keeping the verdict", () => {
    render(
      <LiveWaterProfilePanel
        profile={withProfile({
          mineralsMgL: { ...baseProfile.mineralsMgL, hco3: null },
        })}
      />,
    );

    expect(screen.getByText(/Donnée partielle/)).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("treats a null hardness as partial (distinct from non-conforme) and drops pedagogy", () => {
    render(
      <LiveWaterProfilePanel profile={withProfile({ hardnessFrench: null })} />,
    );

    expect(screen.getByText(/Donnée partielle/)).toBeTruthy();
    // Partial data is NOT non-conformity — the verdict stays compliant.
    expect(screen.getByText("CONFORME")).toBeTruthy();
    expect(screen.queryByText(/Eau (douce|dure|moyennement)/)).toBeNull();
  });

  it.each<[WaterConformity, string]>([
    ["C", "CONFORME"],
    ["N", "NON CONFORME"],
    ["D", "DÉROGATION"],
    ["S", "SURVEILLANCE RENFORCÉE"],
    ["UNKNOWN", "CONFORMITÉ INCONNUE"],
  ])("renders the %s conformity badge", (conformity, label) => {
    render(<LiveWaterProfilePanel profile={withProfile({ conformity })} />);
    expect(screen.getByText(label)).toBeTruthy();
  });

  it("falls back to a generic network name when none is provided", () => {
    render(
      <LiveWaterProfilePanel profile={withProfile({ networkName: null })} />,
    );
    expect(screen.getByText("Réseau d'eau local")).toBeTruthy();
  });

  it("renders the dated freshness pastille when a freshnessDate is present", () => {
    render(
      <LiveWaterProfilePanel
        profile={withProfile({ freshnessDate: "2024-03-15" })}
      />,
    );

    expect(screen.getByTestId("water-freshness")).toBeTruthy();
    expect(screen.getByText(/Dernière analyse : 15\/03\/2024/)).toBeTruthy();
    // The year-granular fallback is replaced by the dated line.
    expect(screen.queryByTestId("water-freshness-fallback")).toBeNull();
    expect(screen.queryByText(/Analyses 2024/)).toBeNull();
  });

  it("falls back to the year-granular freshness line when no date is available", () => {
    render(
      <LiveWaterProfilePanel profile={withProfile({ freshnessDate: null })} />,
    );

    expect(screen.getByTestId("water-freshness-fallback")).toBeTruthy();
    expect(screen.getByText(/Analyses 2024/)).toBeTruthy();
    expect(screen.queryByTestId("water-freshness")).toBeNull();
  });
});
