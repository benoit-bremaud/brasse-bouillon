# Component diagram — beer-encyclopedia — structure & boundaries

> **Feature**: beer-encyclopedia internal structure + inter-backend boundary
> **Source code**: `api/`, `ml/`, `db/`, `importers/`
> **Related ADRs**: repo ADR-0005 (backend split), ADR-0003 (importers package)

## Context

Structural decomposition of the Python service (layers: `api` → `ml` / `db` /
`importers`) and the boundary with the rest of the product per ADR-0005. Answers
"how is it structured", not "who wants what" (that is `01-use-case.md`).

## Diagram

```mermaid
flowchart TB
  Mobile["packages/mobile-app (React Native)"]
  NestJS["packages/api (NestJS — product backend)"]
  OFF["Open Food Facts (external)"]

  subgraph PY ["packages/beer-encyclopedia (Python — knowledge base)"]
    subgraph APIL ["api (FastAPI)"]
      Routers["routers: beers / breweries / styles / scan"]
      Schemas["schemas (Pydantic)"]
    end
    subgraph MLL ["ml"]
      Pipeline["pipeline → infer / ocr / extract / recommender"]
    end
    subgraph IMP ["importers"]
      OFFClient["openfoodfacts client"]
      Persist["persistence (upsert + audit)"]
    end
    subgraph DBL ["db"]
      Engine["engine (async session)"]
      Models["models (ORM, 10 entities)"]
    end
    PG[("PostgreSQL")]
  end

  Mobile -->|"beer facts: scan, fiche, import-by-ean"| Routers
  Mobile -->|"user data: auth, recipes, brassins"| NestJS
  NestJS -.->|"read-through (ADR-0005 roadmap)"| Routers

  Routers --> Schemas
  Routers --> Pipeline
  Routers --> Engine
  Routers --> OFFClient
  Routers --> Persist
  OFFClient -->|"GET product by EAN"| OFF
  Persist --> Engine
  Engine --> Models
  Engine --> PG
```

## Notes

- **Single egress to OFF**: only `importers/openfoodfacts.py` talks to Open Food Facts;
  routers never call it directly.
- **ml has no DB access**: the scan pipeline is pure compute; persistence lives only in
  `importers/` and the CRUD routers.
- **ADR-0005 boundary**: the mobile app legitimately calls **two** backends — NestJS for
  user/product data, Python for beer facts. The dashed `NestJS -.-> Python` edge is the
  planned read-through during the `scan_catalog_items` migration; it is **not built
  yet** (NestJS still owns `scan_catalog_items` + its own OFF client today).
