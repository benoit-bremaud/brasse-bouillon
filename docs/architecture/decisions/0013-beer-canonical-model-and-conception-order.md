# ADR-0013 — Canonical beer model, scan-catalog reconciliation, and conception order

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** Benoît Bremaud
- **Tags:** architecture, data-model, scan, encyclopedia, conception, uml

## Context

A conception audit of `packages/beer-encyclopedia` (2026-05-29) found three
unreconciled facts:

1. The Python service was built (~7k LOC, in prod) **without a conforming UML
   conception study**, violating the project's UML-first rule. The only beer-data
   class diagram is `docs/architecture/diagrams/scan/04-class.md`, which models a
   denormalized `ScanCatalogItem` and labels it "Python Postgres".
2. In reality, `scan_catalog_items` lives in **NestJS** (`packages/api`) with
   `barcode` **NOT NULL**, while the Python service uses a fully **normalized**
   model (`Beer` referencing `Brewery` / `Style` by FK). The diagram contradicts
   both the Python model (shape) and the NestJS table (location + nullability).
3. Several built entities had no ADR (addressed by package ADR-0004 / ADR-0005).

This ADR settles the canonical model, the fate of `scan_catalog_items`, and a
documentation-location exception. It extends repo ADR-0005.

## Decision

1. **Canonical model.** The **normalized** `Beer` + `Brewery` + `Style` model in
   `packages/beer-encyclopedia/db/models/` is the **single source of truth** for
   beer data. This is consistent with the project rule "Beer = commercial identity
   (never a grain bill) ≠ Recipe"; BeerXML / BeerJSON belong to the `Recipe`
   domain and have no bearing on the `Beer` entity.

2. **`scan_catalog_items` is a transitional cache.** The NestJS
   `scan_catalog_items` table is a read-through cache only, to be retired by the
   ADR-0005 ETL (copy into Python `beers`, source-tagged). It is not a parallel
   source of truth.

3. **Fix the scan class diagram.** `docs/architecture/diagrams/scan/04-class.md`
   must be corrected to point at the normalized `Beer` model (or clearly marked as
   a transitional cache view), and the `barcode` nullability discrepancy resolved
   in favour of the canonical model (nullable in the knowledge base; a barcode is
   not mandatory for a beer fiche).

4. **Diagram location: central, by feature (consistency).** The beer-encyclopedia UML
   study lives under `docs/architecture/diagrams/beer-encyclopedia/`, **like every other
   feature** (`account/`, `scan/`, `recipes/`, …). One location, one rule, no per-feature
   exception. The study earlier sat in-package to prepare a monorepo split; since that
   **split is deferred** (no concrete trigger: second team, independent deploy/versioning,
   open-sourcing a package, repo size), the package-local placement was an inconsistency and
   the study was **moved to the central location**. System-level / transverse artifacts
   (product use cases, traceability matrix, cross-cutting ADRs) also live under
   `docs/architecture/`. If a monorepo split ever happens, each feature folder extracts cleanly.

5. **Conception order going forward.** UML-first is restored: any further
   beer-encyclopedia work (notably the mobile to encyclopedia-API wiring, and the
   advanced panoramic/AI scan pipeline) is modelled before it is coded.

## Consequences

### Positive

- One source of truth for beer data; no normalized/denormalized ambiguity.
- The as-built backend finally has a conception study (the in-package diagrams).
- Each package can leave the monorepo with its own ADRs and diagrams intact.

### Negative / trade-offs

- A documentation split: most features keep diagrams centrally, beer-encyclopedia
  keeps them in-package. The exception is recorded here to avoid confusion.
- The scan-pipeline study under `docs/architecture/diagrams/scan/` remains a future
  target that diverges from today's simple pipeline; it must be reconciled or
  explicitly flagged as "target, not built".

## Links

- ADR-0005 — backend split (extended here).
- `packages/beer-encyclopedia/docs/diagrams/beer-encyclopedia/` — in-package UML study.
- `packages/beer-encyclopedia/docs/adr/ADR-0004` — auxiliary entities.
- `packages/beer-encyclopedia/docs/adr/ADR-0005` — recommender scoring.
- `docs/architecture/diagrams/scan/04-class.md` — diagram to correct (clause 3).
