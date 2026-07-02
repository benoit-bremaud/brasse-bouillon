# Class diagram - Academy domain model

> **Feature**: typed Academy content, glossary, search, and future chatbot
> retrieval contracts.

## Context

This domain model is intentionally UI-agnostic. Presentation components render
these objects, but article meaning, metadata, links, sources, and search data do
not belong to React Native screens.

## Diagram

```mermaid
classDiagram
  class AcademyArticle {
    +string slug
    +AcademyArticleMetadata metadata
    +AcademyArticleBody body
  }

  class AcademyArticleMetadata {
    +string title
    +string summary
    +AcademyCategory category
    +AcademyLevel level
    +AcademyStatus status
    +string version
    +int estimatedReadTime
    +Date updatedAt
    +boolean sensitive
  }

  class AcademyArticleBody {
    +AcademySection[] sections
  }

  class AcademySection {
    +string id
    +string title
    +AcademyContentBlock[] blocks
  }

  class AcademyContentBlock {
    <<enumeration>>
    paragraph
    heading
    bulletList
    table
    formula
    callout
    diagram
    glossaryReference
    calculatorCta
    relatedArticle
    sourceReference
  }

  class GlossaryTerm {
    +string slug
    +string term
    +string[] aliases
    +string shortDefinition
    +string longDefinition
    +AcademyLevel level
  }

  class SourceReference {
    +string id
    +string title
    +string url
    +SourceType type
    +string note
  }

  class ReviewMetadata {
    +ConfidenceLevel confidenceLevel
    +string reviewedBy
    +Date reviewedAt
    +string[] notes
  }

  class CalculatorLink {
    +CalculatorSlug slug
    +string label
    +string route
  }

  class SearchIndexEntry {
    +string id
    +SearchEntryType type
    +string title
    +string summary
    +string[] tokens
    +string route
  }

  class RetrievalChunk {
    +string id
    +string articleSlug
    +string sectionId
    +string content
    +string[] sourceIds
    +string version
  }

  class ChatbotAnswer {
    +string answer
    +ChatbotCitation[] citations
    +RelatedAction[] relatedActions
    +boolean answeredFromSources
  }

  class ChatbotCitation {
    +string articleSlug
    +string sectionId
    +string sourceId
  }

  class RelatedAction {
    +string label
    +string route
    +RelatedActionType type
  }

  AcademyArticle "1" --> "1" AcademyArticleMetadata
  AcademyArticle "1" --> "1" AcademyArticleBody
  AcademyArticleBody "1" --> "*" AcademySection
  AcademySection "1" --> "*" AcademyContentBlock
  AcademyArticleMetadata "1" --> "0..1" ReviewMetadata
  AcademyArticleMetadata "*" --> "*" SourceReference
  AcademyArticleMetadata "*" --> "*" CalculatorLink
  AcademyArticleMetadata "*" --> "*" GlossaryTerm
  SearchIndexEntry ..> AcademyArticle : indexes
  SearchIndexEntry ..> GlossaryTerm : indexes
  RetrievalChunk ..> AcademySection : chunks
  RetrievalChunk ..> SourceReference : cites
  ChatbotAnswer "1" --> "*" ChatbotCitation
  ChatbotAnswer "1" --> "*" RelatedAction
```

## Enumerations

```mermaid
classDiagram
  class AcademyCategory {
    <<enumeration>>
    getting_started
    ingredients
    process
    fermentation
    water
    equipment
    styles
    safety
    troubleshooting
    glossary
  }

  class AcademyLevel {
    <<enumeration>>
    beginner
    intermediate
    advanced
  }

  class AcademyStatus {
    <<enumeration>>
    draft
    review
    published
    deprecated
  }

  class ConfidenceLevel {
    <<enumeration>>
    draft
    reviewed
    validated
  }

  class SourceType {
    <<enumeration>>
    book
    standard
    technical_article
    manufacturer_doc
    internal_note
  }

  class SearchEntryType {
    <<enumeration>>
    article
    section
    glossary_term
    faq
  }

  class RelatedActionType {
    <<enumeration>>
    article
    glossary
    calculator
    app_context
  }
```

## Notes

- `AcademyContentBlock` is a discriminated union in TypeScript.
- `RetrievalChunk` is generated for future chatbot retrieval, not manually edited.
- `ChatbotAnswer` is future-facing and must not drive V1 scope.
- `CalculatorLink` replaces slug convention-only wiring over time.
