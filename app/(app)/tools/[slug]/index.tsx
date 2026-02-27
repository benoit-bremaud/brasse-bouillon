import { ToolsAcademyRedirectScreen } from "@/features/tools/presentation/academy-tools-routing";
import { useLocalSearchParams } from "expo-router";

export default function AcademyTopicDetailsRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();

  return <ToolsAcademyRedirectScreen slugParam={slug} mode="details" />;
}
