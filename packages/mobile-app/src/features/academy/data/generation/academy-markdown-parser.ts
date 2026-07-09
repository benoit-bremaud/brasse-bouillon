import { parse as parseYaml } from "yaml";

import {
  AcademyArticleStatus,
  AcademyCategory,
  AcademyContentBlock,
  AcademyLevel,
  AcademyReviewConfidence,
  SourceKind,
} from "../../domain";
import {
  AcademySourceArticle,
  AcademySourceArticleFrontMatter,
  AcademySourceGlossaryTerm,
  AcademySourceReference,
  AcademySourceSection,
} from "../source";

export interface AcademyParseResult<TValue> {
  readonly value: TValue | null;
  readonly errors: readonly string[];
}

interface MarkdownDirective {
  readonly type: string;
  readonly attributes: Readonly<Record<string, string>>;
}

const FRONT_MATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const HEADING_PATTERN = /^##\s+(.+?)\s+\{#([a-z0-9]+(?:-[a-z0-9]+)*)\}$/;
const DIRECTIVE_PATTERN = /^:::(\w+)\s*(.*?):::$/;
const ATTRIBUTE_PATTERN_SOURCE = String.raw`(\w+)="([^"]*)"`;

export function parseAcademyMarkdownArticle(
  filePath: string,
  markdown: string,
): AcademyParseResult<AcademySourceArticle> {
  const frontMatterMatch = markdown.match(FRONT_MATTER_PATTERN);

  if (!frontMatterMatch) {
    return {
      value: null,
      errors: [`${filePath}: missing YAML front matter.`],
    };
  }

  const frontMatter = parseYaml(frontMatterMatch[1]) as unknown;
  const frontMatterRecord = asRecord(frontMatter);
  const body = markdown.slice(frontMatterMatch[0].length);
  const bodyStartLine = frontMatterMatch[0].split(/\r?\n/).length;
  const slug = requireString(frontMatterRecord, "slug");

  if (!slug) {
    return {
      value: null,
      errors: [`${filePath}: front matter field "slug" is required.`],
    };
  }

  const sectionResult = parseSections(filePath, body, bodyStartLine);
  const typedFrontMatterResult = toArticleFrontMatter(frontMatter);
  const errors = [...typedFrontMatterResult.errors, ...sectionResult.errors];

  if (!typedFrontMatterResult.value || !sectionResult.value) {
    return {
      value: null,
      errors,
    };
  }

  return {
    value: {
      filePath,
      slug,
      frontMatter: typedFrontMatterResult.value,
      sections: sectionResult.value,
    },
    errors,
  };
}

export function parseAcademySourcesYaml(
  filePath: string,
  yamlContent: string,
): AcademyParseResult<readonly AcademySourceReference[]> {
  const parsed = parseYaml(yamlContent) as unknown;

  if (!Array.isArray(parsed)) {
    return {
      value: null,
      errors: [`${filePath}: source registry must be a YAML array.`],
    };
  }

  return {
    value: parsed.map((entry) => toSourceReference(entry)),
    errors: [],
  };
}

export function parseAcademyGlossaryYaml(
  filePath: string,
  yamlContent: string,
): AcademyParseResult<readonly AcademySourceGlossaryTerm[]> {
  const parsed = parseYaml(yamlContent) as unknown;

  if (!Array.isArray(parsed)) {
    return {
      value: null,
      errors: [`${filePath}: glossary registry must be a YAML array.`],
    };
  }

  return {
    value: parsed.map((entry) => toGlossaryTerm(entry)),
    errors: [],
  };
}

function parseSections(
  filePath: string,
  body: string,
  bodyStartLine: number,
): AcademyParseResult<readonly AcademySourceSection[]> {
  const sections: AcademySourceSection[] = [];
  const errors: string[] = [];
  let currentSection: MutableSection | null = null;
  let paragraphLines: string[] = [];

  body.split(/\r?\n/).forEach((line, lineIndex) => {
    const headingMatch = line.match(HEADING_PATTERN);
    const directive = parseDirective(line);

    if (headingMatch) {
      flushParagraph(currentSection, paragraphLines);
      paragraphLines = [];
      currentSection = {
        id: headingMatch[2],
        title: headingMatch[1],
        blocks: [],
      };
      sections.push(currentSection);
      return;
    }

    if (directive) {
      flushParagraph(currentSection, paragraphLines);
      paragraphLines = [];

      if (!currentSection) {
        errors.push(
          `${filePath}:${bodyStartLine + lineIndex}: directive before section.`,
        );
        return;
      }

      const block = toDirectiveBlock(
        directive,
        filePath,
        bodyStartLine + lineIndex,
        errors,
      );

      if (block) {
        currentSection.blocks.push(block);
      }
      return;
    }

    if (line.trim().length === 0) {
      flushParagraph(currentSection, paragraphLines);
      paragraphLines = [];
      return;
    }

    paragraphLines.push(line.trim());
  });

  flushParagraph(currentSection, paragraphLines);

  return {
    value: errors.length > 0 ? null : sections,
    errors,
  };
}

