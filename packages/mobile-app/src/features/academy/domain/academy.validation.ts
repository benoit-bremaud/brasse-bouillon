import {
  AcademyArticle,
  AcademyCorpus,
  AcademyContentBlock,
  GlossaryTerm,
  SourceReference,
} from "./academy.types";

export type AcademyValidationSeverity = "error" | "warning";

export interface AcademyValidationIssue {
  readonly severity: AcademyValidationSeverity;
  readonly code: string;
  readonly path: string;
  readonly message: string;
}

export interface AcademyValidationResult {
  readonly valid: boolean;
  readonly issues: readonly AcademyValidationIssue[];
}

export interface AcademyValidationContext {
  readonly knownArticleSlugs: ReadonlySet<string>;
  readonly knownArticleSectionIds: ReadonlyMap<string, ReadonlySet<string>>;
  readonly knownGlossarySlugs: ReadonlySet<string>;
  readonly knownCalculatorSlugs: ReadonlySet<string>;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SECTION_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SOURCE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9-]*[a-z0-9])?$/;

export function validateAcademyArticle(
  article: AcademyArticle,
  context: AcademyValidationContext,
): AcademyValidationResult {
  const issues: AcademyValidationIssue[] = [];
  const articleSourceIds = new Set(
    article.metadata.sources.map((source) => source.id),
  );

  requireText(article.slug, "slug", "article.slug.required", issues);
  requirePattern(
    article.slug,
    SLUG_PATTERN,
    "slug",
    "article.slug.invalid",
    "Article slug must be lowercase kebab-case.",
    issues,
  );
  requireText(
    article.metadata.title,
    "metadata.title",
    "article.title.required",
    issues,
  );
  requireText(
    article.metadata.summary,
    "metadata.summary",
    "article.summary.required",
    issues,
  );
  requirePositiveInteger(
    article.metadata.estimatedReadTimeMinutes,
    "metadata.estimatedReadTimeMinutes",
    "article.readTime.invalid",
    issues,
  );
  requireIsoDate(
    article.metadata.updatedAt,
    "metadata.updatedAt",
    "article.updatedAt.invalid",
    issues,
  );

  if (article.metadata.learningObjectives.length === 0) {
    pushIssue(
      issues,
      "error",
      "article.learningObjectives.required",
      "metadata.learningObjectives",
      "Published Academy content needs at least one learning objective.",
    );
  }

  if (article.metadata.sensitive) {
    if (article.metadata.sources.length === 0) {
      pushIssue(
        issues,
        "error",
        "article.sensitive.sources.required",
        "metadata.sources",
        "Sensitive Academy content must declare at least one source.",
      );
    }

    if (article.metadata.status === "published" && !article.metadata.review) {
      pushIssue(
        issues,
        "error",
        "article.publishedSensitive.review.required",
        "metadata.review",
        "Published sensitive Academy content must include review metadata.",
      );
    }
  }

  if (
    article.metadata.status === "published" &&
    article.metadata.review?.confidenceLevel === "draft"
  ) {
    pushIssue(
      issues,
      "error",
      "article.published.reviewConfidence.invalid",
      "metadata.review.confidenceLevel",
      "Published Academy content cannot keep draft review confidence.",
    );
  }

  article.metadata.sources.forEach((source, index) =>
    validateSourceReference(source, `metadata.sources.${index}`, issues),
  );

  article.metadata.relatedArticles.forEach((slug, index) => {
    validateKnownSlug(
      slug,
      context.knownArticleSlugs,
      `metadata.relatedArticles.${index}`,
      "article.relatedArticle.unknown",
      "Related article slug is not known.",
      issues,
    );
  });

  article.metadata.relatedGlossaryTerms.forEach((slug, index) => {
    validateKnownSlug(
      slug,
      context.knownGlossarySlugs,
      `metadata.relatedGlossaryTerms.${index}`,
      "article.relatedGlossaryTerm.unknown",
      "Related glossary term slug is not known.",
      issues,
    );
  });

  article.metadata.relatedCalculators.forEach((link, index) => {
    validateKnownSlug(
      link.slug,
      context.knownCalculatorSlugs,
      `metadata.relatedCalculators.${index}.slug`,
      "article.relatedCalculator.unknown",
      "Related calculator slug is not known.",
      issues,
    );
    validateKnownSlug(
      link.target.slug,
      context.knownCalculatorSlugs,
      `metadata.relatedCalculators.${index}.target.slug`,
      "article.relatedCalculatorTarget.unknown",
      "Related calculator target slug is not known.",
      issues,
    );
  });

  if (article.body.sections.length === 0) {
    pushIssue(
      issues,
      "error",
      "article.sections.required",
      "body.sections",
      "Academy article must contain at least one section.",
    );
  }

  article.body.sections.forEach((section, sectionIndex) => {
    requireText(
      section.id,
      `body.sections.${sectionIndex}.id`,
      "article.section.id.required",
      issues,
    );
    requirePattern(
      section.id,
      SECTION_ID_PATTERN,
      `body.sections.${sectionIndex}.id`,
      "article.section.id.invalid",
      "Section id must be lowercase kebab-case.",
      issues,
    );
    requireText(
      section.title,
      `body.sections.${sectionIndex}.title`,
      "article.section.title.required",
      issues,
    );

    if (section.blocks.length === 0) {
      pushIssue(
        issues,
        "error",
        "article.section.blocks.required",
        `body.sections.${sectionIndex}.blocks`,
        "Academy section must contain at least one content block.",
      );
    }

    section.blocks.forEach((block, blockIndex) =>
      validateBlock(
        block,
        `body.sections.${sectionIndex}.blocks.${blockIndex}`,
        articleSourceIds,
        context,
        issues,
      ),
    );
  });

  return toResult(issues);
}

