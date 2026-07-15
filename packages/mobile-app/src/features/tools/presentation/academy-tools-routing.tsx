import { Redirect } from "expo-router";
import React from "react";

import {
  normalizeRouteParam,
  type RouteParamValue,
} from "@/core/navigation/route-params";
import { getAcademyArticleBySlug } from "@/features/academy/application";
import { generatedAcademyRepository } from "@/features/academy/data";
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

type AcademyTopicDetailsRouteScreenProps = {
  slugParam?: RouteParamValue;
  termSlugParam?: RouteParamValue;
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
  termSlugParam,
}: AcademyTopicDetailsRouteScreenProps) {
  return (
    <AcademyTopicDetailsScreen
      slugParam={slugParam}
      termSlugParam={termSlugParam}
    />
  );
}

export function AcademyTopicLearnRouteScreen({
  slugParam,
}: {
  slugParam?: RouteParamValue;
}) {
  const normalizedSlug = normalizeRouteParam(slugParam);
  const publishedArticle = normalizedSlug
    ? getAcademyArticleBySlug(generatedAcademyRepository, normalizedSlug)
    : null;

  // A published article renders in full at the details route. Redirect the
  // legacy "learn" deep link there instead of the coming-soon placeholder,
  // which otherwise leaks for every migrated article (e.g. histoire).
  if (normalizedSlug && publishedArticle?.metadata.status === "published") {
    return (
      <Redirect
        href={{
          pathname: "/(app)/academy/[slug]",
          params: { slug: normalizedSlug },
        }}
      />
    );
  }

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
