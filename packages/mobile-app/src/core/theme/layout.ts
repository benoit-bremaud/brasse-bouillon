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
