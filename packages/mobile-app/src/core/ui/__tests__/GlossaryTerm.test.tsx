import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { GlossaryTerm } from "@/core/ui/GlossaryTerm";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("GlossaryTerm (Issue #783)", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("happy: renders children as plain text when the term is unknown (graceful degradation)", () => {
    render(<GlossaryTerm term="not-a-real-term">mash</GlossaryTerm>);

    expect(screen.getByText("mash")).toBeTruthy();
    // No popup appears since the term cannot be resolved.
    expect(screen.queryByText(/Définition de/)).toBeNull();
  });

  it("happy: opens the popup on long-press when the term resolves", () => {
    render(<GlossaryTerm term="mash">mash</GlossaryTerm>);

    const surface = screen.getByLabelText(/Définition de Empâtage/);
    fireEvent(surface, "longPress");

    // The popup is now mounted — the entry's definition is rendered.
    expect(screen.getByText(/Mélange du malt/)).toBeTruthy();
  });

  it("happy: regular tap is a no-op (does not open the popup)", () => {
    render(<GlossaryTerm term="mash">mash</GlossaryTerm>);

    const surface = screen.getByLabelText(/Définition de Empâtage/);
    fireEvent.press(surface);

    expect(screen.queryByText(/Mélange du malt/)).toBeNull();
  });

  it("edge: the trailing onPress fired by React Native after onLongPress is suppressed", () => {
    render(<GlossaryTerm term="mash">mash</GlossaryTerm>);

    const surface = screen.getByLabelText(/Définition de Empâtage/);
    // React Native fires onLongPress, then onPress on release. The
    // popup must stay open — the trailing onPress must not flip
    // any state that closes it.
    fireEvent(surface, "longPress");
    fireEvent.press(surface);

    expect(screen.getByText(/Mélange du malt/)).toBeTruthy();
  });

  it("happy: alias resolves to the same canonical entry", () => {
    render(<GlossaryTerm term="empâtage">empâtage</GlossaryTerm>);

    const surface = screen.getByLabelText(/Définition de Empâtage/);
    fireEvent(surface, "longPress");

    expect(screen.getByText(/Mélange du malt/)).toBeTruthy();
  });

  it("happy: Académie link navigates to the glossaire route", () => {
    render(<GlossaryTerm term="mash">mash</GlossaryTerm>);

    const surface = screen.getByLabelText(/Définition de Empâtage/);
    fireEvent(surface, "longPress");
    fireEvent.press(
      screen.getByLabelText("Ouvrir l'Académie pour en savoir plus"),
    );

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/(app)/academy/glossaire");
  });
});
