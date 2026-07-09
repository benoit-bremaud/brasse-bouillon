import {
  AcademyArticleStatus,
  AcademyCategory,
  AcademyContentBlock,
  AcademyLevel,
  AcademyReviewConfidence,
  SourceKind,
} from "../../domain";

export interface AcademySourceCorpus {
  readonly articles: readonly AcademySourceArticle[];
  readonly glossaryTerms: readonly AcademySourceGlossaryTerm[];
  readonly sources: readonly AcademySourceReference[];
  readonly calculatorSlugs: readonly string[];
}

export interface AcademySourceArticle {
  readonly filePath: string;
  readonly slug: string;
  readonly frontMatter: AcademySourceArticleFrontMatter;
  readonly sections: readonly AcademySourceSection[];
}

export interface AcademySourceArticleFrontMatter {
  readonly title: string;
  readonly summary: string;
  readonly category: AcademyCategory;
  readonly level: AcademyLevel;
  readonly status: AcademyArticleStatus;
  readonly version: string;
  readonly estimated_read_time_minutes: number;
  readonly tags: readonly string[];
  readonly updated_at: string;
  readonly related_articles: readonly string[];
  readonly related_glossary_terms: readonly string[];
  readonly related_calculators: readonly AcademySourceCalculatorLink[];
  readonly learning_objectives: readonly string[];
  readonly prerequisites: readonly string[];
  readonly teaches: readonly string[];
  readonly sensitive: boolean;
  readonly risk_topics: readonly string[];
  readonly source_ids: readonly string[];
  readonly review: AcademySourceReviewMetadata | null;
}

export interface AcademySourceReviewMetadata {
  readonly confidence_level: AcademyReviewConfidence;
  readonly reviewed_by: string | null;
  readonly reviewed_at: string | null;
  readonly notes: readonly string[];
}

export interface AcademySourceCalculatorLink {
  readonly slug: string;
  readonly label: string;
  readonly reason: string;
  readonly target_slug: string;
}

export interface AcademySourceSection {
  readonly id: string;
  readonly title: string;
  readonly blocks: readonly AcademyContentBlock[];
}

export interface AcademySourceGlossaryTerm {
  readonly slug: string;
  readonly label: string;
  readonly aliases: readonly string[];
  readonly short_definition: string;
  readonly detailed_definition: string;
  readonly related_terms: readonly string[];
  readonly source_ids: readonly string[];
}

export interface AcademySourceReference {
  readonly id: string;
  readonly kind: SourceKind;
  readonly title: string;
  readonly authors: readonly string[];
  readonly publisher: string | null;
  readonly url: string | null;
  readonly accessed_at: string | null;
  readonly year: number | null;
  readonly notes: string | null;
}
