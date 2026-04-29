import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { DemoOverrideMenu } from "@/features/scan/presentation/components/DemoOverrideMenu";

describe("DemoOverrideMenu (Issue #642 — soutenance backup)", () => {
  it("renders all seeded beers when visible", () => {
    render(
      <DemoOverrideMenu visible onClose={jest.fn()} onSelectBeer={jest.fn()} />,
    );

    // Sample assertions on a few well-known seeds (full list is
    // 9 beers as of 2026-04-29 — see scan-catalog.seed.ts).
    expect(screen.getByText("Punk IPA")).toBeTruthy();
    expect(screen.getByText("La Chouffe")).toBeTruthy();
    expect(screen.getByText("Rochefort 10")).toBeTruthy();
    expect(screen.getByText(/Démo — bières seedées/i)).toBeTruthy();
  });

  it("renders nothing when not visible", () => {
    render(
      <DemoOverrideMenu
        visible={false}
        onClose={jest.fn()}
        onSelectBeer={jest.fn()}
      />,
    );

    expect(screen.queryByText("Punk IPA")).toBeNull();
  });

  it("calls onSelectBeer with the matching barcode when a row is tapped", () => {
    const handleSelect = jest.fn();
    render(
      <DemoOverrideMenu
        visible
        onClose={jest.fn()}
        onSelectBeer={handleSelect}
      />,
    );

    fireEvent.press(screen.getByLabelText(/Forcer Punk IPA/i));

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith("5060277380019");
  });

  it("calls onClose when the cancel button is tapped", () => {
    const handleClose = jest.fn();
    render(
      <DemoOverrideMenu
        visible
        onClose={handleClose}
        onSelectBeer={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText(/Fermer le menu démo/i));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("displays brewery + style + ABV metadata on each row", () => {
    render(
      <DemoOverrideMenu visible onClose={jest.fn()} onSelectBeer={jest.fn()} />,
    );

    // Punk IPA: BrewDog · IPA · 5.4 %
    expect(screen.getByText(/BrewDog · IPA · 5\.4 %/i)).toBeTruthy();
  });

  it("shows the EAN-13 barcode on each row (so the speaker can sanity-check it)", () => {
    render(
      <DemoOverrideMenu visible onClose={jest.fn()} onSelectBeer={jest.fn()} />,
    );

    expect(screen.getByText("5060277380019")).toBeTruthy();
  });
});
