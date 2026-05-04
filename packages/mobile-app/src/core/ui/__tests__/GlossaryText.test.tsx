import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { GlossaryText } from "@/core/ui/GlossaryText";

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("GlossaryText (Issue #783)", () => {
  it("happy: renders nothing when text is empty / null / undefined", () => {
    const { rerender } = render(<GlossaryText text="" />);
    expect(screen.queryAllByText(/./)).toHaveLength(0);

    rerender(<GlossaryText text={null} />);
    expect(screen.queryAllByText(/./)).toHaveLength(0);

    rerender(<GlossaryText text={undefined} />);
    expect(screen.queryAllByText(/./)).toHaveLength(0);
  });

  it("happy: renders plain text untouched when no glossary term matches", () => {
    render(<GlossaryText text="texte sans terme connu ici" />);

    expect(screen.getByText("texte sans terme connu ici")).toBeTruthy();
  });

  it("happy: wraps known terms in interactive surfaces while leaving the rest as plain text", () => {
    render(<GlossaryText text="On lance le mash à 65°C." />);

    // The wrapped term is now an accessible surface.
    expect(screen.getByLabelText(/Définition de Empâtage/)).toBeTruthy();
  });

  it("happy: long-press on a wrapped term opens the popup", () => {
    render(<GlossaryText text="Le dry hop est important." />);

    const surface = screen.getByLabelText(/Définition de Houblonnage à cru/);
    fireEvent(surface, "longPress");

    expect(screen.getByText(/Ajout de houblons aromatiques/)).toBeTruthy();
  });

  it("edge: handles multiple terms in the same string independently", () => {
    render(<GlossaryText text="Mash 60min puis sparge à 75°C." />);

    expect(screen.getByLabelText(/Définition de Empâtage/)).toBeTruthy();
    expect(
      screen.getByLabelText(/Définition de Rinçage des drêches/),
    ).toBeTruthy();
  });
});
