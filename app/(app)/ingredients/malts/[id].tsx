import { MaltDetailsScreen } from "@/features/ingredients/presentation/MaltDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function MaltDetailsRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();

  return <MaltDetailsScreen maltIdParam={id} />;
}
