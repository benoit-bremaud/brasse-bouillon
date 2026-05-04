import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { DemoOverrideMenu } from "@/features/scan/presentation/components/DemoOverrideMenu";

describe("DemoOverrideMenu (Issue #642 — soutenance backup)", () => {
  it("renders all seeded beers when visible", () => {
    render(
      <DemoOverrideMenu visible onClose={jest.fn()} onSelectBeer={jest.fn()} />,
    );

    // Sample assertions on a few well-known seeds. Punk IPA has two
    // EAN variants (UK 0,5L canonical + DE 0,33L physical alias —
    // Issue #807) so it appears twice; the menu is per-EAN by
    // design so the speaker can force the exact bottle they have.
    expect(screen.getAllByText("Punk IPA")).toHaveLength(2);
    expect(screen.getByText("La Chouffe")).toBeTruthy();
    expect(screen.getByText("Rochefort 10")).toBeTruthy();
    // Issue #804 — these 5 entries were API-only until the sync.
    // Asserting on one of them guards against future drift.
    expect(screen.getByText("Karmeliet Tripel")).toBeTruthy();
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

    // Two Punk IPA rows (UK 0,5L canonical EAN + DE 0,33L physical
    // alias — Issue #807). Tap the first one (canonical UK EAN).
    fireEvent.press(screen.getAllByLabelText(/Forcer Punk IPA/i)[0]);

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

    // Punk IPA: BrewDog · IPA · 5.4 % — appears on both EAN
    // variants (UK 0,5L + DE 0,33L alias, Issue #807).
    expect(screen.getAllByText(/BrewDog · IPA · 5\.4 %/i)).toHaveLength(2);
  });

  it("shows the EAN-13 barcode on each row (so the speaker can sanity-check it)", () => {
    render(
      <DemoOverrideMenu visible onClose={jest.fn()} onSelectBeer={jest.fn()} />,
    );

    expect(screen.getByText("5060277380019")).toBeTruthy();
  });
});
