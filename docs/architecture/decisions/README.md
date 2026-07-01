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
| [0009](0009-beer-duel-preference-data-ownership.md) | Beer-duel preference data ownership | Accepted | 2026-05-21 |
| [0010](0010-recipe-step-type-nine-phase.md) | Extend `RecipeStepType` to the 9-phase brewing set | Proposed | 2026-05-25 |
| [0011](0011-creator-role-above-admin.md) | Single-holder `CREATOR` role above `ADMIN` | Accepted | 2026-05-25 |
| [0012](0012-rgpd-anonymize-authored-public-content.md) | RGPD: anonymize authored public content on deletion | Proposed | 2026-05-25 |
| [0013](0013-beer-canonical-model-and-conception-order.md) | Canonical beer model, scan-catalog reconciliation, and conception order | Accepted | 2026-05-29 |
| [0014](0014-website-hosting-cloudflare-pages-dns.md) | Website hosting on Cloudflare Pages, DNS authority on Cloudflare | Accepted | 2026-05-29 |
| [0015](0015-beer-ingestion-enrichment-strategy.md) | Beer ingestion & enrichment strategy (multi-source → staging → human-gated promotion) | Accepted | 2026-06-04 |
| [0016](0016-recipe-equivalence-matching-v2.md) | Recipe-equivalence matching v2 (weighted criteria + completeness + BJCP families) | Proposed | 2026-06-05 |
| [0017](0017-beer-ibu-colour-min-max-intervals.md) | Beer IBU & colour stored as min/max intervals | Proposed | 2026-06-05 |
| [0018](0018-admin-moderation-surface.md) | Admin/moderation surface (in-app CREATOR, secured at the API) | Accepted | 2026-06-15 |
| [0019](0019-testing-strategy-and-quality-gates.md) | Testing strategy: test pyramid, e2e tooling per surface, CI quality gates | Proposed | 2026-06-17 |
| [0020](0020-equipment-driven-volume-planning.md) | Equipment-driven batch sizing & volume planning (computed in the backend) | Accepted | 2026-06-19 |
| [0021](0021-equipment-readiness-cleaning-and-adaptive-pedagogy.md) | Equipment readiness = reusable profile + capacity fit-check + cleaning ritual; adaptive pedagogy | Proposed | 2026-06-24 |
| [0022](0022-public-faq-chatbot-llm.md) | Public project FAQ chatbot on the website, backed by Mistral (EU/RGPD), prompt-as-spec with an eval gate | Proposed | 2026-07-01 |

> **Numbers 0006–0008 are reserved** (not yet drafted) for decisions already
> referenced by open epics: 0006 — private journal vs. social product (#833),
> 0007 — monetization model (#834, #879, #883), 0008 — AI-generated content
> policy (#834). They will be added here when drafted.

---

## Related documents

- `CLAUDE.md` (root) — project conventions that AI agents apply.
- `docs/CONVENTIONS.md` — naming, language, structure rules.
- `docs/product/brainstorms/` — product Q&A sessions that feed the ADRs.
