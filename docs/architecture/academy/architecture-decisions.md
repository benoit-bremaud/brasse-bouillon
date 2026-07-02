# Brewing Academy Architecture Decision Summary

## Canonical Decision

The canonical architecture decision is:

- `docs/architecture/decisions/0023-brewing-academy-knowledge-base.md`

This file exists only as a local index for the Academy design pack. It avoids
duplicating ADR content while keeping the implementation package easy to browse.

## Decision Summary

ADR-0023 establishes that:

- Markdown/front matter is the V1 editorial source.
- The mobile app consumes generated typed payloads.
- No database, CMS, or backend publishing surface is introduced in V1.
- Local search is used first.
- Article, glossary, calculator, and app-context links resolve through one
  semantic resolver.
- The future chatbot is prepared through stable source IDs and retrieval-ready
  sections, but not implemented in V1.
- SOLID and design patterns are applied pragmatically.

## Related Design Files

- `design-pack.md`
- `requirements-matrix.md`
- `domain-contracts.md`
- `business-rules.md`
- `content-pipeline.md`
- `test-strategy.md`
- `security-and-rgpd.md`
- `migration-plan.md`
