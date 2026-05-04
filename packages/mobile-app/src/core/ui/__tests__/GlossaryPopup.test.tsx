import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { GlossaryPopup } from "@/core/ui/GlossaryPopup";
import type { GlossaryEntry } from "@/features/tools/domain/glossary.types";

const ENTRY: GlossaryEntry = {
  term: "mash",
  displayLabel: "Empâtage",
  definition:
    "Étape de brassage où l'on mélange le malt concassé avec l'eau chaude.",
  category: "brewing-process",
};

describe("GlossaryPopup (Issue #783)", () => {
  it("happy: renders nothing when entry is null", () => {
    render(<GlossaryPopup entry={null} onClose={jest.fn()} />);

    expect(screen.queryByText("Empâtage")).toBeNull();
  });

  it("happy: renders the entry's label, category badge, and definition", () => {
    render(<GlossaryPopup entry={ENTRY} onClose={jest.fn()} />);

    expect(screen.getByText("Empâtage")).toBeTruthy();
    expect(screen.getByText(/Étape de brassage/)).toBeTruthy();
    // Badge labels are uppercased by the Badge primitive.
    expect(screen.getByText("PROCESSUS")).toBeTruthy();
  });

  it("happy: invokes onClose when the backdrop is pressed (the only close affordance)", () => {
    const handleClose = jest.fn();
    render(<GlossaryPopup entry={ENTRY} onClose={handleClose} />);

    fireEvent.press(screen.getByLabelText("Fermer la définition"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("happy: invokes onReadMore when the Académie link is pressed", () => {
    const handleReadMore = jest.fn();
    render(
      <GlossaryPopup
        entry={ENTRY}
        onClose={jest.fn()}
        onReadMore={handleReadMore}
      />,
    );

    fireEvent.press(
      screen.getByLabelText("Ouvrir l'Académie pour en savoir plus"),
    );

    expect(handleReadMore).toHaveBeenCalledTimes(1);
    expect(handleReadMore).toHaveBeenCalledWith(ENTRY);
  });

  it("edge: hides the Académie link when onReadMore is not provided", () => {
    render(<GlossaryPopup entry={ENTRY} onClose={jest.fn()} />);

    expect(
      screen.queryByLabelText("Ouvrir l'Académie pour en savoir plus"),
    ).toBeNull();
  });
});
