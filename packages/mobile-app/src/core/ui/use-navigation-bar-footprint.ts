import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NAV_BAR_HEIGHT } from "@/core/theme";

/**
 * Space the flush bottom navigation bar actually occupies, in px.
 *
 * The bar is anchored to the very bottom edge and absorbs the bottom
 * safe-area inset inside itself, so its footprint is its base visual height
 * plus that inset (ADR-0029 clause 4). `NAV_BAR_HEIGHT` alone would sit too
 * short on a device with a home indicator.
 *
 * The same number serves three consumers, which is why it lives in one hook:
 * the shared scroll containers reserve it as bottom clearance, the bar
 * translates by it when hiding, and the Snackbar / sticky CTAs anchor above
 * it. Keeping it constant across Revealed and Hidden is what makes the
 * clause-6 invariant hold — content clears the bar at rest no matter what the
 * animation is doing.
 */
export function useNavigationBarFootprint(): number {
  const insets = useSafeAreaInsets();

  return NAV_BAR_HEIGHT + insets.bottom;
}
