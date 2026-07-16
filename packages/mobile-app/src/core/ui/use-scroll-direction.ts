import { useCallback, useRef } from "react";

import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import { useFooterVisibility } from "@/core/ui/footer-visibility-context";

/**
 * Sustained scroll distance, in px, needed to flip the bar's visibility.
 * Gates BOTH directions: an ungated reveal would pop the bar back on the
 * tiniest upward jitter, re-introducing the flicker this threshold exists to
 * prevent (ADR-0029 clause 5, `03-sequence` notes).
 */
const TOGGLE_THRESHOLD = 12;

/**
 * Distance from the top, in px, inside which the bar stays revealed even on a
 * downward flick — so short lists never hide the nav. Also absorbs iOS bounce,
 * where the offset goes negative.
 */
const NEAR_TOP_GUARD = 32;

/** Distance from the end, in px, at which reaching the list end forces a reveal. */
const END_OF_LIST_GUARD = 24;

/**
 * Shared scroll-direction contract feeding {@link useFooterVisibility}
 * (ADR-0029 clause 5).
 *
 * Wired once by the shared scroll containers, so every screen inherits the
 * same anti-flicker rule and tuning stays a one-file change. Returns an
 * `onScroll` handler plus `forceReveal` for state changes that are not scroll
 * deltas (pull-to-refresh, navigation, keyboard) — those bypass the threshold
 * by design.
 */
export function useScrollDirection() {
  const { setVisible } = useFooterVisibility();
  // Anchor the delta is measured from. Deliberately NOT updated on
  // below-threshold events: that lets small movements accumulate into a
  // sustained delta instead of being individually discarded.
  const anchorOffsetY = useRef(0);

  const forceReveal = useCallback(() => {
    anchorOffsetY.current = 0;
    setVisible(true);
  }, [setVisible]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } =
        event.nativeEvent;
      const offsetY = contentOffset.y;

      // Near the top: pinned revealed, and re-anchor so leaving the top needs a
      // full sustained delta rather than inheriting a stale anchor.
      if (offsetY <= NEAR_TOP_GUARD) {
        anchorOffsetY.current = offsetY;
        setVisible(true);
        return;
      }

      // At the very end of the list, reveal so the last controls are reachable
      // without scrolling back up.
      const distanceToEnd =
        contentSize.height - (offsetY + layoutMeasurement.height);
      if (distanceToEnd <= END_OF_LIST_GUARD) {
        anchorOffsetY.current = offsetY;
        setVisible(true);
        return;
      }

      const delta = offsetY - anchorOffsetY.current;
      if (Math.abs(delta) < TOGGLE_THRESHOLD) {
        return;
      }

      anchorOffsetY.current = offsetY;
      setVisible(delta < 0);
    },
    [setVisible],
  );

  return { onScroll, forceReveal };
}