function flushParagraph(
  section: MutableSection | null,
  paragraphLines: readonly string[],
) {
  if (!section || paragraphLines.length === 0) {
    return;
  }

  section.blocks.push({
    id: `${section.id}-paragraph-${section.blocks.length + 1}`,
    type: "paragraph",
    text: paragraphLines.join(" "),
    sourceIds: [],
  });
}

function parseDirective(line: string): MarkdownDirective | null {
  const match = line.match(DIRECTIVE_PATTERN);

  if (!match) {
    return null;
  }

  const attributes: Record<string, string> = {};
  const rawAttributes = match[2];
  const attributePattern = new RegExp(ATTRIBUTE_PATTERN_SOURCE, "g");
  let attributeMatch = attributePattern.exec(rawAttributes);

  while (attributeMatch) {
    attributes[attributeMatch[1]] = attributeMatch[2];
    attributeMatch = attributePattern.exec(rawAttributes);
  }

  return {
    type: match[1],
    attributes,
  };
}

function toDirectiveBlock(
  directive: MarkdownDirective,
  filePath: string,
  lineNumber: number,
  errors: string[],
): AcademyContentBlock | null {
  switch (directive.type) {
    case "definition":
      return {
        id: requireDirectiveAttribute(
          directive,
          "id",
          filePath,
          lineNumber,
          errors,
        ),
        type: "definition",
        term: requireDirectiveAttribute(
          directive,
          "term",
          filePath,
          lineNumber,
          errors,
        ),
        definition: requireDirectiveAttribute(
          directive,
          "definition",
          filePath,
          lineNumber,
          errors,
        ),
        sourceIds: parseSourceIds(directive.attributes.sourceIds),
      };
    case "example":
      return {
        id: requireDirectiveAttribute(
          directive,
          "id",
          filePath,
          lineNumber,
          errors,
        ),
        type: "example",
        title: requireDirectiveAttribute(
          directive,
          "title",
          filePath,
          lineNumber,
          errors,
        ),
        body: requireDirectiveAttribute(
          directive,
          "body",
          filePath,
          lineNumber,
          errors,
        ),
        sourceIds: parseSourceIds(directive.attributes.sourceIds),
      };
    case "glossaryReference":
      return {
        id: requireDirectiveAttribute(
          directive,
          "id",
          filePath,
          lineNumber,
          errors,
        ),
        type: "glossaryReference",
        termSlug: requireDirectiveAttribute(
          directive,
          "termSlug",
          filePath,
          lineNumber,
          errors,
        ),
        label: requireDirectiveAttribute(
          directive,
          "label",
          filePath,
          lineNumber,
          errors,
        ),
        sourceIds: parseSourceIds(directive.attributes.sourceIds),
      };
    case "calculatorCta":
      return {
        id: requireDirectiveAttribute(
          directive,
          "id",
          filePath,
          lineNumber,
          errors,
        ),
        type: "calculatorCta",
        calculatorSlug: requireDirectiveAttribute(
          directive,
          "calculatorSlug",
          filePath,
          lineNumber,
          errors,
        ),
        title: requireDirectiveAttribute(
          directive,
          "title",
          filePath,
          lineNumber,
          errors,
        ),
        description: requireDirectiveAttribute(
          directive,
          "description",
          filePath,
          lineNumber,
          errors,
        ),
        sourceIds: parseSourceIds(directive.attributes.sourceIds),
      };
    case "relatedArticle":
      return {
        id: requireDirectiveAttribute(
          directive,
          "id",
          filePath,
          lineNumber,
          errors,
        ),
        type: "relatedArticle",
        articleSlug: requireDirectiveAttribute(
          directive,
          "articleSlug",
          filePath,
          lineNumber,
          errors,
        ),
        sectionId: directive.attributes.sectionId ?? null,
        sourceIds: parseSourceIds(directive.attributes.sourceIds),
      };
    default:
      errors.push(
        `${filePath}:${lineNumber}: unsupported Academy directive "${directive.type}".`,
      );
      return null;
  }
}

