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

  it("happy: invokes onClose when the close icon is pressed", () => {
    const handleClose = jest.fn();
    render(<GlossaryPopup entry={ENTRY} onClose={handleClose} />);

    // The close icon and the backdrop both carry the same a11y
    // label — pick the icon (first match by label).
    const closeButtons = screen.getAllByLabelText("Fermer la définition");
    fireEvent.press(closeButtons[0]);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("happy: invokes onReadMore when the CTA is pressed", () => {
    const handleReadMore = jest.fn();
    render(
      <GlossaryPopup
        entry={ENTRY}
        onClose={jest.fn()}
        onReadMore={handleReadMore}
      />,
    );

    fireEvent.press(screen.getByLabelText("Lire plus dans Académie"));

    expect(handleReadMore).toHaveBeenCalledTimes(1);
    expect(handleReadMore).toHaveBeenCalledWith(ENTRY);
  });

  it("edge: hides the CTA when onReadMore is not provided", () => {
    render(<GlossaryPopup entry={ENTRY} onClose={jest.fn()} />);

    expect(screen.queryByLabelText("Lire plus dans Académie")).toBeNull();
  });
});
