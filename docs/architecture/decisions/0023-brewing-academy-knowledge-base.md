# ADR-0023 - Brewing Academy as a generated knowledge base

**Status**  Proposed
**Date**    2026-07-02
**Owners**  @benoit-bremaud

---

## Context

The current Brewing Academy content is mixed with React Native UI. This makes
articles harder to review, source, search, reuse, and prepare for a future
specialized brewing chatbot.

The product decision is clear:

- the mobile app remains the active pedagogical guide;
- the Academy becomes a complete reference knowledge base;
- users can leave an app flow, consult a detailed concept, then return to tools
  or calculators;
- future chatbot answers must come from a validated and sourced corpus.

The first implementation must stay proportionate: three pilot articles
(`houblons`, `levures`, `eau`), local search, central glossary, calculator
links, mobile-first reading, and no backend publishing surface.

## Decision

1. **Markdown/front matter is the V1 editorial source.** Academy articles are
   authored as Markdown files with strict YAML front matter and reviewed through
   Git.

2. **The mobile app consumes generated typed content.** A build-time pipeline
   parses, validates, and generates TypeScript payloads for articles, glossary,
   search, and future retrieval preparation. React Native screens do not contain
   article-specific JSX.

3. **No database, CMS, or backend publishing in V1.** The immediate problem is
   content structure and maintainability, not multi-author runtime publishing.

4. **Local search first.** The initial corpus is small and must be available
   offline, so V1 uses a generated local search index. The search behavior sits
   behind a strategy boundary to allow later evolution.

5. **One semantic link resolver.** Article, glossary, calculator, and app
   context links are represented as semantic targets and resolved centrally.

6. **Future chatbot is prepared, not implemented.** The content model includes
   stable section IDs, source references, and optional retrieval chunk
   generation so a later sourced RAG assistant can cite Academy content and
   abstain when unsupported.

7. **SOLID and design patterns are pragmatic constraints.** Repository,
   Adapter, Factory/Builder, Strategy, Resolver, Presenter/ViewModel,
   Specification, and Template Method may be used only when they reduce
   coupling, improve testability, or clarify a concrete responsibility.

## Consequences

Positive:

- Academy content becomes reviewable and versioned.
- Core Academy content stays offline-capable.
- Broken metadata, links, glossary terms, and sources can fail before runtime.
- Screens become simpler and more testable.
- The same corpus can later support a sourced chatbot.

Negative:

- Non-technical editing remains less comfortable than a CMS.
- Content updates require a generation and app release path.
- The generator and schemas become required project tooling.
- Generated files need a clear policy: committed artifacts or deterministic CI
  output.

## Roadmap

1. Add Academy domain contracts and validation schemas.
2. Add Markdown/front matter source files for the pilot articles.
3. Add generator for typed article, glossary, and search payloads.
4. Replace hardcoded pilot article UI with a generic renderer.
5. Add hub/search UX and bidirectional calculator links.
6. Generate retrieval chunks only when chatbot preparation becomes useful.
7. Revisit backend publishing or CMS only after the Git-based workflow becomes
   a real limitation.

## References

- `docs/product/academy/academy-knowledge-base-framing.md`
- `docs/architecture/academy/design-pack.md`
- `docs/architecture/diagrams/academy/00-overview.md`
- `docs/architecture/diagrams/academy/10-implementation-notes.md`
