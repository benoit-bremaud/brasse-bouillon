# Component diagram - Academy content architecture

> **Feature**: build-time content generation and mobile runtime consumption.

## Context

The V1 architecture separates authoring, validation, generated content, use
cases, and presentation. This prevents article text from returning to hardcoded
screen branches.

## Diagram

```mermaid
flowchart TB
  subgraph Source ["Editorial source"]
    ArticleMd["Article Markdown files"]
    GlossaryMd["Glossary source files"]
    SourceRefs["Source reference files"]
  end

  subgraph Pipeline ["Build-time pipeline"]
    Parser["Content parser"]
    SchemaValidator["Schema validator"]
    LinkValidator["Link validator"]
    BlockTransformer["Block transformer"]
    ContentGenerator["Typed content generator"]
  end

  subgraph Generated ["Generated mobile content"]
    AcademyIndex["Academy index"]
    ArticlePayloads["Article payloads"]
    GlossaryPayload["Glossary payload"]
    SearchPayload["Search payload"]
    RetrievalChunks["Retrieval chunks (future)"]
  end

  subgraph MobileDomain ["Mobile domain/application"]
    AcademyRepository["AcademyRepository"]
    AcademyUseCases["Academy use cases"]
    SearchService["AcademySearchService"]
    LinkResolver["AcademyLinkResolver"]
  end

  subgraph MobilePresentation ["Mobile presentation"]
    HubScreen["AcademyHubScreen"]
    ArticleScreen["AcademyArticleScreen"]
    ArticleRenderer["AcademyArticleRenderer"]
    GlossaryModal["GlossaryTermModal"]
    SearchResults["AcademySearchResults"]
  end

  subgraph Future ["Future services"]
    RetrievalService["Retrieval service"]
    ChatbotService["Sourced chatbot service"]
  end

  ArticleMd --> Parser
  GlossaryMd --> Parser
  SourceRefs --> Parser
  Parser --> SchemaValidator
  SchemaValidator --> LinkValidator
  LinkValidator --> BlockTransformer
  BlockTransformer --> ContentGenerator

  ContentGenerator --> AcademyIndex
  ContentGenerator --> ArticlePayloads
  ContentGenerator --> GlossaryPayload
  ContentGenerator --> SearchPayload
  ContentGenerator -.-> RetrievalChunks

  AcademyIndex --> AcademyRepository
  ArticlePayloads --> AcademyRepository
  GlossaryPayload --> AcademyRepository
  SearchPayload --> SearchService

  AcademyRepository --> AcademyUseCases
  SearchService --> AcademyUseCases
  LinkResolver --> AcademyUseCases

  AcademyUseCases --> HubScreen
  AcademyUseCases --> ArticleScreen
  AcademyUseCases --> SearchResults
  ArticleScreen --> ArticleRenderer
  ArticleRenderer --> GlossaryModal
  ArticleRenderer --> LinkResolver

  RetrievalChunks -.-> RetrievalService
  RetrievalService -.-> ChatbotService
```

## Notes

- Generated files may be committed or generated in CI depending on the final
  implementation decision. The contract is the important point.
- Presentation components must not parse Markdown.
- Use cases must not know about raw Markdown paths.
- Future retrieval chunks are generated from the same validated content.
