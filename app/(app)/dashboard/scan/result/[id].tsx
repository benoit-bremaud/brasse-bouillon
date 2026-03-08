import { ScanResultScreen } from "@/features/scan/presentation/ScanResultScreen";
import { useLocalSearchParams } from "expo-router";

export default function DashboardScanResultRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  return <ScanResultScreen scanIdParam={id} />;
}
