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
 * Bottom navigation bar — base **visual** height of the flush edge-to-edge bar
 * (`NavigationFooter`): the 48 px item touch target plus the bar's own vertical
 * padding. ADR-0029 clause 4.
 *
 * This is deliberately NOT the full footprint. The bar absorbs the bottom
 * safe-area inset inside itself, so the space it actually occupies — and the
 * clearance content must reserve, and the distance it translates when hiding —
 * is `NAV_BAR_HEIGHT + insets.bottom`, computed at runtime via
 * `useNavigationBarFootprint()`. A bare constant cannot serve devices with a
 * non-zero bottom inset.
 *
 * Single source of truth: the bar (height + translate distance) and the shared
 * scroll containers (reserved clearance) both derive from this one value, which
 * ends the magic-number drift the previous hand-rebuilt offset suffered from.
 */
export const NAV_BAR_HEIGHT = 48 + spacing.xs * 2;
