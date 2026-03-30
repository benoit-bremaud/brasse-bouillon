import { Redirect } from "expo-router";
import React from "react";

import {
  normalizeRouteParam,
  type RouteParamValue,
} from "@/core/navigation/route-params";
import { AcademyTopicDetailsScreen } from "./AcademyTopicDetailsScreen";
import { AcademyTopicPlaceholderScreen } from "./AcademyTopicPlaceholderScreen";
import { AvancesCalculatorScreen } from "./AvancesCalculatorScreen";
import { CarbonatationCalculatorScreen } from "./CarbonatationCalculatorScreen";
import { CouleurCalculatorScreen } from "./CouleurCalculatorScreen";
import { EauCalculatorScreen } from "./EauCalculatorScreen";
import { FermentesciblesCalculatorScreen } from "./FermentesciblesCalculatorScreen";
import { HoublonsCalculatorScreen } from "./HoublonsCalculatorScreen";
import { LevuresCalculatorScreen } from "./LevuresCalculatorScreen";
import { RendementCalculatorScreen } from "./RendementCalculatorScreen";

type ToolsAcademyRedirectMode = "details" | "learn";

type ToolsAcademyRedirectScreenProps = {
  slugParam?: RouteParamValue;
  mode: ToolsAcademyRedirectMode;
};

type AcademyTopicCalculatorScreenProps = {
  slugParam?: RouteParamValue;
};

const CALCULATOR_BY_SLUG = {
  fermentescibles: FermentesciblesCalculatorScreen,
  couleur: CouleurCalculatorScreen,
  houblons: HoublonsCalculatorScreen,
  eau: EauCalculatorScreen,
  rendement: RendementCalculatorScreen,
  levures: LevuresCalculatorScreen,
  carbonatation: CarbonatationCalculatorScreen,
  avances: AvancesCalculatorScreen,
} as const;

function isCalculatorSlug(
  slug: string,
): slug is keyof typeof CALCULATOR_BY_SLUG {
  return slug in CALCULATOR_BY_SLUG;
}

export function AcademyTopicDetailsRouteScreen({
  slugParam,
}: {
  slugParam?: RouteParamValue;
}) {
  return <AcademyTopicDetailsScreen slugParam={slugParam} />;
}

export function AcademyTopicLearnRouteScreen({
  slugParam,
}: {
  slugParam?: RouteParamValue;
}) {
  return <AcademyTopicPlaceholderScreen slugParam={slugParam} mode="learn" />;
}

export function ToolsAcademyRedirectScreen({
  slugParam,
  mode,
}: ToolsAcademyRedirectScreenProps) {
  const normalizedSlug = normalizeRouteParam(slugParam);

  if (!normalizedSlug) {
    return <Redirect href="/(app)/academy" />;
  }

  if (mode === "details") {
    return (
      <Redirect
        href={{
          pathname: "/(app)/academy/[slug]",
          params: { slug: normalizedSlug },
        }}
      />
    );
  }

  return (
    <Redirect
      href={{
        pathname: "/(app)/academy/[slug]/learn",
        params: { slug: normalizedSlug },
      }}
    />
  );
}

export function AcademyTopicCalculatorRouteScreen({
  slugParam,
}: AcademyTopicCalculatorScreenProps) {
  const normalizedSlug = normalizeRouteParam(slugParam);

  if (!normalizedSlug) {
    return <AcademyTopicPlaceholderScreen mode="calculator" />;
  }

  const CalculatorScreen = isCalculatorSlug(normalizedSlug)
    ? CALCULATOR_BY_SLUG[normalizedSlug]
    : undefined;

  if (CalculatorScreen) {
    return <CalculatorScreen />;
  }

  return (
    <AcademyTopicPlaceholderScreen
      slugParam={normalizedSlug}
      mode="calculator"
    />
  );
}
