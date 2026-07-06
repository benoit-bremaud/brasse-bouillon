import { AcademyArticle } from "../domain";

export interface AcademyLegacyHubTopic {
  readonly slug: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly focus: string;
  readonly order: number;
  readonly estimatedReadTime: string;
  readonly hasCalculator: boolean;
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
  const mappedLegacyTopics = legacyTopics.map((topic) => {
    const article = articleBySlug.get(topic.slug);

    return article
      ? createGeneratedHubCard(article, topic)
      : createLegacyHubCard(topic);
  });
  const legacySlugs = new Set(legacyTopics.map((topic) => topic.slug));
  const generatedOnlyCards = articles
    .filter((article) => !legacySlugs.has(article.slug))
    .map((article, index) =>
      createGeneratedHubCard(article, {
        slug: article.slug,
        title: article.metadata.title,
        shortDescription: article.metadata.summary,
        focus: createCategoryLabel(article.metadata.category),
        order: legacyTopics.length + index,
        estimatedReadTime: formatReadTime(
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

function createGeneratedHubCard(
  article: AcademyArticle,
  fallback: AcademyLegacyHubTopic,
): AcademyHubCardViewModel {
  return {
    slug: article.slug,
    title: article.metadata.title,
    summary: article.metadata.summary,
    focus: createCategoryLabel(article.metadata.category) || fallback.focus,
    order: fallback.order,
    estimatedReadTime: formatReadTime(
      article.metadata.estimatedReadTimeMinutes,
    ),
    hasCalculator: article.metadata.relatedCalculators.length > 0,
    source: "generated",
  };
}

function createLegacyHubCard(
  topic: AcademyLegacyHubTopic,
): AcademyHubCardViewModel {
  return {
    slug: topic.slug,
    title: topic.title,
    summary: topic.shortDescription,
    focus: topic.focus,
    order: topic.order,
    estimatedReadTime: topic.estimatedReadTime,
    hasCalculator: topic.hasCalculator,
    source: "legacy",
  };
}

function formatReadTime(minutes: number): string {
  return `${minutes} min`;
}

function createCategoryLabel(category: AcademyArticle["metadata"]["category"]) {
  switch (category) {
    case "getting-started":
      return "Premiers pas";
    case "ingredients":
      return "Ingrédients";
    case "process":
      return "Process";
    case "fermentation":
      return "Fermentation";
    case "water":
      return "Eau";
    case "equipment":
      return "Matériel";
    case "beer-styles":
      return "Styles";
    case "safety":
      return "Sécurité";
    case "troubleshooting":
      return "Dépannage";
    case "glossary":
      return "Glossaire";
  }
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}
