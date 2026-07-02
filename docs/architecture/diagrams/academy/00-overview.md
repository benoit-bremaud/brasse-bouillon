# Academy knowledge base UML study

> **Feature**: Brewing Academy refactor as a versioned knowledge base.
> **Scope**: V1 Markdown/front matter content pipeline, mobile reader, glossary,
> local search, calculator links. Future: sourced RAG chatbot.
> **Product framing**:
> `docs/product/academy/academy-knowledge-base-framing.md`.

## Context

The current Academy implementation mixes article content with React Native UI.
The target architecture separates editorial content, validation, generated
mobile payloads, presentation, search, glossary reuse, and future chatbot
retrieval.

This UML package is the coding support for the next implementation phase. Code
should implement the contracts and flows described here, not re-invent them in
screen components.

## Design Principles

- Clean boundaries: editorial source, generation, domain model, use cases, and
  presentation stay distinct.
- SOLID: renderers depend on block contracts, not article slugs.
- KISS: V1 ships a vertical slice with three pilot articles.
- YAGNI: no CMS, backend publishing, vector search, or chatbot implementation in
  V1.
- DRY: one glossary model, one content model, one calculator-link contract.

## V1 Decisions

- The Academy is a reference knowledge base, not the app's active tutorial.
- The mobile app remains the pedagogical guide in operational flows.
- Canonical Academy content is Markdown with strict front matter.
- The app consumes generated typed content, not raw hardcoded article JSX.
- Core content remains available offline in the mobile bundle.
- Pilot articles are `houblons`, `levures`, and `eau`.
- The hub is mobile-first, search-first, and tablet-aware.
- The glossary is central and reusable across app surfaces.
- Calculator links are bidirectional.

## Future Decisions Represented But Not Implemented In V1

- The chatbot is a sourced RAG assistant over Academy and glossary content.
- V1 chatbot has no persistent server-side conversation history.
- User-specific brewing context requires explicit consent and is a later phase.
- Vector search is only introduced if lexical search is insufficient.

## Diagram Index

1. [Context](01-context.md)
2. [Use cases](02-use-case.md)
3. [Domain class model](03-domain-class.md)
4. [Components](04-components.md)
5. [Sequence: open article](05-sequence-open-article.md)
6. [Sequence: generate content](06-sequence-generate-content.md)
7. [State: article lifecycle](07-state-article-lifecycle.md)
8. [Activity: local search](08-activity-search.md)
9. [Sequence: future chatbot RAG](09-sequence-chatbot-rag.md)
10. [Implementation notes](10-implementation-notes.md)

## Documentation Check

Context7 was requested but is not available in this Codex session. The review
therefore used current official documentation directly:

- Mermaid 11.16.0 syntax documentation for flowchart, class, sequence, and state
  diagrams.
- Expo Router documentation for file-based routing, dynamic route parameters,
  `Link asChild`, and route prefetch constraints.
- React Native documentation for accessibility labels, hints, and image `alt`
  support.

The diagrams intentionally use conservative Mermaid syntax. Newer flowchart
shape aliases and ambiguous labels such as lowercase `end` are avoided until the
project renderer version is confirmed.

## Implementation Order Suggested By This Study

1. Domain contracts for articles, blocks, glossary, links, sources, and search.
2. Markdown/front matter validation.
3. Generated Academy index and generated article content.
4. Mobile article renderer.
5. Mobile Academy hub and local search.
6. Bidirectional calculator/article links.
7. Retrieval chunk generation for the future chatbot.
