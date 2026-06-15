import { Stack } from "expo-router";

/**
 * Navigation stack for the beer-catalogue tab. Without it the nested routes
 * (browse / search / beer / brewery / style) had no in-tab back-stack, so
 * `router.back()` fell through to the Tabs navigator and landed on the
 * previously focused tab (e.g. the academy). The stack makes back retrace the
 * real forward path: list → fiche → tap brewery → fiche brewery → back → fiche.
 * Screens render their own header, so the stack header stays hidden (mirrors
 * the academy tab layout).
 */
export default function BeerCatalogLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
