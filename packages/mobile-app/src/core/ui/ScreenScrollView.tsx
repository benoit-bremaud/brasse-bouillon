import React from "react";
import { ScrollView, ScrollViewProps, StyleSheet } from "react-native";

import { useNavBarClearance } from "@/core/ui/use-nav-bar-clearance";

type ScreenScrollViewProps = ScrollViewProps &
  Readonly<{
    /**
     * Height of any extra bottom chrome this screen stacks *above* the nav bar
     * (today: a sticky CTA bar). Added to the nav-bar clearance so the last item
     * clears both. Pass the chrome's own token-derived height — never a literal.
     */
    extraBottomClearance?: number;
    /** Forwarded to the underlying `ScrollView` (React 19: `ref` is a plain prop). */
    ref?: React.Ref<ScrollView>;
  }>;

/**
 * `ScrollView` that clears the flush navigation bar on its own (ADR-0029,
 * clause 4). Use it instead of a raw `ScrollView` on any in-app screen.
 *
 * The clearance is appended to `contentContainerStyle` — i.e. it lives in the
 * scrolled **content**, not on the viewport. That placement is the whole point:
 * the list still scrolls the full height of the screen (content passes under
 * the bar, which is what lets the bar hide over it later), while the padding
 * guarantees the last item clears the bar once scrolling stops.
 *
 * Callers keep passing their own `contentContainerStyle`; this only sets the
 * bottom padding, and does so last so a caller cannot silently override the
 * clearance — screens with extra chrome declare it via `extraBottomClearance`
 * instead of re-deriving the total.
 */
export function ScreenScrollView({
  contentContainerStyle,
  extraBottomClearance = 0,
  ...props
}: ScreenScrollViewProps) {
  const clearance = useNavBarClearance();
  return (
    <ScrollView
      {...props}
      contentContainerStyle={StyleSheet.compose(contentContainerStyle, {
        paddingBottom: clearance + extraBottomClearance,
      })}
    />
  );
}
