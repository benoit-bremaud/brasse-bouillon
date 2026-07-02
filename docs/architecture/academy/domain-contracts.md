# Brewing Academy Domain Contracts

## Scope

This document describes the expected TypeScript contracts. Names may be adjusted
to match project conventions during implementation, but the responsibilities
should remain stable.

## Contract Rules

- Domain contracts must not import React Native, Expo Router, Markdown parser
  types, or generated file paths.
- Use named exports only.
- Do not use `any`.
- Prefer discriminated unions for content blocks.
- Use literal unions for stable enums where practical.
- Keep runtime validation schemas aligned with these contracts.

## Core Types

```ts
export type AcademyArticleStatus =
  | 'draft'
  | 'review'
  | 'published'
  | 'deprecated';

export type AcademyLevel = 'beginner' | 'intermediate' | 'advanced';

export type AcademyCategory =
  | 'getting-started'
  | 'ingredients'
  | 'process'
  | 'fermentation'
  | 'water'
  | 'equipment'
  | 'beer-styles'
  | 'safety'
  | 'troubleshooting'
  | 'glossary';
```

## Article Metadata

```ts
export type AcademyReviewConfidence = 'draft' | 'reviewed' | 'validated';

export interface AcademyReviewMetadata {
  readonly confidenceLevel: AcademyReviewConfidence;
  readonly reviewedBy: string | null;
  readonly reviewedAt: string | null;
  readonly notes: readonly string[];
}

export interface AcademyArticleMetadata {
  readonly title: string;
  readonly summary: string;
  readonly category: AcademyCategory;
  readonly level: AcademyLevel;
  readonly status: AcademyArticleStatus;
  readonly version: string;
  readonly estimatedReadTimeMinutes: number;
  readonly tags: readonly string[];
  readonly updatedAt: string;
  readonly relatedArticles: readonly string[];
  readonly relatedGlossaryTerms: readonly string[];
  readonly relatedCalculators: readonly CalculatorLink[];
  readonly learningObjectives: readonly string[];
  readonly prerequisites: readonly string[];
  readonly teaches: readonly string[];
  readonly sensitive: boolean;
  readonly riskTopics: readonly string[];
  readonly sources: readonly SourceReference[];
  readonly review: AcademyReviewMetadata;
}
```

## Article Body

```ts
export interface AcademyArticle {
  readonly slug: string;
  readonly metadata: AcademyArticleMetadata;
  readonly body: AcademyArticleBody;
}

export interface AcademyArticleBody {
  readonly sections: readonly AcademySection[];
}

export interface AcademySection {
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly AcademyContentBlock[];
}
```

## Content Blocks

```ts
export type AcademyContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | BulletListBlock
  | TableBlock
  | FormulaBlock
  | CalloutBlock
  | DiagramBlock
  | GlossaryReferenceBlock
  | CalculatorCtaBlock
  | RelatedArticleBlock
  | SourceReferenceBlock;
```

Each block must include:

- `id`: stable within an article;
- `type`: discriminant;
- enough data to render without parsing raw Markdown at runtime.

```ts
export interface BaseContentBlock {
  readonly id: string;
  readonly sourceIds: readonly string[];
}

export interface ParagraphBlock extends BaseContentBlock {
  readonly type: 'paragraph';
  readonly text: string;
}

export interface HeadingBlock extends BaseContentBlock {
  readonly type: 'heading';
  readonly level: 2 | 3 | 4;
  readonly text: string;
}

export interface BulletListBlock extends BaseContentBlock {
  readonly type: 'bulletList';
  readonly items: readonly string[];
}

export interface TableBlock extends BaseContentBlock {
  readonly type: 'table';
  readonly caption: string | null;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export interface FormulaBlock extends BaseContentBlock {
  readonly type: 'formula';
  readonly label: string;
  readonly expression: string;
  readonly variables: readonly FormulaVariable[];
}

export interface FormulaVariable {
  readonly symbol: string;
  readonly label: string;
  readonly unit: string | null;
}

export type CalloutTone = 'info' | 'tip' | 'warning' | 'safety' | 'technical';

export interface CalloutBlock extends BaseContentBlock {
  readonly type: 'callout';
  readonly tone: CalloutTone;
  readonly title: string;
  readonly body: string;
}

export interface DiagramBlock extends BaseContentBlock {
  readonly type: 'diagram';
  readonly title: string;
  readonly description: string;
  readonly accessibilityLabel: string;
  readonly assetKey: string | null;
}

export interface GlossaryReferenceBlock extends BaseContentBlock {
  readonly type: 'glossaryReference';
  readonly termSlug: string;
  readonly label: string;
}

export interface CalculatorCtaBlock extends BaseContentBlock {
  readonly type: 'calculatorCta';
  readonly calculatorSlug: string;
  readonly title: string;
  readonly description: string;
}

export interface RelatedArticleBlock extends BaseContentBlock {
  readonly type: 'relatedArticle';
  readonly articleSlug: string;
  readonly sectionId: string | null;
}

export interface SourceReferenceBlock extends BaseContentBlock {
  readonly type: 'sourceReference';
  readonly sourceId: string;
  readonly note: string | null;
}
```

## Glossary

```ts
export interface GlossaryTerm {
  readonly slug: string;
  readonly label: string;
  readonly aliases: readonly string[];
  readonly shortDefinition: string;
  readonly detailedDefinition: string;
  readonly relatedTerms: readonly string[];
  readonly sources: readonly SourceReference[];
}
```

## Sources

```ts
export type SourceKind =
  | 'book'
  | 'standard'
  | 'article'
  | 'website'
  | 'course'
  | 'manufacturer-documentation';

export interface SourceReference {
  readonly id: string;
  readonly kind: SourceKind;
  readonly title: string;
  readonly authors: readonly string[];
  readonly publisher: string | null;
  readonly url: string | null;
  readonly accessedAt: string | null;
  readonly year: number | null;
  readonly notes: string | null;
}
```

## Links

```ts
export interface CalculatorLink {
  readonly slug: string;
  readonly label: string;
  readonly reason: string;
  readonly target: Extract<AcademyLinkTarget, { readonly type: 'calculator' }>;
}

export type AcademyLinkTarget =
  | { readonly type: 'article'; readonly slug: string; readonly sectionId?: string }
  | { readonly type: 'glossary'; readonly slug: string }
  | { readonly type: 'calculator'; readonly slug: string }
  | { readonly type: 'app-context'; readonly target: string };
```

Routes are not part of the domain object. The application layer resolves link
targets into navigation actions.

## Search

```ts
export type AcademySearchResultKind =
  | 'article'
  | 'section'
  | 'glossary'
  | 'faq'
  | 'calculator';

export interface AcademySearchEntry {
  readonly id: string;
  readonly kind: AcademySearchResultKind;
  readonly title: string;
  readonly excerpt: string;
  readonly target: AcademyLinkTarget;
  readonly keywords: readonly string[];
  readonly level: AcademyLevel | null;
  readonly category: AcademyCategory | null;
}
```

## Future Retrieval

```ts
export interface RetrievalChunk {
  readonly id: string;
  readonly articleSlug: string;
  readonly sectionId: string;
  readonly text: string;
  readonly sourceIds: readonly string[];
  readonly glossaryTermSlugs: readonly string[];
  readonly sensitive: boolean;
}
```

Retrieval chunks are generated artifacts for a future chatbot. They are not a
V1 runtime dependency unless explicitly added later.
