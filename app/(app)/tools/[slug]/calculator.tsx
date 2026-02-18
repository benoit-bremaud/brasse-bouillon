import { AcademyTopicPlaceholderScreen } from "@/features/tools/presentation/AcademyTopicPlaceholderScreen";
import { CouleurCalculatorScreen } from "@/features/tools/presentation/CouleurCalculatorScreen";
import { FermentesciblesCalculatorScreen } from "@/features/tools/presentation/FermentesciblesCalculatorScreen";
import { HoublonsCalculatorScreen } from "@/features/tools/presentation/HoublonsCalculatorScreen";
import { useLocalSearchParams } from "expo-router";

export default function AcademyTopicCalculatorRoute() {
  const { slug } = useLocalSearchParams<{ slug?: string | string[] }>();
  const normalizedSlug = Array.isArray(slug) ? slug[0] : slug;

  if (normalizedSlug === "fermentescibles") {
    return <FermentesciblesCalculatorScreen />;
  }

  if (normalizedSlug === "couleur") {
    return <CouleurCalculatorScreen />;
  }

  if (normalizedSlug === "houblons") {
    return <HoublonsCalculatorScreen />;
  }

  return (
    <AcademyTopicPlaceholderScreen
      slugParam={normalizedSlug}
      mode="calculator"
    />
  );
}
