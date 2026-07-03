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
    +int estimatedReadTimeMinutes
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
    +string label
    +string[] aliases
    +string shortDefinition
    +string detailedDefinition
  }

  class SourceReference {
    +string id
    +SourceKind kind
    +string title
    +string[] authors
    +string publisher
    +string url
    +Date accessedAt
    +int year
    +string notes
  }

  class ReviewMetadata {
    +ConfidenceLevel confidenceLevel
    +string reviewedBy
    +Date reviewedAt
    +string[] notes
  }

  class CalculatorLink {
    +string slug
    +string label
    +string reason
    +AcademyLinkTarget target
  }

  class AcademySearchEntry {
    +string id
    +AcademySearchResultKind kind
    +string title
    +string excerpt
    +string[] keywords
    +AcademyLevel level
    +AcademyCategory category
    +AcademyLinkTarget target
  }

  class RetrievalChunk {
    +string id
    +string articleSlug
    +string sectionId
    +string text
    +string[] sourceIds
    +string[] glossaryTermSlugs
    +boolean sensitive
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
    +AcademyLinkTarget target
    +RelatedActionType type
  }

  class AcademyLinkTarget {
    <<enumeration>>
    article
    glossary
    calculator
    app_context
  }

  AcademyArticle "1" --> "1" AcademyArticleMetadata
  AcademyArticle "1" --> "1" AcademyArticleBody
  AcademyArticleBody "1" --> "*" AcademySection
  AcademySection "1" --> "*" AcademyContentBlock
  AcademyArticleMetadata "1" --> "0..1" ReviewMetadata
  AcademyArticleMetadata "*" --> "*" SourceReference
  AcademyArticleMetadata "*" --> "*" CalculatorLink
  AcademyArticleMetadata "*" --> "*" GlossaryTerm
  CalculatorLink ..> AcademyLinkTarget : targets
  AcademySearchEntry ..> AcademyLinkTarget : targets
  RelatedAction ..> AcademyLinkTarget : targets
  AcademySearchEntry ..> AcademyArticle : indexes
  AcademySearchEntry ..> GlossaryTerm : indexes
  RetrievalChunk ..> AcademySection : chunks
  RetrievalChunk ..> SourceReference : cites
  ChatbotAnswer "1" --> "*" ChatbotCitation
  ChatbotAnswer "1" --> "*" RelatedAction
```

## SOLID-Oriented Application Contracts

```mermaid
classDiagram
  class AcademyContentRepositoryPort {
    <<Interface>>
    +listPublishedArticles()
    +getArticleBySlug(slug)
    +getGlossaryTerm(slug)
  }

  class AcademySearchPort {
    <<Interface>>
    +search(query)
  }

  class AcademyLinkResolverPort {
    <<Interface>>
    +resolve(target)
  }

  class AcademyArticlePresenter {
    +toArticleViewModel(article)
  }

  class AcademyHubPresenter {
    +toHubViewModel(index)
  }

  class GeneratedAcademyRepository {
    +listPublishedArticles()
    +getArticleBySlug(slug)
    +getGlossaryTerm(slug)
  }

  class LocalAcademySearchStrategy {
    +search(query)
  }

  class ExpoAcademyLinkResolver {
    +resolve(target)
  }

  class AcademyUseCases {
    +openArticle(slug)
    +search(query)
    +openSemanticTarget(target)
  }

  AcademyUseCases ..> AcademyContentRepositoryPort : DIP
  AcademyUseCases ..> AcademySearchPort : DIP
  AcademyUseCases ..> AcademyLinkResolverPort : DIP
  GeneratedAcademyRepository ..|> AcademyContentRepositoryPort
  LocalAcademySearchStrategy ..|> AcademySearchPort
  ExpoAcademyLinkResolver ..|> AcademyLinkResolverPort
  AcademyArticlePresenter ..> AcademyArticle
  AcademyHubPresenter ..> AcademySearchEntry
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
    beer_styles
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

  class SourceKind {
    <<enumeration>>
    book
    standard
    article
    website
    course
    manufacturer_documentation
  }

  class AcademySearchResultKind {
    <<enumeration>>
    article
    section
    glossary
    faq
    calculator
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
- Mermaid enumeration entries use underscore-safe labels where TypeScript
  literals may use hyphenated values, for example `beer_styles` maps to
  `'beer-styles'`.
- `RetrievalChunk` is generated for future chatbot retrieval, not manually edited.
- `ChatbotAnswer` is future-facing and must not drive V1 scope.
- `CalculatorLink` and search entries expose semantic targets, not concrete
  routes. Route mapping belongs to the link resolver.
- SOLID application contracts make Dependency Inversion explicit: use cases
  depend on ports, while generated repositories, search strategies, and route
  resolvers implement those ports.
- Single Responsibility is enforced by keeping presenters, repositories, search,
  and link resolution separate.
- Open/Closed is supported by content block discriminants and search/link
  strategy interfaces: new block renderers or search strategies should not
  require rewriting screens.
