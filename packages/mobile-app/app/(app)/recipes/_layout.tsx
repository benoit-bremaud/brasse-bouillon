import { Stack } from "expo-router";

/**
 * Navigation stack for the recipes tab. Without it the nested routes (hub /
 * catalog / [id] / prepare) had no in-tab back-stack, so `router.back()` from
 * a recipe detail fell through to the Tabs navigator and landed on the
 * previously focused tab (observed live: catalog → detail → back ended on
 * the batches list). The stack makes back pop to the actual origin (catalog,
 * hub, …), which the back controls now rely on via useBackNavigation.
 * Screens render their own header, so the stack header stays hidden
 * (mirrors batches / beer-catalog / academy).
 */
export default function RecipesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
