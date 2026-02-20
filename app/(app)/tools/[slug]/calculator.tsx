import { AcademyTopicPlaceholderScreen } from "@/features/tools/presentation/AcademyTopicPlaceholderScreen";
import { AvancesCalculatorScreen } from "@/features/tools/presentation/AvancesCalculatorScreen";
import { CarbonatationCalculatorScreen } from "@/features/tools/presentation/CarbonatationCalculatorScreen";
import { CouleurCalculatorScreen } from "@/features/tools/presentation/CouleurCalculatorScreen";
import { EauCalculatorScreen } from "@/features/tools/presentation/EauCalculatorScreen";
import { FermentesciblesCalculatorScreen } from "@/features/tools/presentation/FermentesciblesCalculatorScreen";
import { HoublonsCalculatorScreen } from "@/features/tools/presentation/HoublonsCalculatorScreen";
import { LevuresCalculatorScreen } from "@/features/tools/presentation/LevuresCalculatorScreen";
import { RendementCalculatorScreen } from "@/features/tools/presentation/RendementCalculatorScreen";
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

  if (normalizedSlug === "eau") {
    return <EauCalculatorScreen />;
  }

  if (normalizedSlug === "rendement") {
    return <RendementCalculatorScreen />;
  }

  if (normalizedSlug === "levures") {
    return <LevuresCalculatorScreen />;
  }

  if (normalizedSlug === "carbonatation") {
    return <CarbonatationCalculatorScreen />;
  }

  if (normalizedSlug === "avances") {
    return <AvancesCalculatorScreen />;
  }

  return (
    <AcademyTopicPlaceholderScreen
      slugParam={normalizedSlug}
      mode="calculator"
    />
  );
}
