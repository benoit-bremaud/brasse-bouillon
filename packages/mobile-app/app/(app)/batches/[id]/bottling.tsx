import { useLocalSearchParams } from "expo-router";

import { BottlingScreen } from "@/features/batches/presentation/BottlingScreen";

/**
 * Route delegating to {@link BottlingScreen}. No business logic lives here: it
 * only resolves the batch id from the URL params (mirrors `measurement.tsx`).
 */
export default function BatchBottlingRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const batchId = Array.isArray(id) ? (id[0] ?? "") : (id ?? "");

  return <BottlingScreen batchId={batchId} />;
}
