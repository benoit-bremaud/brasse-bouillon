import { useLocalSearchParams } from "expo-router";

import { MeasurementEntryScreen } from "@/features/batches/presentation/MeasurementEntryScreen";

/**
 * Route delegating to {@link MeasurementEntryScreen}. No business logic lives
 * here: it only resolves the batch id and the optional already-recorded OG
 * from the URL params (mirrors `recipes/[id]/prepare.tsx`).
 */
export default function BatchMeasurementRoute() {
  const { id, og } = useLocalSearchParams<{
    id?: string | string[];
    og?: string | string[];
  }>();
  const batchId = Array.isArray(id) ? (id[0] ?? "") : (id ?? "");
  const ogParam = Array.isArray(og) ? og[0] : og;
  const recordedOg =
    ogParam != null && ogParam !== "" ? Number.parseFloat(ogParam) : null;

  return (
    <MeasurementEntryScreen
      batchId={batchId}
      recordedOg={
        recordedOg != null && !Number.isNaN(recordedOg) ? recordedOg : null
      }
    />
  );
}
