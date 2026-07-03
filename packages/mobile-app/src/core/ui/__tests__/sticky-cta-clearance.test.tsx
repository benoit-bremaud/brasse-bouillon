import React from "react";
import { StyleSheet, Text } from "react-native";
import { render, screen } from "@testing-library/react-native";

import { Snackbar } from "@/core/ui/Snackbar";
import {
  STICKY_CTA_BAR_HEIGHT,
  StickyCtaClearanceProvider,
  useMarkStickyCtaPresent,
  useStickyCtaClearance,
} from "@/core/ui/sticky-cta-clearance";

function ClearanceProbe() {
  const clearance = useStickyCtaClearance();
  return <Text>{`clearance:${clearance}`}</Text>;
}

function StickyCtaMarker() {
  useMarkStickyCtaPresent();
  return null;
}

/** Resolved `paddingBottom` of the Snackbar's full-screen overlay. */
function overlayPaddingBottom(): number {
  const overlay = screen.getByTestId("snackbar-overlay");
  const flat = StyleSheet.flatten(overlay.props.style) as {
    paddingBottom?: number;
  };
  return flat.paddingBottom ?? 0;
}

describe("sticky CTA clearance", () => {
  // happy: no CTA mounted → floating UI needs no extra clearance.
  it("exposes zero clearance until a sticky CTA declares itself present", () => {
    render(
      <StickyCtaClearanceProvider>
        <ClearanceProbe />
      </StickyCtaClearanceProvider>,
    );

    expect(screen.getByText("clearance:0")).toBeTruthy();
  });

  // happy: a mounted CTA raises the clearance to the bar's full height.
  it("exposes STICKY_CTA_BAR_HEIGHT while a sticky CTA is mounted", () => {
    render(
      <StickyCtaClearanceProvider>
        <StickyCtaMarker />
        <ClearanceProbe />
      </StickyCtaClearanceProvider>,
    );

    expect(screen.getByText(`clearance:${STICKY_CTA_BAR_HEIGHT}`)).toBeTruthy();
  });

  // edge: the CTA unmounting releases the clearance back to zero.
  it("releases the clearance back to zero when the CTA unmounts", () => {
    function Host({ withCta }: { withCta: boolean }) {
      return (
        <StickyCtaClearanceProvider>
          {withCta ? <StickyCtaMarker /> : null}
          <ClearanceProbe />
        </StickyCtaClearanceProvider>
      );
    }

    const { rerender } = render(<Host withCta />);
    expect(screen.getByText(`clearance:${STICKY_CTA_BAR_HEIGHT}`)).toBeTruthy();

    rerender(<Host withCta={false} />);
    expect(screen.getByText("clearance:0")).toBeTruthy();
  });

  // integration: the Snackbar overlay floats higher by exactly the bar height
  // when a sticky CTA is present, so the two never overlap on screen.
  it("floats the Snackbar higher by exactly STICKY_CTA_BAR_HEIGHT when a sticky CTA is present", () => {
    const base = render(
      <StickyCtaClearanceProvider>
        <Snackbar visible message="Recette ajoutée" />
      </StickyCtaClearanceProvider>,
    );
    const basePadding = overlayPaddingBottom();
    base.unmount();

    render(
      <StickyCtaClearanceProvider>
        <StickyCtaMarker />
        <Snackbar visible message="Recette ajoutée" />
      </StickyCtaClearanceProvider>,
    );
    const raisedPadding = overlayPaddingBottom();

    expect(raisedPadding - basePadding).toBe(STICKY_CTA_BAR_HEIGHT);
  });
});
