import { AcademyTopicDetailsRouteScreen } from "@/features/tools/presentation/academy-tools-routing";
import { useLocalSearchParams } from "expo-router";

export default function AcademyTopicDetailsRoute() {
  const { slug, termSlug } = useLocalSearchParams<{
    slug?: string | string[];
    termSlug?: string | string[];
  }>();

  return (
    <AcademyTopicDetailsRouteScreen slugParam={slug} termSlugParam={termSlug} />
  );
}
