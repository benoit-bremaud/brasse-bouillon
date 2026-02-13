import { AcademyTopicDetailsScreen } from "@/features/tools/presentation/AcademyTopicDetailsScreen";
import { useLocalSearchParams } from "expo-router";

export default function AcademyTopicDetailsRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;

  return <AcademyTopicDetailsScreen slugParam={normalizedSlug} />;
}
