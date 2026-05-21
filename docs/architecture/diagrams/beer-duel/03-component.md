# Component diagram — beer-duel — structural decomposition

> **Feature**: epic `epic(beer-duel)` — community beer preference ranking via pairwise duels.
> **Source specs**: [`docs/architecture/specs/beer-duel.md`](../../specs/beer-duel.md) §4 (dependencies).
> **Related ADRs**: [ADR-0002](../../decisions/0002-centralized-nestjs-backend.md), [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md), [ADR-0009](../../decisions/0009-beer-duel-preference-data-ownership.md).
> **Companion**: [01-use-case.md](01-use-case.md) (the *what*; this is the *how it is structured*).

## Context

How the feature is decomposed across packages. This is the right place for the Mobile / NestJS split — the [use-case diagram](01-use-case.md) deliberately keeps it out (UML 2.5 orthodoxy). Per ADR-0009, votes and Elo scores live in the **NestJS product backend**; the beer reference is a cross-backend pointer (transitionally NestJS `scan_catalog_items`, target Python `beers`).

## Diagram

```mermaid
flowchart TB
    subgraph Mobile ["packages/mobile-app"]
        Modal["BeerDuelModal<br/>(presentation)"]
        UseCase["beer-duel.use-cases<br/>(application)"]
        ApiData["beer-duel.api<br/>(data)"]
        Storage["beer-duel.storage<br/>(cooldown flag, AsyncStorage)"]
        Http["core/http/http-client.ts<br/>(sole egress)"]
        Dashboard["DashboardScreen<br/>(host)"]
    end

    subgraph NestJS ["packages/api (product backend)"]
        Controller["BeerDuelController<br/>POST /beer-duels/vote<br/>GET /beer-duels/next<br/>GET /beer-duels/ranking"]
        Service["BeerDuelService<br/>(Elo + weighted pairing)"]
        VoteRepo[("beer_duel_votes")]
        ScoreRepo[("beer_elo_scores")]
        Auth["JwtAuthGuard"]
    end

    subgraph Corpus ["Beer corpus (cross-backend reference)"]
        Catalog[("scan_catalog_items<br/>(NestJS, transitional)")]
        Beers[("beers<br/>(Python, v0.2+ target)")]
    end

    Dashboard --> Modal
    Modal --> UseCase
    UseCase --> ApiData
    UseCase --> Storage
    ApiData --> Http
    Http -->|HTTPS| Controller
    Controller --> Auth
    Controller --> Service
    Service --> VoteRepo
    Service --> ScoreRepo
    Service -.->|reads beer ref| Catalog
    Service -.->|v0.2+| Beers

    classDef mobile fill:#FCB,stroke:#333,color:#000
    classDef api fill:#9CC,stroke:#333,color:#000
    classDef store fill:#CFC,stroke:#333,color:#000
    class Modal,UseCase,ApiData,Storage,Http,Dashboard mobile
    class Controller,Service,Auth api
    class VoteRepo,ScoreRepo,Catalog,Beers store
```

## Notes

- **Single egress point.** All API traffic goes through [`core/http/http-client.ts`](../../../packages/mobile-app/src/core/http/http-client.ts) per ADR-0002 + the root CLAUDE.md forbidden-patterns rule. The `data` layer never calls `fetch()` directly.
- **Layering.** `presentation → application → data` is enforced: the modal never imports `beer-duel.api` directly, it goes through `beer-duel.use-cases` (mirrors the `features/batches/{data,application}` pattern).
- **Votes & Elo in NestJS, not Python.** Per ADR-0009: votes carry `user_id` and the Python encyclopedia carries no user data. The aggregate ranking *could* later be promoted to the encyclopedia as a public beer fact — tracked as an ADR-0009 escape hatch, not built now.
- **Beer reference is not a hard FK.** `Service` resolves the beer reference against `scan_catalog_items` today and `beers` at v0.2+; referential integrity across the package boundary is the application's responsibility (ADR-0005), shown as a dashed dependency.
