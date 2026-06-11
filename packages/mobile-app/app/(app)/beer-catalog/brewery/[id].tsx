import { useLocalSearchParams } from "expo-router";

import { BreweryDetailScreen } from "@/features/beer-catalog/presentation/BreweryDetailScreen";

export default function BreweryDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  return (
    <BreweryDetailScreen
      breweryId={Array.isArray(id) ? (id[0] ?? "") : (id ?? "")}
    />
  );
}
