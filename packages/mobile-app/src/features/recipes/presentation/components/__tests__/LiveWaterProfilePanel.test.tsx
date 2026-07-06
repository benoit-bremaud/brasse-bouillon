import React from "react";
import { render, screen } from "@testing-library/react-native";

import { LiveWaterProfilePanel } from "@/features/recipes/presentation/components/LiveWaterProfilePanel";
import type { LiveWaterProfile } from "@/features/recipes/domain/water-profile.types";

const baseProfile: LiveWaterProfile = {
  codeInsee: "59350",
  year: 2024,
  networkName: "LILLE",
  sampleCount: 100,
  conformity: "C",
  mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
  hardnessFrench: 125.4,
};

describe("LiveWaterProfilePanel", () => {
  it("renders the full profile with the compliant badge and hard-water pedagogy", () => {
    render(<LiveWaterProfilePanel profile={baseProfile} />);

    expect(screen.getByText("LILLE")).toBeTruthy();
    expect(screen.getByText("CONFORME")).toBeTruthy();
    expect(screen.getByText("116.7 mg/L")).toBeTruthy();
    expect(screen.getByText("322.5 mg/L")).toBeTruthy();
    expect(screen.getByText("125.4 °fH")).toBeTruthy();
    expect(screen.getByText("Eau dure — riche en calcaire.")).toBeTruthy();
    expect(screen.getByText(/Analyses 2024/)).toBeTruthy();
  });

  it("always labels sodium as non mesuré (never a fabricated 0)", () => {
    render(<LiveWaterProfilePanel profile={baseProfile} />);

    expect(screen.getByText("Sodium")).toBeTruthy();
    expect(screen.getByText("non mesuré")).toBeTruthy();
  });

  it("shows a partial-data notice and dashes for missing ions", () => {
    render(
      <LiveWaterProfilePanel
        profile={{
          ...baseProfile,
          mineralsMgL: { ...baseProfile.mineralsMgL, hco3: null },
        }}
      />,
    );

    expect(screen.getByText(/Donnée partielle/)).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
  });

  it("renders the non-compliant verdict distinctly", () => {
    render(
      <LiveWaterProfilePanel profile={{ ...baseProfile, conformity: "N" }} />,
    );

    expect(screen.getByText("NON CONFORME")).toBeTruthy();
  });
});
