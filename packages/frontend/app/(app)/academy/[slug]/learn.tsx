import { AcademyTopicLearnRouteScreen } from "@/features/tools/presentation/academy-tools-routing";
import { useLocalSearchParams } from "expo-router";

export default function AcademyTopicLearnRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();

  return <AcademyTopicLearnRouteScreen slugParam={slug} />;
}
