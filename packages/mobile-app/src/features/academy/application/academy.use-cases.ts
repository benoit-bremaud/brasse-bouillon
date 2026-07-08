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
): readonly GlossaryTerm[] {
  return [...repository.listGlossaryTerms()].sort((left, right) =>
    left.label.localeCompare(right.label, "fr", { sensitivity: "base" }),
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
    .filter((term) =>
      [
        term.slug,
        term.label,
        term.shortDefinition,
        term.detailedDefinition,
        ...term.aliases,
      ].some((value) => normalizeSearchValue(value).includes(normalizedQuery)),
    )
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

function normalizeQueryToken(value: string): string {
  return normalizeSearchValue(value).trim();
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
}
