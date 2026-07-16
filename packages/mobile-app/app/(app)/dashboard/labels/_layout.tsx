import { Stack } from "expo-router";

/**
 * Navigation stack for the labels subtree (home / [id] / create/select-batch /
 * create/editor). Without it these routes had no back-stack of their own, so
 * `router.back()` from the fiche or the editor fell through to the Tabs
 * navigator instead of returning to the screen the user came from (fiche ↔
 * editor round-trips). The stack makes back pop to the actual origin, which
 * the back controls now rely on via useBackNavigation. Screens render their
 * own header, so the stack header stays hidden (mirrors batches / academy).
 */
export default function LabelsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
