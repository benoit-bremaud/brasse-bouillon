import { useLocalSearchParams } from "expo-router";

import { EquipmentDetailScreen } from "@/features/equipment/presentation/EquipmentDetailScreen";

export default function EquipmentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EquipmentDetailScreen profileId={String(id ?? "")} />;
}
