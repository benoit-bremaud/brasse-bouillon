import { Stack } from "expo-router";

/**
 * Navigation stack for the batches tab. Without it the nested routes (list /
 * [id] / celebration) had no in-tab back-stack, so `router.back()` from the
 * "Brassin terminé" screen fell through to the Tabs navigator and landed on
 * the previously focused tab. The stack makes back pop to the batches list,
 * matching the screen's "Retour à la liste des brassins" label. Screens render
 * their own header, so the stack header stays hidden (mirrors academy).
 */
export default function BatchesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
