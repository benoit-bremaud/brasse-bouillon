import React from "react";
import { Text } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { act, render } from "@testing-library/react-native";

import {
  FooterVisibilityProvider,
  useFooterVisibility,
} from "@/core/ui/footer-visibility-context";
import { useScrollDirection } from "@/core/ui/use-scroll-direction";

jest.mock("expo-router", () => ({
  usePathname: () => "/dashboard",
}));

/**
 * Builds a scroll event. Defaults describe a long list scrolled well away from
 * both ends, so a test only states the axis it actually exercises.
 */
function scrollEvent(
  offsetY: number,
  overrides: Partial<NativeScrollEvent> = {},
) {
  return {
    nativeEvent: {
      contentOffset: { x: 0, y: offsetY },
      contentSize: { width: 400, height: 5000 },
      layoutMeasurement: { width: 400, height: 800 },
      ...overrides,
    },
  } as NativeSyntheticEvent<NativeScrollEvent>;
}

type Harness = {
  scroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  forceReveal: () => void;
};

const harness: Harness = { scroll: () => {}, forceReveal: () => {} };

function Probe() {
  const { visible } = useFooterVisibility();
  const { onScroll, forceReveal } = useScrollDirection();

  harness.scroll = onScroll;
  harness.forceReveal = forceReveal;

  return <Text>{visible ? "visible" : "hidden"}</Text>;
}

function renderProbe() {
  return render(
    <FooterVisibilityProvider>
      <Probe />
    </FooterVisibilityProvider>,
  );
}

function scroll(offsetY: number, overrides?: Partial<NativeScrollEvent>) {
  act(() => {
    harness.scroll(scrollEvent(offsetY, overrides));
  });
}

describe("useScrollDirection", () => {
  it("starts revealed", () => {
    const { getByText } = renderProbe();

    expect(getByText("visible")).toBeTruthy();
  });

  it("hides on a sustained scroll down", () => {
    const { getByText } = renderProbe();

    scroll(200);

    expect(getByText("hidden")).toBeTruthy();
  });

  it("reveals again on a sustained scroll up", () => {
    const { getByText } = renderProbe();

    scroll(400);
    expect(getByText("hidden")).toBeTruthy();

    scroll(300);

    expect(getByText("visible")).toBeTruthy();
  });

  // The threshold gates BOTH directions: an ungated reveal would pop the bar
  // back on the tiniest upward jitter — the flicker it exists to prevent.
  it("ignores movements below the threshold in both directions", () => {
    const { getByText } = renderProbe();

    scroll(400);
    expect(getByText("hidden")).toBeTruthy();

    scroll(396); // 4px up — below threshold
    expect(getByText("hidden")).toBeTruthy();

    scroll(404); // 4px down from the anchor — still below threshold
    expect(getByText("hidden")).toBeTruthy();
  });

  // Small movements must accumulate: the anchor only moves when the state flips,
  // so a slow sustained scroll still toggles rather than being ignored forever.
  it("accumulates small movements into a sustained delta", () => {
    const { getByText } = renderProbe();

    scroll(400);
    scroll(396);
    scroll(392);
    scroll(388); // 12px up from the 400 anchor — threshold reached

    expect(getByText("visible")).toBeTruthy();
  });

  it("stays revealed near the top even on a downward flick", () => {
    const { getByText } = renderProbe();

    scroll(20);

    expect(getByText("visible")).toBeTruthy();
  });

  it("stays revealed on iOS bounce (negative offset)", () => {
    const { getByText } = renderProbe();

    scroll(400);
    expect(getByText("hidden")).toBeTruthy();

    scroll(-30);

    expect(getByText("visible")).toBeTruthy();
  });

  it("forces a reveal at the end of the list", () => {
    const { getByText } = renderProbe();

    scroll(400);
    expect(getByText("hidden")).toBeTruthy();

    // Scrolled down, but the viewport bottom now sits on the content end.
    scroll(4200);

    expect(getByText("visible")).toBeTruthy();
  });

  it("forceReveal bypasses the threshold", () => {
    const { getByText } = renderProbe();

    scroll(400);
    expect(getByText("hidden")).toBeTruthy();

    act(() => {
      harness.forceReveal();
    });

    expect(getByText("visible")).toBeTruthy();
  });
});
