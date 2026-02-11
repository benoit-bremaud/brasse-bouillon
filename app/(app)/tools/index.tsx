import { BrewingToolsScreen } from "@/features/tools/presentation/BrewingToolsScreen";
import { useLocalSearchParams } from "expo-router";

export default function ToolsRoute() {
  const params = useLocalSearchParams<{
    sourceType?: string | string[];
    sourceId?: string | string[];
  }>();

  const normalizeParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const normalizedSourceType = normalizeParam(params.sourceType);

  const sourceType =
    normalizedSourceType === "recipe" || normalizedSourceType === "batch"
      ? normalizedSourceType
      : undefined;

  const sourceId = normalizeParam(params.sourceId);

  return <BrewingToolsScreen sourceType={sourceType} sourceId={sourceId} />;
}
