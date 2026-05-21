# Architecture Decision Records (ADRs)

This folder collects the **structural decisions** made on the Brasse-Bouillon
project. Each ADR is a self-contained document that captures:

- The **context** that forced the decision.
- The **decision** itself (what we commit to, and what we explicitly rule out).
- The **consequences** (positive and negative) we accept.
- Optionally, the **migration roadmap** to the next state.

---

## Format

Every ADR follows the same skeleton (inspired by Michael Nygard's template):

```
# ADR-NNNN — Title

**Status**  Proposed / Accepted / Deprecated / Superseded by ADR-MMMM
**Date**    YYYY-MM-DD
**Owners**  @handle(s)

## Context
## Decision
## Consequences
## Roadmap (optional)
## References (optional)
```

- **Filename**: `NNNN-kebab-case-title.md`, zero-padded four-digit index.
- **Language**: English (per `docs/CONVENTIONS.md` §1). French labels are
  kept in code spans when they refer to the in-app UI.
- **Mutability**: an ADR is append-only once **Accepted**. To change a
  decision, write a new ADR that **supersedes** the old one and flip the
  old one's status to `Superseded by ADR-MMMM`.

---

## Index

| # | Title | Status | Date |
|---|-------|--------|------|
| [0001](0001-build-for-today-design-for-tomorrow.md) | Build for today, design for tomorrow | Accepted | 2026-04-24 |
| [0002](0002-centralized-nestjs-backend.md) | Centralized NestJS backend for all external data sources | Accepted | 2026-04-24 |
| [0003](0003-consent-single-source-of-truth.md) | Consent as a single source of truth | Accepted | 2026-04-24 |
| [0004](0004-data-locality-hybrid-principle.md) | Data locality: hybrid principle | Accepted | 2026-04-24 |
| [0005](0005-backend-split-encyclopedia-vs-product.md) | Backend split: encyclopedia vs product | Accepted | 2026-05-02 |
| [0006](0006-beer-duel-preference-data-ownership.md) | Beer-duel preference data ownership | Accepted | 2026-05-21 |

---

## Related documents

- `CLAUDE.md` (root) — project conventions that AI agents apply.
- `docs/CONVENTIONS.md` — naming, language, structure rules.
- `docs/product/brainstorms/` — product Q&A sessions that feed the ADRs.