export function validateAcademyCorpus(
  corpus: AcademyCorpus,
): AcademyValidationResult {
  const issues: AcademyValidationIssue[] = [];
  const knownArticleSlugs = collectUniqueValues(
    corpus.articles.map((article) => article.slug),
    "articles",
    "corpus.articleSlug.duplicate",
    "Article slugs must be unique.",
    issues,
  );
  const knownGlossarySlugs = collectUniqueValues(
    corpus.glossaryTerms.map((term) => term.slug),
    "glossaryTerms",
    "corpus.glossarySlug.duplicate",
    "Glossary slugs must be unique.",
    issues,
  );
  const knownSourceIds = collectUniqueValues(
    corpus.sources.map((source) => source.id),
    "sources",
    "corpus.sourceId.duplicate",
    "Source ids must be unique.",
    issues,
  );
  const knownCalculatorSlugs = collectUniqueValues(
    corpus.calculatorSlugs,
    "calculatorSlugs",
    "corpus.calculatorSlug.duplicate",
    "Calculator slugs must be unique.",
    issues,
  );
  const knownArticleSectionIds = new Map(
    corpus.articles.map((article) => [
      article.slug,
      new Set(article.body.sections.map((section) => section.id)),
    ]),
  );
  const context: AcademyValidationContext = {
    knownArticleSlugs,
    knownArticleSectionIds,
    knownGlossarySlugs,
    knownCalculatorSlugs,
  };

  corpus.sources.forEach((source, index) =>
    validateSourceReference(source, `sources.${index}`, issues),
  );

  corpus.articles.forEach((article, index) => {
    validateAcademyArticle(article, context).issues.forEach((issue) =>
      issues.push({ ...issue, path: `articles.${index}.${issue.path}` }),
    );

    validateArticleSourceRegistryReferences(
      article,
      index,
      knownSourceIds,
      issues,
    );
    validateArticleStableIds(article, index, issues);
  });

  corpus.glossaryTerms.forEach((term, index) => {
    validateGlossaryTerm(term, knownSourceIds).issues.forEach((issue) =>
      issues.push({ ...issue, path: `glossaryTerms.${index}.${issue.path}` }),
    );
  });

  return toResult(issues);
}

