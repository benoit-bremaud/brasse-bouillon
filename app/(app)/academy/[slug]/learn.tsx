import { AcademyTopicPlaceholderScreen } from "@/features/tools/presentation/AcademyTopicPlaceholderScreen";
import { useLocalSearchParams } from "expo-router";

export default function AcademyTopicLearnRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;

  return (
    <AcademyTopicPlaceholderScreen slugParam={normalizedSlug} mode="learn" />
  );
}
