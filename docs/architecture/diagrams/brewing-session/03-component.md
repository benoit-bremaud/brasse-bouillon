# Component diagram — brewing-session — structure & boundaries

> **Feature**: epic #868; data model #605; step state machine #608.
> **Source spec**: `docs/architecture/specs/brewing-session.md`
> **ADRs**: ADR-0002 (centralized NestJS backend), ADR-0005 (backend split —
> batch/product data lives in the product API, not the encyclopedia).

## Context

How the feature is structured across packages and layers, and where the single
network egress point is. Answers "how is it built?", not "who wants what?"
(that's `01-use-case.md`). Confirms the Clean Architecture layering the project
mandates: presentation → application (use-cases) → data (http-client) → API.

## Diagram

```mermaid
flowchart LR
  subgraph Mobile ["packages/mobile-app — features/batches"]
    direction TB
    Screen["presentation/BrewingSessionScreen + step components"]
    UCs["application/step.use-cases (start/complete/pause/skip, measurement)"]
    Domain["domain/batch.types (Batch, BatchStep, Measurement...)"]
    HTTP["core/http/http-client (sole egress)"]
    DataSrc["core/data/data-source (demo toggle)"]
    Screen --> UCs
    UCs --> Domain
    UCs --> DataSrc
    UCs --> HTTP
  end

  subgraph API ["packages/api/src/batch — batch module"]
    direction TB
    Ctrl["BatchController (REST: steps start/complete/...)"]
    Svc["BatchService (state machine, alert eval)"]
    Ent["domain entities + TypeORM (Batch, BatchStep, Measurement, Observation, Alert)"]
    Ctrl --> Svc
    Svc --> Ent
  end

  subgraph Recipes ["packages/api/src/recipe — recipe module"]
    RStep["RecipeStep (source of the step list)"]
  end

  DB[("SQLite (better-sqlite3, TypeORM)")]

  HTTP -->|"HTTPS REST"| Ctrl
  Ent --> DB
  Svc -->|"snapshot steps on session start"| RStep
```

## Notes

- **Single egress**: all network calls go through `core/http/http-client`; the
  screen never calls `fetch` directly (project rule). This diagram makes a
  bypass visible.
- **Demo toggle**: `core/data/data-source` lets the use-cases short-circuit to
  the in-memory demo batch — the demo path does not hit the API.
- **Recipe-derived**: `BatchService` reads `RecipeStep` from the recipe module
  to seed the batch step list at session start (snapshot), then never depends on
  it again — keeps an in-flight batch stable if the recipe changes.
- **ADR-0005**: batch/session data is product data → lives in `packages/api`
  (the product backend), never in the beer-encyclopedia service.
- New entities (Measurement/Observation/Alert) are the #605 deliverable; their
  TypeORM migrations are part of that issue, not this diagram.
