import React from "react";

import { spacing, typography } from "@/core/theme";

// `PrimaryButton` (what the sticky CTA renders) sets no fixed height: it is its
// label line box plus `spacing.sm` padding top and bottom. Derive from the same
// tokens so the clearance stays in sync if typography/spacing ever change.
const PRIMARY_BUTTON_HEIGHT = spacing.sm * 2 + typography.lineHeight.label;

/**
 * Visible height of a sticky CTA bar *above* the nav-footer offset — its button
 * plus the bar's top/bottom paddings (`spacing.sm` each). App-level floating UI
 * (the Snackbar) adds this to clear a sticky CTA instead of overlapping it.
 */
export const STICKY_CTA_BAR_HEIGHT =
  spacing.sm + PRIMARY_BUTTON_HEIGHT + spacing.sm;

// Split read/write so a mounted CTA never re-triggers its own register effect
// when the count changes: `register` is stable, only the clearance value moves.
const RegisterContext = React.createContext<(() => () => void) | null>(null);
const ClearanceContext = React.createContext<number>(0);

/**
 * Tracks how many sticky CTA bars are currently mounted and exposes the extra
 * bottom clearance floating UI should apply. Mounted once near the app root,
 * above both the CTA-bearing screens and the app-level Snackbar.
 */
export function StickyCtaClearanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = React.useState(0);
  const register = React.useCallback(() => {
    setCount((n) => n + 1);
    return () => setCount((n) => Math.max(0, n - 1));
  }, []);
  const clearance = count > 0 ? STICKY_CTA_BAR_HEIGHT : 0;
  return (
    <RegisterContext.Provider value={register}>
      <ClearanceContext.Provider value={clearance}>
        {children}
      </ClearanceContext.Provider>
    </RegisterContext.Provider>
  );
}

/** Extra bottom clearance (px) to add so a floating element clears a sticky CTA. */
export function useStickyCtaClearance(): number {
  return React.useContext(ClearanceContext);
}

/** A sticky CTA calls this to declare itself mounted (so floating UI clears it). */
export function useMarkStickyCtaPresent(): void {
  const register = React.useContext(RegisterContext);
  React.useEffect(() => {
    if (!register) {
      return;
    }
    return register();
  }, [register]);
}
