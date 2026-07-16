import React from "react";
import { StyleSheet } from "react-native";
import { render, screen } from "@testing-library/react-native";

import { NAV_BAR_HEIGHT } from "@/core/theme";
import { FooterVisibilityProvider } from "@/core/ui/footer-visibility-context";
import { Snackbar } from "@/core/ui/Snackbar";

const BOTTOM_INSET = 24;

jest.mock("expo-router", () => ({
  usePathname: () => "/dashboard",
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: BOTTOM_INSET,
    left: 0,
  }),
}));

function renderSnackbar() {
  return render(
    <FooterVisibilityProvider>
      <Snackbar visible message="Brouillon enregistré." />
    </FooterVisibilityProvider>,
  );
}

describe("Snackbar — nav bar clearance", () => {
  // Single source of truth (ADR-0029 clause 5): the snackbar must anchor off
  // the shared footprint, not off its own copy of the bar arithmetic. Before
  // this, it consumed a per-screen offset that had to be hand-kept in sync.
  it("anchors on the shared bar footprint, inset included", () => {
    renderSnackbar();

    const style = StyleSheet.flatten(
      screen.getByTestId("snackbar-overlay").props.style,
    );

    expect(style?.paddingBottom).toBe(NAV_BAR_HEIGHT + BOTTOM_INSET);
  });
});
