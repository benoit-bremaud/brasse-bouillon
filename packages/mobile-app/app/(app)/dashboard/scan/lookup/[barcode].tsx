import { BeerInfoCardScreen } from "@/features/scan/presentation/BeerInfoCardScreen";
import { useLocalSearchParams } from "expo-router";

export default function DashboardScanLookupRoute() {
  const { barcode } = useLocalSearchParams<{
    barcode?: string | string[];
  }>();

  return <BeerInfoCardScreen barcodeParam={barcode} />;
}
