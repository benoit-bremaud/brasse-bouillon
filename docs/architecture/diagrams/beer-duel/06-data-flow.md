# Data-flow diagram — beer-duel — field-level + PII

> **Feature**: epic `epic(beer-duel)` — community beer preference ranking via pairwise duels.
> **Source specs**: [`docs/architecture/specs/beer-duel.md`](../../specs/beer-duel.md) §3 (rules).
> **Related ADRs**: [ADR-0003](../../decisions/0003-consent-single-source-of-truth.md), [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md), [ADR-0006](../../decisions/0006-beer-duel-preference-data-ownership.md).

## Context

What data crosses each boundary, which fields are PII, and where they come to rest. The single PII field is `user_id` (links a preference to a person); it never leaves the NestJS product database.

## Diagram

```mermaid
flowchart LR
    subgraph Mobile ["Mobile"]
        Tap["User tap<br/>(card | 'ni l'une ni l'autre' | cross)"]
        CD["cooldown flag<br/>(local only)"]
    end

    subgraph Wire ["HTTPS payload"]
        ReqNext["GET /beer-duels/next<br/>(auth header)"]
        ReqVote["POST /beer-duels/vote<br/>{ duelId, winnerId? }"]
        RespNext["{ duelId, beerA, beerB }"]
    end

    subgraph API ["NestJS product backend"]
        Pair["Weighted pairing"]
        Elo["Elo update"]
    end

    subgraph Store ["NestJS database"]
        Votes[("beer_duel_votes<br/>id, USER_ID 🔒, beer_a_id,<br/>beer_b_id, winner_id, created_at")]
        Scores[("beer_elo_scores<br/>beer_id, score, exposure_count, updated_at")]
    end

    Tap --> ReqVote
    ReqVote --> Elo
    Elo --> Votes
    Elo --> Scores
    Pair --> RespNext
    ReqNext --> Pair
    RespNext --> Tap
    Tap -.-> CD

    classDef pii fill:#E99695,stroke:#900,color:#000
    classDef store fill:#9CC,stroke:#333,color:#000
    classDef local fill:#CFC,stroke:#333,color:#000
    class Votes,Scores store
    class CD local
```

## Notes

- **🔒 `user_id` is the only PII** in this feature. It lives exclusively in `beer_duel_votes` (NestJS), never sent to the Python encyclopedia (which "carries no user data", ADR-0005). The `beer_elo_scores` aggregate carries **no** user data — which is exactly what makes it eligible for a later promotion to the public encyclopedia (ADR-0006 escape hatch).
- **The cooldown flag never leaves the device.** It is UX state, not analytics; no server round-trip.
- **Dismissals produce no wire traffic.** Closing via the cross writes only the local cooldown — no row, no PII, nothing.
- **Cancelled matches store `winner_id = NULL`** with `user_id` still attached. This is preference *abstention*, not anonymity — same PII handling as a real vote, but zero Elo effect.
- **Consent (ADR-0003).** Participation is authenticated and user-initiated; if a global consent toggle governs "social features", the duel pop-up must honour it before showing. Flag during P3 implementation.
