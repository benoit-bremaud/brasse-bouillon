import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Keyboard } from "react-native";

import { usePathname } from "expo-router";

type FooterVisibilityValue = {
  /** `true` when the bottom bar is at rest, flush at the bottom edge. */
  visible: boolean;
  /** Set by the shared scroll containers via `useScrollDirection`. */
  setVisible: (visible: boolean) => void;
};

const FooterVisibilityContext = createContext<FooterVisibilityValue>({
  visible: true,
  setVisible: () => {},
});

/**
 * Single source of truth for whether the bottom navigation bar is revealed
 * (ADR-0029 clause 5).
 *
 * The bar, the app-level Snackbar and sticky CTAs all read this one boolean,
 * so they can no longer desync — before this, each anchored off a per-screen
 * offset that had to be hand-kept in sync.
 *
 * Defaults to `visible: true`: a screen that never scrolls never emits a
 * scroll event, so the bar stays pinned (ADR-0029 clause 8).
 *
 * Forced reveals that are state changes rather than scroll deltas live here
 * (ADR-0029 clause 2). Navigation is the load-bearing one: the provider
 * outlives the screens, so without it a bar hidden on a long list would stay
 * hidden on the next screen — which, if that screen never scrolls, would leave
 * it hidden for good. The other forced reveals (list top/end, pull-to-refresh)
 * fall out of `useScrollDirection`'s near-top and end-of-list guards, since
 * both only happen at a scroll position those guards already cover.
 */
export function FooterVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setVisible(true);
  }, [pathname]);

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidShow", () =>
      setVisible(true),
    );

    return () => subscription.remove();
  }, []);

  const value = useMemo(() => ({ visible, setVisible }), [visible]);

  return (
    <FooterVisibilityContext.Provider value={value}>
      {children}
    </FooterVisibilityContext.Provider>
  );
}

/** Read the shared bar visibility. Safe outside the provider (returns `true`). */
export function useFooterVisibility(): FooterVisibilityValue {
  return useContext(FooterVisibilityContext);
}
