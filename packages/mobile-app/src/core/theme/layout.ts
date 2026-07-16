import { spacing } from "./spacing";

/**
 * Brand header — the compact mascot + wordmark bar shown atop in-app screens
 * via the transparent Tabs header in `app/(app)/_layout.tsx`.
 *
 * The header is rendered transparent and floats over the screen content, so
 * `Screen` must push its content down by `contentClearance` to start just
 * below it. Centralising the header height, logo size and the derived
 * clearance here keeps that coupling explicit and single-sourced — the header
 * height and the padding that clears it can no longer drift apart as two
 * magic numbers in separate files.
 *
 * These are layout dimensions, not part of the `spacing` scale (whose values
 * are smaller, content-level rhythm steps).
 */
export const brandHeader = {
  /** Total height of the transparent brand header bar. */
  height: 72,
  /** Rendered size of the compact mascot logo inside the bar. */
  logoSize: 38,
  /**
   * Top padding `Screen` applies so content starts just under the header.
   * A small `spacing.xs` overlap tucks the first card close to the bar.
   */
  contentClearance: 72 - spacing.xs,
} as const;

/**
 * Bottom navigation bar — the flush, edge-to-edge dock rendered over every
 * in-app screen by `app/(app)/_layout.tsx` (ADR-0029).
 *
 * `height` is the bar's **visual** height only. It deliberately excludes the
 * bottom safe-area inset, which the bar absorbs as its own padding and which
 * varies per device — so the space content must clear is
 * `height + insets.bottom`, never this constant alone. Read that total through
 * `useNavBarClearance()`; a bare constant would leave a sliver of bar showing
 * (or over-reserve) on any device with a gesture bar or home indicator.
 *
 * Derived from the item hit target plus the bar's vertical padding, so the
 * geometry cannot drift from `NavigationFooter`'s styles.
 */
export const navBar = {
  /** Minimum hit target of a nav item — the a11y floor, not a free value. */
  itemMinHeight: 48,
  /** Vertical padding above and below the items. */
  verticalPadding: spacing.xs,
  /** Visual height of the bar, excluding the bottom safe-area inset. */
  height: 48 + spacing.xs * 2,
} as const;
