import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { act, render, screen } from "@testing-library/react-native";

import { NAV_BAR_HEIGHT } from "@/core/theme";
import {
  FooterVisibilityProvider,
  useFooterVisibility,
} from "@/core/ui/footer-visibility-context";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

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

function flattenedPaddingBottom(): number | undefined {
  const style = StyleSheet.flatten(
    screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle,
  );

  return style?.paddingBottom as number | undefined;
}

let setFooterVisible: (visible: boolean) => void = () => {};

function VisibilityHandle() {
  const { setVisible } = useFooterVisibility();
  setFooterVisible = setVisible;
  return null;
}

function renderScrollView(contentContainerStyle?: object) {
  return render(
    <FooterVisibilityProvider>
      <VisibilityHandle />
      <ScreenScrollView contentContainerStyle={contentContainerStyle}>
        <Text>content</Text>
      </ScreenScrollView>
    </FooterVisibilityProvider>,
  );
}

describe("ScreenScrollView", () => {
  it("reserves the bar footprint so content clears it — inset included", () => {
    renderScrollView();

    expect(flattenedPaddingBottom()).toBe(NAV_BAR_HEIGHT + BOTTOM_INSET);
  });

  // The clearance must win over whatever the screen passes: the old per-screen
  // opt-in let a screen silently cancel it, which is the bug this replaces.
  it("cannot be cancelled by the screen's own contentContainerStyle", () => {
    renderScrollView({ paddingBottom: 0 });

    expect(flattenedPaddingBottom()).toBe(NAV_BAR_HEIGHT + BOTTOM_INSET);
  });

  it("keeps the screen's other content styles", () => {
    renderScrollView({ gap: 12 });

    const style = StyleSheet.flatten(
      screen.UNSAFE_getByType(ScrollView).props.contentContainerStyle,
    );

    expect(style?.gap).toBe(12);
  });

  // ADR-0029 clause 6 — THE invariant. Hiding the bar only translates it; the
  // reserved clearance never changes, so a bottom control can never be covered
  // when the user stops scrolling. Correctness must not depend on the animation.
  it("reserves the same clearance whether the bar is revealed or hidden", () => {
    renderScrollView();

    const whenRevealed = flattenedPaddingBottom();

    act(() => {
      setFooterVisible(false);
    });

    expect(flattenedPaddingBottom()).toBe(whenRevealed);
  });
});
