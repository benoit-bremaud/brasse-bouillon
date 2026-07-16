import React from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

import { useNavigationBarFootprint } from "@/core/ui/use-navigation-bar-footprint";
import { useScrollDirection } from "@/core/ui/use-scroll-direction";

/**
 * `ScrollView` that clears the bottom navigation bar and drives its
 * scroll-away, so screens never do either by hand (ADR-0029 clauses 4–5).
 *
 * Replaces the old per-screen `useNavigationFooterOffset()` +
 * `paddingBottom` opt-in: a screen that forgot it — or wired it to the wrong
 * container — was silently covered by the bar. Here the clearance is applied
 * to the scrolled content itself, which is what lets content pass *under* the
 * bar mid-scroll (the full-screen feel of ADR-0029 D2/B1) while still landing
 * clear of it at rest.
 *
 * The reserved clearance is constant across Revealed and Hidden — hiding only
 * translates the bar, it never reflows content (clause 6).
 *
 * Pass `contentContainerStyle` as usual; the bottom clearance is merged in
 * last so a screen cannot accidentally cancel it.
 */
type ScreenScrollViewProps = ScrollViewProps & {
  /**
   * Forwarded to the underlying `ScrollView` (React 19 treats `ref` as a
   * regular prop, so no `forwardRef` needed). Screens that scroll
   * programmatically — e.g. Academy articles jumping to a glossary term —
   * need the real handle.
   */
  ref?: React.Ref<ScrollView>;
  /**
   * Extra clearance stacked on top of the nav bar footprint, for a screen that
   * pins something else above the bar — today only `STICKY_CTA_BAR_HEIGHT` on
   * the three CTA screens.
   *
   * Passed explicitly rather than read from `useStickyCtaClearance()`: that
   * context is app-level, and tab screens stay mounted, so a CTA mounted on a
   * background screen would silently inflate an unrelated screen's padding.
   */
  extraBottomClearance?: number;
};

export function ScreenScrollView({
  contentContainerStyle,
  onScroll,
  ref,
  extraBottomClearance = 0,
  ...props
}: ScreenScrollViewProps) {
  const footprint = useNavigationBarFootprint();
  const { onScroll: trackScroll } = useScrollDirection();

  return (
    <ScrollView
      {...props}
      ref={ref}
      contentContainerStyle={[
        contentContainerStyle,
        { paddingBottom: footprint + extraBottomClearance },
      ]}
      onScroll={(event) => {
        trackScroll(event);
        onScroll?.(event);
      }}
      scrollEventThrottle={16}
    />
  );
}
