import { useLocalSearchParams } from "expo-router";

import { BeerDetailScreen } from "@/features/beer-catalog/presentation/BeerDetailScreen";

export default function BeerDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  return (
    <BeerDetailScreen beerId={Array.isArray(id) ? (id[0] ?? "") : (id ?? "")} />
  );
}