export function validateGlossaryTerm(
  term: GlossaryTerm,
  knownSourceIds: ReadonlySet<string>,
): AcademyValidationResult {
  const issues: AcademyValidationIssue[] = [];

  requireText(term.slug, "slug", "glossary.slug.required", issues);
  requirePattern(
    term.slug,
    SLUG_PATTERN,
    "slug",
    "glossary.slug.invalid",
    "Glossary slug must be lowercase kebab-case.",
    issues,
  );
  requireText(term.label, "label", "glossary.label.required", issues);
  requireText(
    term.shortDefinition,
    "shortDefinition",
    "glossary.shortDefinition.required",
    issues,
  );
  requireText(
    term.detailedDefinition,
    "detailedDefinition",
    "glossary.detailedDefinition.required",
    issues,
  );

  term.sources.forEach((source, index) => {
    validateSourceReference(source, `sources.${index}`, issues);
    if (!knownSourceIds.has(source.id)) {
      pushIssue(
        issues,
        "error",
        "glossary.source.unknown",
        `sources.${index}.id`,
        "Glossary source id is not known in the source registry.",
      );
    }
  });

  return toResult(issues);
}

export function validatePublishedAcademyArticles(
  articles: readonly AcademyArticle[],
  context: AcademyValidationContext,
): AcademyValidationResult {
  const issues = articles.flatMap((article, index) =>
    validateAcademyArticle(article, context).issues.map((issue) => ({
      ...issue,
      path: `articles.${index}.${issue.path}`,
    })),
  );

  return toResult(issues);
}

function validateArticleSourceRegistryReferences(
  article: AcademyArticle,
  articleIndex: number,
  knownSourceIds: ReadonlySet<string>,
  issues: AcademyValidationIssue[],
) {
  article.metadata.sources.forEach((source, sourceIndex) => {
    if (!knownSourceIds.has(source.id)) {
      pushIssue(
        issues,
        "error",
        "article.source.registry.unknown",
        `articles.${articleIndex}.metadata.sources.${sourceIndex}.id`,
        "Article source id is not known in the corpus source registry.",
      );
    }
  });
}

function validateArticleStableIds(
  article: AcademyArticle,
  articleIndex: number,
  issues: AcademyValidationIssue[],
) {
  const sectionIds = new Set<string>();
  const blockIds = new Set<string>();

  article.body.sections.forEach((section, sectionIndex) => {
    if (sectionIds.has(section.id)) {
      pushIssue(
        issues,
        "error",
        "article.section.id.duplicate",
        `articles.${articleIndex}.body.sections.${sectionIndex}.id`,
        "Section ids must be unique within an article.",
      );
    }
    sectionIds.add(section.id);

    section.blocks.forEach((block, blockIndex) => {
      if (blockIds.has(block.id)) {
        pushIssue(
          issues,
          "error",
          "article.block.id.duplicate",
          `articles.${articleIndex}.body.sections.${sectionIndex}.blocks.${blockIndex}.id`,
          "Block ids must be unique within an article.",
        );
      }
      blockIds.add(block.id);
    });
  });
}

export function listPublishedAcademyArticles(
  articles: readonly AcademyArticle[],
): readonly AcademyArticle[] {
  return articles.filter((article) => article.metadata.status === "published");
}

