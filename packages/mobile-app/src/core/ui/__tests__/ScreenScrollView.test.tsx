import { StyleSheet, Text } from "react-native";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import { navBar } from "@/core/theme";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

const BOTTOM_INSET = 34;

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 34, left: 0 }),
}));

const styles = StyleSheet.create({
  content: { gap: 8, paddingBottom: 4, paddingTop: 12 },
});

function flatten(): Record<string, unknown> {
  const view = screen.getByTestId("scroller");
  return StyleSheet.flatten(view.props.contentContainerStyle) as Record<
    string,
    unknown
  >;
}

describe("ScreenScrollView", () => {
  it("reserves the nav-bar clearance so content clears the flush bar", () => {
    render(
      <ScreenScrollView testID="scroller">
        <Text>content</Text>
      </ScreenScrollView>,
    );

    expect(flatten().paddingBottom).toBe(navBar.height + BOTTOM_INSET);
  });

  // Screens with extra bottom chrome (a sticky CTA) must clear both bars.
  it("stacks extraBottomClearance on top of the nav-bar clearance", () => {
    render(
      <ScreenScrollView testID="scroller" extraBottomClearance={96}>
        <Text>content</Text>
      </ScreenScrollView>,
    );

    expect(flatten().paddingBottom).toBe(navBar.height + BOTTOM_INSET + 96);
  });

  it("keeps the caller's own content styles", () => {
    render(
      <ScreenScrollView
        testID="scroller"
        contentContainerStyle={styles.content}
      >
        <Text>content</Text>
      </ScreenScrollView>,
    );

    const flat = flatten();
    expect(flat.gap).toBe(8);
    expect(flat.paddingTop).toBe(12);
  });

  // Sad path — the regression this component exists to prevent. A screen that
  // sets its own paddingBottom must not be able to silently shrink the
  // clearance back to the old, occluding value (audit finding M1).
  it("overrides a caller's paddingBottom rather than letting it win", () => {
    render(
      <ScreenScrollView
        testID="scroller"
        contentContainerStyle={styles.content}
      >
        <Text>content</Text>
      </ScreenScrollView>,
    );

    expect(flatten().paddingBottom).toBe(navBar.height + BOTTOM_INSET);
    expect(flatten().paddingBottom).not.toBe(4);
  });
});
