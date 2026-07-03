import {
  AcademyArticle,
  AcademyCorpus,
  AcademyValidationIssue,
  AcademyValidationResult,
  GlossaryTerm,
  SourceReference,
  validateAcademyCorpus,
} from "../../domain";
import {
  AcademySourceArticle,
  AcademySourceCorpus,
  AcademySourceGlossaryTerm,
  AcademySourceReference,
} from "./academy-source.types";

export interface AcademySourceValidationResult extends AcademyValidationResult {
  readonly corpus: AcademyCorpus | null;
}

export function validateAcademySourceCorpus(
  sourceCorpus: AcademySourceCorpus,
): AcademySourceValidationResult {
  const issues: AcademyValidationIssue[] = [];
  const sourceRegistry = new Map(
    sourceCorpus.sources.map((source) => [
      source.id,
      toSourceReference(source),
    ]),
  );

  const corpus: AcademyCorpus = {
    articles: sourceCorpus.articles.map((article, index) =>
      toAcademyArticle(article, index, sourceRegistry, issues),
    ),
    glossaryTerms: sourceCorpus.glossaryTerms.map((term, index) =>
      toGlossaryTerm(term, index, sourceRegistry, issues),
    ),
    sources: sourceCorpus.sources.map(toSourceReference),
    calculatorSlugs: sourceCorpus.calculatorSlugs,
  };
  const corpusValidation = validateAcademyCorpus(corpus);
  const allIssues = [...issues, ...corpusValidation.issues];

  return {
    valid: allIssues.every((issue) => issue.severity !== "error"),
    issues: allIssues,
    corpus: allIssues.some((issue) => issue.severity === "error")
      ? null
      : corpus,
  };
}

function toAcademyArticle(
  article: AcademySourceArticle,
  articleIndex: number,
  sourceRegistry: ReadonlyMap<string, SourceReference>,
  issues: AcademyValidationIssue[],
): AcademyArticle {
  validateArticleSlugMatchesFilePath(article, articleIndex, issues);

  return {
    slug: article.slug,
    metadata: {
      title: article.frontMatter.title,
      summary: article.frontMatter.summary,
      category: article.frontMatter.category,
      level: article.frontMatter.level,
      status: article.frontMatter.status,
      version: article.frontMatter.version,
      estimatedReadTimeMinutes: article.frontMatter.estimated_read_time_minutes,
      tags: article.frontMatter.tags,
      updatedAt: article.frontMatter.updated_at,
      relatedArticles: article.frontMatter.related_articles,
      relatedGlossaryTerms: article.frontMatter.related_glossary_terms,
      relatedCalculators: article.frontMatter.related_calculators.map(
        (link) => ({
          slug: link.slug,
          label: link.label,
          reason: link.reason,
          target: {
            type: "calculator",
            slug: link.target_slug,
          },
        }),
      ),
      learningObjectives: article.frontMatter.learning_objectives,
      prerequisites: article.frontMatter.prerequisites,
      teaches: article.frontMatter.teaches,
      sensitive: article.frontMatter.sensitive,
      riskTopics: article.frontMatter.risk_topics,
      sources: hydrateSources(
        article.frontMatter.source_ids,
        `articles.${articleIndex}.frontMatter.source_ids`,
        sourceRegistry,
        issues,
      ),
      review: article.frontMatter.review
        ? {
            confidenceLevel: article.frontMatter.review.confidence_level,
            reviewedBy: article.frontMatter.review.reviewed_by,
            reviewedAt: article.frontMatter.review.reviewed_at,
            notes: article.frontMatter.review.notes,
          }
        : null,
    },
    body: {
      sections: article.sections,
    },
  };
}

function validateArticleSlugMatchesFilePath(
  article: AcademySourceArticle,
  articleIndex: number,
  issues: AcademyValidationIssue[],
) {
  const fileSlug = getMarkdownFileSlug(article.filePath);

  if (fileSlug && fileSlug !== article.slug) {
    issues.push({
      severity: "error",
      code: "academySource.articleSlug.filePathMismatch",
      path: `articles.${articleIndex}.slug`,
      message: "Editorial article slug must match its Markdown file name.",
    });
  }
}

function toGlossaryTerm(
  term: AcademySourceGlossaryTerm,
  termIndex: number,
  sourceRegistry: ReadonlyMap<string, SourceReference>,
  issues: AcademyValidationIssue[],
): GlossaryTerm {
  return {
    slug: term.slug,
    label: term.label,
    aliases: term.aliases,
    shortDefinition: term.short_definition,
    detailedDefinition: term.detailed_definition,
    relatedTerms: term.related_terms,
    sources: hydrateSources(
      term.source_ids,
      `glossaryTerms.${termIndex}.source_ids`,
      sourceRegistry,
      issues,
    ),
  };
}

function hydrateSources(
  sourceIds: readonly string[],
  path: string,
  sourceRegistry: ReadonlyMap<string, SourceReference>,
  issues: AcademyValidationIssue[],
): readonly SourceReference[] {
  return sourceIds.flatMap((sourceId, index) => {
    const source = sourceRegistry.get(sourceId);

    if (!source) {
      issues.push({
        severity: "error",
        code: "academySource.source.unknown",
        path: `${path}.${index}`,
        message: "Editorial source id is not known in the source registry.",
      });
      return [];
    }

    return [source];
  });
}

function toSourceReference(source: AcademySourceReference): SourceReference {
  return {
    id: source.id,
    kind: source.kind,
    title: source.title,
    authors: source.authors,
    publisher: source.publisher,
    url: source.url,
    accessedAt: source.accessed_at,
    year: source.year,
    notes: source.notes,
  };
}

function getMarkdownFileSlug(filePath: string): string | null {
  const fileName = filePath.split("/").at(-1);

  if (!fileName?.endsWith(".md")) {
    return null;
  }

  return fileName.slice(0, -".md".length);
}
