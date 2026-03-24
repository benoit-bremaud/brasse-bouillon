import { AcademyTopicCalculatorRouteScreen } from "@/features/tools/presentation/academy-tools-routing";
import { useLocalSearchParams } from "expo-router";

export default function AcademyTopicCalculatorRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();

  return <AcademyTopicCalculatorRouteScreen slugParam={slug} />;
}
