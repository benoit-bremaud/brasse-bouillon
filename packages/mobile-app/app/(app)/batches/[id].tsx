import { useLocalSearchParams } from "expo-router";

import { BatchDetailsScreen } from "@/features/batches/presentation/BatchDetailsScreen";

export default function BatchDetailsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <BatchDetailsScreen batchId={String(id ?? "")} />;
}
