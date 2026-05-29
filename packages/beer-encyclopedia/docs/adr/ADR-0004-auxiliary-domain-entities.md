# ADR-0004 — Auxiliary encyclopedia domain entities

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** Benoît Bremaud
- **Tags:** data-model, schema, encyclopedia

## Context

The initial schema (migration `001_initial_schema`) shipped, alongside the core
`Beer` / `Brewery` / `Style` tables, four auxiliary entities that were never
captured in an ADR: `TastingProfile`, `Ingredient` (+ `BeerIngredient`),
`Media`, and `CommunityCorrection`. This ADR records that decision
retroactively so the model has a written rationale (UML-first / decision
traceability debt repayment).

These entities exist in code and migrations today; this ADR documents the
as-built design, it does not introduce new tables.

## Decision

Keep the four auxiliary entities as part of the normalized knowledge-base model:

- **`TastingProfile`** — one-to-one with `Beer` (`beer_id` unique, `ON DELETE
  CASCADE`). Holds qualitative notes (aroma, appearance, flavor, mouthfeel,
  overall) and four 1–5 quantitative scales (bitterness, sweetness, body,
  carbonation), each guarded by a CHECK.
- **`Ingredient` + `BeerIngredient`** — many-to-many between beers and brewing
  ingredients, with a composite-PK junction carrying `amount` and `usage_phase`.
- **`Media`** — images attached to **exactly one** parent (beer XOR brewery),
  enforced by `ck_media_exactly_one_parent` (polymorphic-by-nullable-FK).
- **`CommunityCorrection`** — a write-side moderation queue: polymorphic
  `(entity_type, entity_id)` target (no FK), `status` ∈ `{pending, approved,
  rejected}`, reviewer fields. Persistence only — no API surface yet.

## Consequences

### Positive

- The normalized model can describe a beer fully (profile, ingredients, media)
  without denormalizing onto the `beers` row.
- `CommunityCorrection` reserves the moderation contract ahead of the v0.2
  contribution flow.

### Negative / trade-offs

- `CommunityCorrection` and `EntitySource` use polymorphic `(entity_type,
  entity_id)` with **no FK**, so referential integrity to the target row is not
  DB-enforced (accepted: keeps the audit/moderation tables decoupled).
- Tasting/ingredient/media entities have no CRUD endpoints yet — they are
  populated via cascade from `Beer` or left for a later API increment.

## Alternatives considered

- **JSON columns on `beers`** for tasting/ingredients/media: rejected — loses
  query-ability and the normalized FK guarantees.
- **A single generic `attributes` table**: rejected — erases type-specific
  CHECKs (1–5 scales, exactly-one-parent).

## Links

- `db/models/tasting_profile.py`, `db/models/ingredient.py`,
  `db/models/media.py`, `db/models/correction.py`
- `docs/diagrams/beer-encyclopedia/04-class.md` — class diagram
- `docs/diagrams/beer-encyclopedia/05-state.md` — correction lifecycle
- Issue #803 — community contribution / moderation flow (future)
