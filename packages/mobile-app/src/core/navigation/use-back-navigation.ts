import { useCallback } from "react";

import { useRouter, type Href } from "expo-router";

/**
 * Shared "back" behavior for screens that render a manual back control.
 *
 * Prefers popping the real navigation history so the user returns to
 * wherever they actually came from. When there is nothing to pop — a deep
 * link, a cold start, or a screen reached via `replace` — it falls back to a
 * known parent route instead of dead-ending (which, on iOS, would strand the
 * user since there is no hardware back button).
 *
 * Generalizes the `canGoBack()` guard first introduced on the Academy screens
 * so every screen shares one predictable back behavior.
 *
 * @param fallback Route to land on when there is no history to pop.
 * @returns A stable-per-fallback handler to wire to a back control's `onPress`.
 */
export function useBackNavigation(fallback: Href): () => void {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  }, [router, fallback]);
}