function validateBlock(
  block: AcademyContentBlock,
  path: string,
  articleSourceIds: ReadonlySet<string>,
  context: AcademyValidationContext,
  issues: AcademyValidationIssue[],
) {
  requireText(block.id, `${path}.id`, "article.block.id.required", issues);

  block.sourceIds.forEach((sourceId, index) => {
    if (!articleSourceIds.has(sourceId)) {
      pushIssue(
        issues,
        "error",
        "article.block.source.unknown",
        `${path}.sourceIds.${index}`,
        "Content block references a source id missing from article metadata.",
      );
    }
  });

  switch (block.type) {
    case "paragraph":
      requireText(
        block.text,
        `${path}.text`,
        "article.block.text.required",
        issues,
      );
      break;
    case "definition":
      requireText(
        block.term,
        `${path}.term`,
        "article.block.definition.term.required",
        issues,
      );
      requireText(
        block.definition,
        `${path}.definition`,
        "article.block.definition.text.required",
        issues,
      );
      break;
    case "example":
      requireText(
        block.title,
        `${path}.title`,
        "article.block.example.title.required",
        issues,
      );
      requireText(
        block.body,
        `${path}.body`,
        "article.block.example.body.required",
        issues,
      );
      break;
    case "heading":
      requireText(
        block.text,
        `${path}.text`,
        "article.block.text.required",
        issues,
      );
      break;
    case "bulletList":
      if (block.items.length === 0) {
        pushIssue(
          issues,
          "error",
          "article.block.items.required",
          `${path}.items`,
          "Bullet list block must contain at least one item.",
        );
      }
      break;
    case "table":
      validateTableBlock(block, path, issues);
      break;
    case "formula":
      requireText(
        block.expression,
        `${path}.expression`,
        "article.block.formula.expression.required",
        issues,
      );
      break;
    case "callout":
      requireText(
        block.body,
        `${path}.body`,
        "article.block.body.required",
        issues,
      );
      break;
    case "diagram":
      requireText(
        block.accessibilityLabel,
        `${path}.accessibilityLabel`,
        "article.block.diagram.accessibilityLabel.required",
        issues,
      );
      break;
    case "glossaryReference":
      validateKnownSlug(
        block.termSlug,
        context.knownGlossarySlugs,
        `${path}.termSlug`,
        "article.block.glossary.unknown",
        "Glossary reference block points to an unknown term.",
        issues,
      );
      break;
    case "calculatorCta":
      validateKnownSlug(
        block.calculatorSlug,
        context.knownCalculatorSlugs,
        `${path}.calculatorSlug`,
        "article.block.calculator.unknown",
        "Calculator CTA block points to an unknown calculator.",
        issues,
      );
      break;
    case "relatedArticle":
      validateKnownSlug(
        block.articleSlug,
        context.knownArticleSlugs,
        `${path}.articleSlug`,
        "article.block.relatedArticle.unknown",
        "Related article block points to an unknown article.",
        issues,
      );
      validateKnownSectionId(
        block.articleSlug,
        block.sectionId,
        context.knownArticleSectionIds,
        `${path}.sectionId`,
        issues,
      );
      break;
    case "sourceReference":
      if (!articleSourceIds.has(block.sourceId)) {
        pushIssue(
          issues,
          "error",
          "article.block.sourceReference.unknown",
          `${path}.sourceId`,
          "Source reference block points to a source missing from article metadata.",
        );
      }
      break;
  }
}

function validateKnownSectionId(
  articleSlug: string,
  sectionId: string | null,
  knownArticleSectionIds: ReadonlyMap<string, ReadonlySet<string>>,
  path: string,
  issues: AcademyValidationIssue[],
) {
  if (!sectionId) {
    return;
  }

  requirePattern(
    sectionId,
    SECTION_ID_PATTERN,
    path,
    "article.block.relatedArticleSection.invalid",
    "Related article section id must be lowercase kebab-case.",
    issues,
  );

  const knownSectionIds = knownArticleSectionIds.get(articleSlug);

  if (knownSectionIds && !knownSectionIds.has(sectionId)) {
    pushIssue(
      issues,
      "error",
      "article.block.relatedArticleSection.unknown",
      path,
      "Related article block points to an unknown section.",
    );
  }
}

