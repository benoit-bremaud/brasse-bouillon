import { useLocalSearchParams } from "expo-router";

import { StyleDetailScreen } from "@/features/beer-catalog/presentation/StyleDetailScreen";

export default function StyleDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  return (
    <StyleDetailScreen
      styleId={Array.isArray(id) ? (id[0] ?? "") : (id ?? "")}
    />
  );
}
