import { AcademyArticle, GlossaryTerm } from "../domain";
import { AcademyHubCardViewModel } from "./academy-hub.presenter";

export type AcademyCalculatorTopicFallback = {
  readonly slug: string;
  readonly hasCalculator?: boolean;
};

export type AcademyArticleNavigationItem = {
  readonly slug: string;
  readonly title: string;
};

export type AcademyPublishedArticleNavigation = {
  readonly previous: AcademyArticleNavigationItem | null;
  readonly next: AcademyArticleNavigationItem | null;
};

export function resolveAcademyCalculatorSlug(
  article: AcademyArticle | null,
  fallbackTopic: AcademyCalculatorTopicFallback | undefined,
): string | null {
  return (
    article?.metadata.relatedCalculators[0]?.target.slug ??
    (fallbackTopic?.hasCalculator ? fallbackTopic.slug : null)
  );
}

export function formatAcademyCalculatorButtonLabel(
  calculatorSlug: string | null,
  resolveCalculatorLabel: (slug: string) => string | null,
): string {
  if (!calculatorSlug) {
    return "Ouvrir le calculateur";
  }

  return `Ouvrir le calculateur ${
    resolveCalculatorLabel(calculatorSlug) ?? formatSlugLabel(calculatorSlug)
  }`;
}

export function listRelatedAcademyGlossaryTerms(
  term: GlossaryTerm | null,
  resolveGlossaryTerm: (slug: string) => GlossaryTerm | null,
): readonly GlossaryTerm[] {
  if (!term) {
    return [];
  }

  return term.relatedTerms
    .map(resolveGlossaryTerm)
    .filter((relatedTerm): relatedTerm is GlossaryTerm => relatedTerm !== null);
}

export function getPublishedAcademyArticleNavigation(
  currentSlug: string,
  cards: readonly AcademyHubCardViewModel[],
): AcademyPublishedArticleNavigation {
  const generatedCards = cards.filter((card) => card.source === "generated");
  const currentIndex = generatedCards.findIndex(
    (card) => card.slug === currentSlug,
  );

  if (currentIndex < 0) {
    return { previous: null, next: null };
  }

  return {
    previous: toArticleNavigationItem(generatedCards[currentIndex - 1] ?? null),
    next: toArticleNavigationItem(generatedCards[currentIndex + 1] ?? null),
  };
}

function toArticleNavigationItem(
  card: AcademyHubCardViewModel | null,
): AcademyArticleNavigationItem | null {
  return card ? { slug: card.slug, title: card.title } : null;
}

function formatSlugLabel(slug: string): string {
  return slug
    .split("-")
    .filter((part) => part.length > 0)
    .join(" ");
}