function toArticleFrontMatter(
  value: unknown,
): AcademyParseResult<AcademySourceArticleFrontMatter> {
  const record = asRecord(value);
  const review = record.review === null ? null : asRecord(record.review);

  return {
    value: {
      title: requireString(record, "title"),
      summary: requireString(record, "summary"),
      category: requireString(record, "category") as AcademyCategory,
      level: requireString(record, "level") as AcademyLevel,
      status: requireString(record, "status") as AcademyArticleStatus,
      version: String(record.version ?? ""),
      estimated_read_time_minutes: requireNumber(
        record,
        "estimated_read_time_minutes",
      ),
      tags: requireStringArray(record, "tags"),
      updated_at: requireDateString(record, "updated_at"),
      related_articles: requireStringArray(record, "related_articles"),
      related_glossary_terms: requireStringArray(
        record,
        "related_glossary_terms",
      ),
      related_calculators: requireRecordArray(
        record,
        "related_calculators",
      ).map((link) => ({
        slug: requireString(link, "slug"),
        label: requireString(link, "label"),
        reason: requireString(link, "reason"),
        target_slug: requireString(link, "target_slug"),
      })),
      learning_objectives: requireStringArray(record, "learning_objectives"),
      prerequisites: requireStringArray(record, "prerequisites"),
      teaches: requireStringArray(record, "teaches"),
      sensitive: requireBoolean(record, "sensitive"),
      risk_topics: requireStringArray(record, "risk_topics"),
      source_ids: requireStringArray(record, "source_ids"),
      review: review
        ? {
            confidence_level: requireString(
              review,
              "confidence_level",
            ) as AcademyReviewConfidence,
            reviewed_by: nullableString(review.reviewed_by),
            reviewed_at: nullableDateString(review.reviewed_at),
            notes: requireStringArray(review, "notes"),
          }
        : null,
    },
    errors: [],
  };
}

function toSourceReference(value: unknown): AcademySourceReference {
  const record = asRecord(value);

  return {
    id: requireString(record, "id"),
    kind: requireString(record, "kind") as SourceKind,
    title: requireString(record, "title"),
    authors: requireStringArray(record, "authors"),
    publisher: nullableString(record.publisher),
    url: nullableString(record.url),
    accessed_at: nullableDateString(record.accessed_at),
    year: nullableNumber(record.year),
    notes: nullableString(record.notes),
  };
}

function toGlossaryTerm(value: unknown): AcademySourceGlossaryTerm {
  const record = asRecord(value);

  return {
    slug: requireString(record, "slug"),
    label: requireString(record, "label"),
    aliases: requireStringArray(record, "aliases"),
    short_definition: requireString(record, "short_definition"),
    detailed_definition: requireString(record, "detailed_definition"),
    related_terms: requireStringArray(record, "related_terms"),
    source_ids: requireStringArray(record, "source_ids"),
  };
}

function requireDirectiveAttribute(
  directive: MarkdownDirective,
  name: string,
  filePath: string,
  lineNumber: number,
  errors: string[],
): string {
  const value = directive.attributes[name];

  if (!value) {
    errors.push(
      `${filePath}:${lineNumber}: directive "${directive.type}" misses "${name}".`,
    );
    return "";
  }

  return value;
}

function parseSourceIds(value: string | undefined): readonly string[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((sourceId) => sourceId.trim())
    .filter(Boolean);
}

function asRecord(value: unknown): Readonly<Record<string, unknown>> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Readonly<Record<string, unknown>>;
}

function requireString(
  record: Readonly<Record<string, unknown>>,
  key: string,
): string {
  const value = record[key];

  return typeof value === "string" ? value : "";
}

function requireNumber(
  record: Readonly<Record<string, unknown>>,
  key: string,
): number {
  const value = record[key];

  return typeof value === "number" ? value : 0;
}

function requireBoolean(
  record: Readonly<Record<string, unknown>>,
  key: string,
): boolean {
  return record[key] === true;
}

function requireStringArray(
  record: Readonly<Record<string, unknown>>,
  key: string,
): readonly string[] {
  const value = record[key];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function requireRecordArray(
  record: Readonly<Record<string, unknown>>,
  key: string,
): readonly Readonly<Record<string, unknown>>[] {
  const value = record[key];

  return Array.isArray(value) ? value.map(asRecord) : [];
}

function requireDateString(
  record: Readonly<Record<string, unknown>>,
  key: string,
): string {
  return nullableDateString(record[key]) ?? "";
}

function nullableDateString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return typeof value === "string" ? value : null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

type MutableSection = {
  id: string;
  title: string;
  blocks: AcademyContentBlock[];
};
