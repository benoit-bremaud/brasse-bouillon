import { AcademyTopicPlaceholderScreen } from "@/features/tools/presentation/AcademyTopicPlaceholderScreen";
import { FermentesciblesCalculatorScreen } from "@/features/tools/presentation/FermentesciblesCalculatorScreen";
import { useLocalSearchParams } from "expo-router";

export default function AcademyTopicCalculatorRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;

  if (normalizedSlug === "fermentescibles") {
    return <FermentesciblesCalculatorScreen />;
  }

  return (
    <AcademyTopicPlaceholderScreen
      slugParam={normalizedSlug}
      mode="calculator"
    />
  );
}
