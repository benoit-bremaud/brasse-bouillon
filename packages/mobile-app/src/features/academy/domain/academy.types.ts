export type AcademyArticleStatus =
  | "draft"
  | "review"
  | "published"
  | "deprecated";

export type AcademyLevel = "beginner" | "intermediate" | "advanced";

export type AcademyCategory =
  | "getting-started"
  | "ingredients"
  | "process"
  | "fermentation"
  | "water"
  | "equipment"
  | "beer-styles"
  | "safety"
  | "troubleshooting"
  | "glossary";

export type AcademyReviewConfidence = "draft" | "reviewed" | "validated";

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
  readonly review: AcademyReviewMetadata | null;
}

export interface AcademyArticle {
  readonly slug: string;
  readonly metadata: AcademyArticleMetadata;
  readonly body: AcademyArticleBody;
}

export interface AcademyCorpus {
  readonly articles: readonly AcademyArticle[];
  readonly glossaryTerms: readonly GlossaryTerm[];
  readonly sources: readonly SourceReference[];
  readonly calculatorSlugs: readonly string[];
}

export interface AcademyArticleBody {
  readonly sections: readonly AcademySection[];
}

export interface AcademySection {
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly AcademyContentBlock[];
}

export type AcademyContentBlock =
  | ParagraphBlock
  | DefinitionBlock
  | ExampleBlock
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

export interface BaseContentBlock {
  readonly id: string;
  readonly sourceIds: readonly string[];
}

export interface ParagraphBlock extends BaseContentBlock {
  readonly type: "paragraph";
  readonly text: string;
}

export interface DefinitionBlock extends BaseContentBlock {
  readonly type: "definition";
  readonly term: string;
  readonly definition: string;
}

export interface ExampleBlock extends BaseContentBlock {
  readonly type: "example";
  readonly title: string;
  readonly body: string;
}

export interface HeadingBlock extends BaseContentBlock {
  readonly type: "heading";
  readonly level: 2 | 3 | 4;
  readonly text: string;
}

export interface BulletListBlock extends BaseContentBlock {
  readonly type: "bulletList";
  readonly items: readonly string[];
}

export interface TableBlock extends BaseContentBlock {
  readonly type: "table";
  readonly caption: string | null;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export interface FormulaBlock extends BaseContentBlock {
  readonly type: "formula";
  readonly label: string;
  readonly expression: string;
  readonly variables: readonly FormulaVariable[];
}

export interface FormulaVariable {
  readonly symbol: string;
  readonly label: string;
  readonly unit: string | null;
}

export type CalloutTone = "info" | "tip" | "warning" | "safety" | "technical";

export interface CalloutBlock extends BaseContentBlock {
  readonly type: "callout";
  readonly tone: CalloutTone;
  readonly title: string;
  readonly body: string;
}

export interface DiagramBlock extends BaseContentBlock {
  readonly type: "diagram";
  readonly title: string;
  readonly description: string;
  readonly accessibilityLabel: string;
  readonly assetKey: string | null;
}

export interface GlossaryReferenceBlock extends BaseContentBlock {
  readonly type: "glossaryReference";
  readonly termSlug: string;
  readonly label: string;
}

export interface CalculatorCtaBlock extends BaseContentBlock {
  readonly type: "calculatorCta";
  readonly calculatorSlug: string;
  readonly title: string;
  readonly description: string;
}

export interface RelatedArticleBlock extends BaseContentBlock {
  readonly type: "relatedArticle";
  readonly articleSlug: string;
  readonly sectionId: string | null;
}

export interface SourceReferenceBlock extends BaseContentBlock {
  readonly type: "sourceReference";
  readonly sourceId: string;
  readonly note: string | null;
}

export interface GlossaryTerm {
  readonly slug: string;
  readonly label: string;
  readonly aliases: readonly string[];
  readonly shortDefinition: string;
  readonly detailedDefinition: string;
  readonly relatedTerms: readonly string[];
  readonly sources: readonly SourceReference[];
}

export type SourceKind =
  | "book"
  | "standard"
  | "article"
  | "website"
  | "course"
  | "manufacturer-documentation";

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

export interface CalculatorLink {
  readonly slug: string;
  readonly label: string;
  readonly reason: string;
  readonly target: Extract<AcademyLinkTarget, { readonly type: "calculator" }>;
}

export type AcademyLinkTarget =
  | {
      readonly type: "article";
      readonly slug: string;
      readonly sectionId?: string;
    }
  | { readonly type: "glossary"; readonly slug: string }
  | { readonly type: "calculator"; readonly slug: string }
  | { readonly type: "app-context"; readonly target: string };

export type AcademySearchResultKind = "article" | "section" | "glossary";

export interface AcademySearchEntry {
  readonly id: string;
  readonly kind: AcademySearchResultKind;
  readonly title: string;
  readonly summary: string;
  readonly target: AcademyLinkTarget;
  readonly keywords: readonly string[];
}

export interface RetrievalChunk {
  readonly id: string;
  readonly articleSlug: string;
  readonly sectionId: string;
  readonly text: string;
  readonly sourceIds: readonly string[];
  readonly sensitive: boolean;
}

export interface ChatbotAnswer {
  readonly answer: string;
  readonly citations: readonly AcademyLinkTarget[];
  readonly abstained: boolean;
}
