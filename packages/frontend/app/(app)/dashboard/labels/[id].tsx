import { LabelDetailsScreen } from "@/features/labels/presentation/LabelDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function DashboardLabelDetailsRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  return <LabelDetailsScreen draftIdParam={id} />;
}
