import { useSafeAreaInsets } from "react-native-safe-area-context";

import { navBar } from "@/core/theme";

/**
 * Space, in px, that screen content must leave free at the bottom so it clears
 * the flush navigation bar (ADR-0029, clause 4).
 *
 * This is the **single source** for that number: the bar's visual height plus
 * the bottom safe-area inset it absorbs. `navBar.height` alone is not enough —
 * on a device with a gesture bar or home indicator the bar is taller than the
 * constant, and reserving only the constant would leave the last control tucked
 * under it.
 *
 * Scrollable screens get this applied for them by `ScreenScrollView` /
 * `ScreenFlatList`; they must not re-derive it. Call it directly only for
 * bottom-anchored chrome that is not scroll content (the app-level `Snackbar`,
 * sticky CTAs).
 *
 * The value is state-independent: it stays constant whether the bar is revealed
 * or hidden, which is what makes the clause-6 invariant hold — a control can
 * never be occluded at rest, regardless of any hide/reveal animation.
 */
export function useNavBarClearance(): number {
  const insets = useSafeAreaInsets();
  return navBar.height + insets.bottom;
}
