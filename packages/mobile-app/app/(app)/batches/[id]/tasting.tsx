import { useLocalSearchParams } from "expo-router";

import { TastingScreen } from "@/features/batches/presentation/TastingScreen";

/**
 * Route delegating to {@link TastingScreen}. No business logic lives here: it
 * only resolves the batch id from the URL params (mirrors `bottling.tsx`).
 */
export default function BatchTastingRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const batchId = Array.isArray(id) ? (id[0] ?? "") : (id ?? "");

  return <TastingScreen batchId={batchId} />;
}
