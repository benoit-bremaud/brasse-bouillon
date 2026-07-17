import React from "react";
import { FlatList, type FlatListProps } from "react-native";

import { useNavigationBarFootprint } from "@/core/ui/use-navigation-bar-footprint";
import { useScrollDirection } from "@/core/ui/use-scroll-direction";

/**
 * `FlatList` counterpart of {@link ScreenScrollView}: clears the bottom
 * navigation bar and drives its scroll-away, so list screens never do either
 * by hand (ADR-0029 clauses 4–5).
 *
 * See `ScreenScrollView` for why the clearance lives on the scrolled content
 * rather than on a wrapper.
 */
type ScreenFlatListProps<ItemT> = FlatListProps<ItemT> & {
  /**
   * Extra clearance stacked on top of the nav bar footprint, for a screen that
   * pins something else above the bar (e.g. `STICKY_CTA_BAR_HEIGHT`). Mirrors
   * `ScreenScrollView`: these two advertise the same contract, so their APIs
   * must not drift apart.
   */
  extraBottomClearance?: number;
};

export function ScreenFlatList<ItemT>({
  contentContainerStyle,
  onScroll,
  extraBottomClearance = 0,
  ...props
}: ScreenFlatListProps<ItemT>) {
  const footprint = useNavigationBarFootprint();
  const { onScroll: trackScroll } = useScrollDirection();

  return (
    <FlatList<ItemT>
      {...props}
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
