import { BrewingToolsScreen } from "@/features/tools/presentation/BrewingToolsScreen";
import { useLocalSearchParams } from "expo-router";

export default function ToolsRoute() {
  const params = useLocalSearchParams<{
    sourceType?: string;
    sourceId?: string;
  }>();

  const sourceType =
    params.sourceType === "recipe" || params.sourceType === "batch"
      ? params.sourceType
      : undefined;

  return (
    <BrewingToolsScreen
      sourceType={sourceType}
      sourceId={params.sourceId ? String(params.sourceId) : undefined}
    />
  );
}
