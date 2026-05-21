# Class diagram — beer-duel — domain entities

> **Feature**: epic `epic(beer-duel)` — community beer preference ranking via pairwise duels.
> **Source specs**: [`docs/architecture/specs/beer-duel.md`](../../specs/beer-duel.md) §3 (rules), §4 (dependencies).
> **Related ADRs**: [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md), [ADR-0009](../../decisions/0009-beer-duel-preference-data-ownership.md).
> **Companion**: [03-component.md](03-component.md).

## Context

Domain entities owned by the **NestJS product backend** (per ADR-0009). The beer reference is a cross-backend pointer, **not** a hard foreign key.

This diagram does **not** show behaviour (see [02 sequence](02-sequence-vote.md)), packages (see [03 component](03-component.md)), or the pop-up lifecycle (see [05 state](05-state-duel-session.md)).

## Diagram

```mermaid
classDiagram
    class BeerDuelVote {
        +UUID id
        +UUID user_id  /* FK -> users.id (NestJS) */
        +UUID beer_a_id  /* cross-backend ref */
        +UUID beer_b_id  /* cross-backend ref */
        +UUID winner_id  /* beer_a_id | beer_b_id | NULL (cancelled match) */
        +Datetime created_at
    }

    class BeerEloScore {
        +UUID beer_id  /* cross-backend ref, unique */
        +Float score  /* default 1500 */
        +Int exposure_count  /* shown count: win + loss + cancelled */
        +Datetime updated_at
    }

    %% External, referenced by id only (no hard FK across boundaries)
    class User {
        +UUID id
    }
    class BeerRef {
        +UUID id  /* scan_catalog_items.id today, beers.id at v0.2+ */
    }

    User "1" o-- "0..*" BeerDuelVote : casts
    BeerDuelVote ..> BeerRef : references beer_a / beer_b / winner
    BeerEloScore ..> BeerRef : scores

    classDef product fill:#9CC,stroke:#333,color:#000
    classDef external fill:#FFC,stroke:#666,stroke-dasharray: 4 4,color:#000
    class BeerDuelVote,BeerEloScore product
    class User,BeerRef external
```

## Notes

- **`winner_id` nullability encodes the cancelled match.** `NULL` = "I know neither" (no Elo change, exposure counted). A non-null `winner_id` MUST equal `beer_a_id` or `beer_b_id` — enforce in the service, not just the schema.
- **`BeerEloScore.beer_id` is unique** (one score row per beer). It is created lazily at first exposure with `score = 1500`, `exposure_count = 0`.
- **Cross-backend references are dashed.** `beer_a_id`, `beer_b_id`, `winner_id`, and `BeerEloScore.beer_id` point at the beer corpus (`scan_catalog_items` today, `beers` at v0.2+). They are **not** DB foreign keys — integrity is the application's responsibility per ADR-0005. Only `BeerDuelVote.user_id → users.id` is a real in-database FK (same NestJS database).
- **No per-user score table.** The Elo score is a *global* community signal; there is intentionally no per-user ranking entity. Per-user taste profiles, if ever wanted, would be a separate feature + ADR.

### Anti-patterns this diagram makes visible

- **A hard FK from `beer_a_id` to a beers table.** Forbidden across the NestJS↔Python boundary (ADR-0005). If both ever live in the same database, revisit via ADR.
- **Storing the Elo score on the vote row.** The vote is an immutable event; the score is mutable aggregate state. Keep them in separate entities — never denormalise the running score onto the vote.
- **A `winner_id` not in `{beer_a_id, beer_b_id, NULL}`.** Would be a bug; validate server-side.
