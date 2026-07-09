import { AcademyArticle } from "../domain";
import {
  formatAcademyCategoryLabel,
  formatAcademyReadTime,
} from "./academy-display-formatters";

export interface AcademyLegacyHubTopic {
  readonly slug: string;
  readonly title?: string;
  readonly shortDescription?: string;
  readonly focus?: string;
  readonly order: number;
  readonly estimatedReadTime?: string;
  readonly hasCalculator?: boolean;
  readonly status: "ready" | "coming-soon";
}

export interface AcademyHubCardViewModel {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly focus: string;
  readonly order: number;
  readonly estimatedReadTime: string;
  readonly hasCalculator: boolean;
  readonly source: "generated" | "legacy";
}

export function createAcademyHubCards(
  articles: readonly AcademyArticle[],
  legacyTopics: readonly AcademyLegacyHubTopic[],
): readonly AcademyHubCardViewModel[] {
  const articleBySlug = new Map(
    articles.map((article) => [article.slug, article] as const),
  );
  const mappedLegacyTopics = legacyTopics.flatMap((topic) => {
    const article = articleBySlug.get(topic.slug);
    if (article) {
      return [createGeneratedHubCard(article, topic)];
    }

    const legacyCard = createLegacyHubCard(topic);
    return legacyCard ? [legacyCard] : [];
  });
  const legacySlugs = new Set(legacyTopics.map((topic) => topic.slug));
  const generatedOnlyCards = articles
    .filter((article) => !legacySlugs.has(article.slug))
    .map((article, index) =>
      createGeneratedHubCard(article, {
        slug: article.slug,
        title: article.metadata.title,
        shortDescription: article.metadata.summary,
        focus: formatAcademyCategoryLabel(article.metadata.category),
        order: legacyTopics.length + index,
        estimatedReadTime: formatAcademyReadTime(
          article.metadata.estimatedReadTimeMinutes,
        ),
        hasCalculator: article.metadata.relatedCalculators.length > 0,
        status: "ready",
      }),
    );

  return [...mappedLegacyTopics, ...generatedOnlyCards].sort(
    (first, second) => first.order - second.order,
  );
}

export function filterAcademyHubCards(
  cards: readonly AcademyHubCardViewModel[],
  query: string,
): readonly AcademyHubCardViewModel[] {
  const normalizedQuery = normalizeSearchValue(query).trim();

  if (!normalizedQuery) {
    return cards;
  }

  return cards.filter((card) =>
    [card.slug, card.title, card.summary, card.focus, card.estimatedReadTime]
      .map(normalizeSearchValue)
      .some((value) => value.includes(normalizedQuery)),
  );
}

export function listAcademyHubFocusFilters(
  cards: readonly AcademyHubCardViewModel[],
): readonly string[] {
  return Array.from(new Set(cards.map((card) => card.focus)));
}

export function filterAcademyHubCardsByFocus(
  cards: readonly AcademyHubCardViewModel[],
  focus: string | null,
): readonly AcademyHubCardViewModel[] {
  if (!focus) {
    return cards;
  }

  return cards.filter((card) => card.focus === focus);
}

function createGeneratedHubCard(
  article: AcademyArticle,
  fallback: AcademyLegacyHubTopic,
): AcademyHubCardViewModel {
  return {
    slug: article.slug,
    title: article.metadata.title,
    summary: article.metadata.summary,
    focus: formatAcademyCategoryLabel(article.metadata.category),
    order: fallback.order,
    estimatedReadTime: formatAcademyReadTime(
      article.metadata.estimatedReadTimeMinutes,
    ),
    hasCalculator: article.metadata.relatedCalculators.length > 0,
    source: "generated",
  };
}

function createLegacyHubCard(
  topic: AcademyLegacyHubTopic,
): AcademyHubCardViewModel | null {
  if (
    !topic.title ||
    !topic.shortDescription ||
    !topic.focus ||
    !topic.estimatedReadTime
  ) {
    return null;
  }

  return {
    slug: topic.slug,
    title: topic.title,
    summary: topic.shortDescription,
    focus: topic.focus,
    order: topic.order,
    estimatedReadTime: topic.estimatedReadTime,
    hasCalculator: topic.hasCalculator ?? false,
    source: "legacy",
  };
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}
