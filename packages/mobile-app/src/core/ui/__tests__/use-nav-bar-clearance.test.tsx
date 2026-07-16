import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { navBar } from "@/core/theme";
import { useNavBarClearance } from "@/core/ui/use-nav-bar-clearance";

const mockInsets = { top: 0, right: 0, bottom: 0, left: 0 };

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => mockInsets,
}));

function Probe() {
  return <Text testID="clearance">{String(useNavBarClearance())}</Text>;
}

function renderWithBottomInset(bottom: number): string {
  mockInsets.bottom = bottom;
  render(<Probe />);
  return screen.getByTestId("clearance").props.children as string;
}

describe("useNavBarClearance", () => {
  afterEach(() => {
    mockInsets.bottom = 0;
  });

  // Happy path: a device with no bottom inset (Android with hardware buttons).
  // The bar is exactly its visual height, so that is all content must clear.
  it("reserves the bar's visual height when there is no bottom inset", () => {
    expect(renderWithBottomInset(0)).toBe(String(navBar.height));
  });

  // ADR-0029 clause 4 — the reason a bare NAV_BAR_HEIGHT constant is not enough.
  // The bar absorbs the inset as its own padding, so its real footprint grows
  // with it; reserving only the constant would tuck the last control under it.
  it("adds the bottom safe-area inset the bar absorbs", () => {
    expect(renderWithBottomInset(34)).toBe(String(navBar.height + 34));
  });

  // Guards the invariant this whole redesign rests on: the value must not depend
  // on anything stateful (visibility, scroll). Same insets in, same number out.
  it("returns the same clearance across renders with unchanged insets", () => {
    expect(renderWithBottomInset(24)).toBe(renderWithBottomInset(24));
  });
});
