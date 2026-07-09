import {
  AcademyArticle,
  AcademyLinkTarget,
  AcademySearchEntry,
  GlossaryTerm,
  listPublishedAcademyArticles,
} from "../domain";
import { AcademyRepository } from "./academy.ports";

export type AcademyResolvedTarget =
  | {
      readonly type: "article";
      readonly article: AcademyArticle;
      readonly sectionId: string | null;
    }
  | {
      readonly type: "glossary";
      readonly term: GlossaryTerm;
    }
  | {
      readonly type: "calculator";
      readonly slug: string;
    }
  | {
      readonly type: "app-context";
      readonly target: string;
    };

export function listPublishedAcademyArticlesUseCase(
  repository: AcademyRepository,
): readonly AcademyArticle[] {
  return listPublishedAcademyArticles(repository.listArticles());
}

export function getAcademyArticleBySlug(
  repository: AcademyRepository,
  slug: string,
): AcademyArticle | null {
  const normalizedSlug = normalizeQueryToken(slug);

  if (!normalizedSlug) {
    return null;
  }

  return repository.getArticleBySlug(normalizedSlug);
}

export function getAcademyGlossaryTermBySlug(
  repository: AcademyRepository,
  slug: string,
): GlossaryTerm | null {
  const normalizedSlug = normalizeQueryToken(slug);

  if (!normalizedSlug) {
    return null;
  }

  return repository.getGlossaryTermBySlug(normalizedSlug);
}

export function listAcademyGlossaryTermsUseCase(
  repository: AcademyRepository,
  query = "",
): readonly GlossaryTerm[] {
  const normalizedQuery = normalizeQueryToken(query);
  const matchScoreBySlug = new Map<string, number>();

  return repository
    .listGlossaryTerms()
    .filter((term) =>
      normalizedQuery ? doesGlossaryTermMatch(term, normalizedQuery) : true,
    )
    .slice()
    .sort((left, right) =>
      compareGlossaryTermsForPresentation(
        left,
        right,
        normalizedQuery,
        matchScoreBySlug,
      ),
    );
}

export function searchAcademy(
  repository: AcademyRepository,
  query: string,
): readonly AcademySearchEntry[] {
  const normalizedQuery = normalizeQueryToken(query);

  if (!normalizedQuery) {
    return [];
  }

  return [
    ...searchArticles(repository.listArticles(), normalizedQuery),
    ...searchGlossary(repository.listGlossaryTerms(), normalizedQuery),
  ];
}

export function resolveAcademyLinkTarget(
  repository: AcademyRepository,
  target: AcademyLinkTarget,
): AcademyResolvedTarget | null {
  switch (target.type) {
    case "article": {
      const article = repository.getArticleBySlug(target.slug);

      return article
        ? {
            type: "article",
            article,
            sectionId: target.sectionId ?? null,
          }
        : null;
    }
    case "glossary": {
      const term = repository.getGlossaryTermBySlug(target.slug);

      return term ? { type: "glossary", term } : null;
    }
    case "calculator":
      return repository.listCalculatorSlugs().includes(target.slug)
        ? { type: "calculator", slug: target.slug }
        : null;
    case "app-context":
      return { type: "app-context", target: target.target };
  }
}

function searchArticles(
  articles: readonly AcademyArticle[],
  normalizedQuery: string,
): readonly AcademySearchEntry[] {
  return listPublishedAcademyArticles(articles)
    .filter((article) =>
      [
        article.metadata.title,
        article.metadata.summary,
        article.slug,
        ...article.metadata.tags,
        ...article.metadata.teaches,
      ].some((value) => normalizeSearchValue(value).includes(normalizedQuery)),
    )
    .map((article) => ({
      id: `article:${article.slug}`,
      kind: "article",
      title: article.metadata.title,
      summary: article.metadata.summary,
      target: {
        type: "article",
        slug: article.slug,
      },
      keywords: [
        article.slug,
        ...article.metadata.tags,
        ...article.metadata.teaches,
      ],
    }));
}

function searchGlossary(
  terms: readonly GlossaryTerm[],
  normalizedQuery: string,
): readonly AcademySearchEntry[] {
  return terms
    .filter((term) => doesGlossaryTermMatch(term, normalizedQuery))
    .map((term) => ({
      id: `glossary:${term.slug}`,
      kind: "glossary",
      title: term.label,
      summary: term.shortDefinition,
      target: {
        type: "glossary",
        slug: term.slug,
      },
      keywords: [term.slug, term.label, ...term.aliases],
    }));
}

function doesGlossaryTermMatch(
  term: GlossaryTerm,
  normalizedQuery: string,
): boolean {
  return [
    term.slug,
    term.label,
    term.shortDefinition,
    term.detailedDefinition,
    ...term.aliases,
    ...term.relatedTerms,
  ].some((value) => normalizeSearchValue(value).includes(normalizedQuery));
}

function compareGlossaryTermsForPresentation(
  left: GlossaryTerm,
  right: GlossaryTerm,
  normalizedQuery: string,
  matchScoreBySlug: Map<string, number>,
): number {
  if (normalizedQuery) {
    const leftScore = getCachedGlossaryTermMatchScore(
      left,
      normalizedQuery,
      matchScoreBySlug,
    );
    const rightScore = getCachedGlossaryTermMatchScore(
      right,
      normalizedQuery,
      matchScoreBySlug,
    );

    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }
  }

  return left.label.localeCompare(right.label, "fr", { sensitivity: "base" });
}

function getCachedGlossaryTermMatchScore(
  term: GlossaryTerm,
  normalizedQuery: string,
  matchScoreBySlug: Map<string, number>,
): number {
  const cachedScore = matchScoreBySlug.get(term.slug);

  if (typeof cachedScore === "number") {
    return cachedScore;
  }

  const score = getGlossaryTermMatchScore(term, normalizedQuery);
  matchScoreBySlug.set(term.slug, score);
  return score;
}

function getGlossaryTermMatchScore(
  term: GlossaryTerm,
  normalizedQuery: string,
): number {
  const slug = normalizeSearchValue(term.slug);
  const label = normalizeSearchValue(term.label);
  const aliases = term.aliases.map(normalizeSearchValue);
  const definitions = [
    normalizeSearchValue(term.shortDefinition),
    normalizeSearchValue(term.detailedDefinition),
  ];
  const relatedTerms = term.relatedTerms.map(normalizeSearchValue);

  if (slug === normalizedQuery || label === normalizedQuery) {
    return 0;
  }

  if (
    slug.startsWith(normalizedQuery) ||
    label.startsWith(normalizedQuery) ||
    aliases.some((alias) => alias === normalizedQuery)
  ) {
    return 1;
  }

  if (aliases.some((alias) => alias.includes(normalizedQuery))) {
    return 2;
  }

  if (definitions.some((definition) => definition.includes(normalizedQuery))) {
    return 3;
  }

  if (
    relatedTerms.some((relatedTerm) => relatedTerm.includes(normalizedQuery))
  ) {
    return 4;
  }

  return 5;
}

function normalizeQueryToken(value: string): string {
  return normalizeSearchValue(value).trim();
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}
