# ADR-0006 — Beer-duel preference data is product/social data → owned by NestJS

**Status**  Accepted
**Date**    2026-05-21
**Owners**  @benoit-bremaud

> Refines [ADR-0005](0005-backend-split-encyclopedia-vs-product.md) for the
> specific case of community preference data. ADR-0005 already classifies
> "feedback, ratings, social features" as NestJS-owned and states the
> Python encyclopedia "carries no user data". This ADR applies that split
> to the beer-duel feature and records the one genuine tension it raises.

---

## Context

The beer-duel feature (spec [`docs/architecture/specs/beer-duel.md`](../specs/beer-duel.md))
collects pairwise preferences: the user is shown two beers and taps the one
they prefer. Each tap produces a **vote** tied to `users.id`; votes feed a
per-beer **Elo score**, and the descending-score order is the community
**ranking**.

Two backends could plausibly host this data:

- **NestJS product backend** — owns `users`, sessions, and (per ADR-0005)
  "feedback, ratings, social features".
- **Python beer-encyclopedia** — owns beer *facts* (`beers`, `breweries`,
  `styles`, `tasting_profiles`, `community_corrections`) and explicitly
  **carries no user data**.

The tension: a vote is a *user* event (belongs in NestJS), but an aggregate
Elo ranking is arguably a *fact about a beer* (the kind of thing the
encyclopedia exists to hold). We must decide where votes live, where the
derived score lives, and how the beer is referenced across the boundary.

---

## Decision

**Votes and their derived Elo scores live in the NestJS product backend.**

- `beer_duel_votes` (one row per vote, carries `user_id`) — NestJS.
- `beer_elo_scores` (one aggregate row per beer, no user data) — NestJS.
- The Elo transaction is computed **server-side in NestJS**; the client
  sends only the chosen `winner_id` (or `null` for a cancelled match).

**The beer reference is a cross-backend pointer, not a hard foreign key.**

- `beer_a_id`, `beer_b_id`, `winner_id`, and `beer_elo_scores.beer_id`
  point at the beer corpus: `scan_catalog_items.id` transitionally,
  `beers.id` (Python) at v0.2+ once the corpus migrates per ADR-0005.
- Referential integrity across the NestJS↔Python boundary is enforced in
  application code, never as a database FK (consistent with ADR-0005).
- Only `beer_duel_votes.user_id → users.id` is a real in-database FK
  (same NestJS database).

**Rationale.** Votes carry PII (`user_id`); the encyclopedia carries no user
data, so votes *cannot* live there. The Elo score is downstream of those
votes and changes on every product interaction, so co-locating it with the
votes (NestJS) avoids a cross-backend write path on the hot vote route.

---

## Escape hatch (deferred, not built now)

The `beer_elo_scores` aggregate carries **no** user data — so if the
community ranking ever becomes a *public beer fact* worth exposing through
the encyclopedia (e.g. "community-favourite" surfaced on a public beer page),
the aggregate **may be promoted/replicated to Python** as a read-model, while
the raw votes stay in NestJS. That promotion would be its own ADR. We do not
build it now: it is speculative until the ranking has real volume (v0.2+).

---

## Consequences

### Positive

- **No PII in the encyclopedia** — ADR-0005's "no user data" invariant holds.
- **No cross-backend write on the vote route** — the hot path stays within
  one database and one transaction.
- **Clear ownership** — "where does a vote go?" has a one-word answer (NestJS).

### Trade-offs

- **Beer reference integrity is application-enforced**, not DB-enforced — a
  deleted/merged beer in the corpus can leave dangling references; the
  service must tolerate and reconcile (same class of problem as ADR-0005's
  cross-backend references).
- **The aggregate ranking is not where beer facts live** — if/when it becomes
  a public fact, a promotion step (and ADR) is required. Accepted as deferred.

### Rejected alternatives

- **Store votes in Python** — violates "encyclopedia carries no user data".
- **Store votes in NestJS but the Elo score in Python** — splits a single
  derivation across two databases and forces a cross-backend write on every
  vote. No upside until the ranking is public.
- **Hard FK from `beer_*_id` to a beers table** — impossible across the
  NestJS↔Python boundary (ADR-0005); would couple the two schemas.

---

## References

- [ADR-0005](0005-backend-split-encyclopedia-vs-product.md) — backend split;
  classifies "ratings, social features" as NestJS, "no user data" in Python.
- [ADR-0002](0002-centralized-nestjs-backend.md) — mobile egress through a
  single integration surface.
- [ADR-0003](0003-consent-single-source-of-truth.md) — consent governs
  whether the social pop-up may show.
- Spec [`docs/architecture/specs/beer-duel.md`](../specs/beer-duel.md) and the
  beer-duel UML set in [`docs/architecture/diagrams/beer-duel/`](../diagrams/beer-duel/).