function validateTableBlock(
  block: Extract<AcademyContentBlock, { readonly type: "table" }>,
  path: string,
  issues: AcademyValidationIssue[],
) {
  if (block.columns.length === 0) {
    pushIssue(
      issues,
      "error",
      "article.block.table.columns.required",
      `${path}.columns`,
      "Table block must contain at least one column.",
    );
  }

  block.rows.forEach((row, index) => {
    if (row.length !== block.columns.length) {
      pushIssue(
        issues,
        "error",
        "article.block.table.rowSize.invalid",
        `${path}.rows.${index}`,
        "Table row size must match column count.",
      );
    }
  });
}

function validateSourceReference(
  source: SourceReference,
  path: string,
  issues: AcademyValidationIssue[],
) {
  requireText(source.id, `${path}.id`, "source.id.required", issues);
  requirePattern(
    source.id,
    SOURCE_ID_PATTERN,
    `${path}.id`,
    "source.id.invalid",
    "Source id must be lowercase and URL-safe.",
    issues,
  );
  requireText(source.title, `${path}.title`, "source.title.required", issues);

  if (source.url && !source.url.startsWith("https://")) {
    pushIssue(
      issues,
      "error",
      "source.url.invalid",
      `${path}.url`,
      "External source URL must use HTTPS.",
    );
  }

  if (source.accessedAt) {
    requireIsoDate(
      source.accessedAt,
      `${path}.accessedAt`,
      "source.accessedAt.invalid",
      issues,
    );
  }

  if (source.year !== null && (source.year < 1800 || source.year > 2100)) {
    pushIssue(
      issues,
      "error",
      "source.year.invalid",
      `${path}.year`,
      "Source year must be realistic.",
    );
  }
}

function validateKnownSlug(
  slug: string,
  knownSlugs: ReadonlySet<string>,
  path: string,
  code: string,
  message: string,
  issues: AcademyValidationIssue[],
) {
  requirePattern(slug, SLUG_PATTERN, path, `${code}.format`, message, issues);

  if (!knownSlugs.has(slug)) {
    pushIssue(issues, "error", code, path, message);
  }
}

function collectUniqueValues(
  values: readonly string[],
  path: string,
  duplicateCode: string,
  duplicateMessage: string,
  issues: AcademyValidationIssue[],
): ReadonlySet<string> {
  const knownValues = new Set<string>();

  values.forEach((value, index) => {
    if (knownValues.has(value)) {
      pushIssue(
        issues,
        "error",
        duplicateCode,
        `${path}.${index}`,
        duplicateMessage,
      );
    }
    knownValues.add(value);
  });

  return knownValues;
}

function requireText(
  value: string,
  path: string,
  code: string,
  issues: AcademyValidationIssue[],
) {
  if (value.trim().length === 0) {
    pushIssue(issues, "error", code, path, "Value is required.");
  }
}

function requirePattern(
  value: string,
  pattern: RegExp,
  path: string,
  code: string,
  message: string,
  issues: AcademyValidationIssue[],
) {
  if (!pattern.test(value)) {
    pushIssue(issues, "error", code, path, message);
  }
}

function requirePositiveInteger(
  value: number,
  path: string,
  code: string,
  issues: AcademyValidationIssue[],
) {
  if (!Number.isInteger(value) || value <= 0) {
    pushIssue(issues, "error", code, path, "Value must be a positive integer.");
  }
}

function requireIsoDate(
  value: string,
  path: string,
  code: string,
  issues: AcademyValidationIssue[],
) {
  if (Number.isNaN(Date.parse(value))) {
    pushIssue(issues, "error", code, path, "Value must be a valid ISO date.");
  }
}

function pushIssue(
  issues: AcademyValidationIssue[],
  severity: AcademyValidationSeverity,
  code: string,
  path: string,
  message: string,
) {
  issues.push({ severity, code, path, message });
}

function toResult(issues: readonly AcademyValidationIssue[]) {
  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}
