# Sequence diagram — recipe-difficulty — compute on save & read on display

> **Feature**: recipe difficulty badge (screen-review Tranche B)
> **Source specs**: `docs/architecture/specs/recipe-difficulty-algorithm.md`
> **Related ADRs**: ADR-0024, ADR-0002, ADR-0020
> **Decisions captured**: D1–D4 (ADR-0024)

## Context

The two flows that matter in time: (1) the backend **computes and stores** difficulty +
reasons when a recipe is created/updated (never on the client), and (2) the mobile **reads**
the stored effective level + reasons to render the badge and its tap-to-explain. Author
override is the branch on the write side. A simple read of a static field on other screens is
trivial and not diagrammed (proportionality).

## Diagram

```mermaid
sequenceDiagram
  actor Author as Author
  participant M as "Mobile (recipe editor)"
  participant API as "API — RecipeService"
  participant DS as "API — DifficultyService"
  participant DB as "DB (recipe + sub-entities)"
  actor Novice

  Note over Author,DB: Write path — compute on create/update
  Author->>M: Save recipe (fields, optional override)
  M->>API: "POST/PUT /recipes"
  API->>DS: "compute(recipe, yeast, hops, water, stats)"
  DS->>DS: "yeastClass + per-factor tiers F1..F6 (F5 deferred, all-grain baseline)"
  DS->>DS: "tier = max(f1..f6), +1 if ≥3 at tier 1 (capped) — reasons: all firing factors"
  DS-->>API: "{ computed, reasons[] }"
  API->>DB: "persist difficulty_computed + difficulty_reasons (+ override if set)"
  API-->>M: "recipe with effective difficulty (override ?? computed) + reasons"

  Note over Novice,DB: Read path — render badge + tap-to-explain
  Novice->>M: Open recipe / list
  M->>API: "GET /recipes(/:id)"
  API-->>M: "effectiveDifficulty + reasons[] (no client compute)"
  M->>Novice: "badge (green/amber/red)"
  Novice->>M: "tap badge"
  M->>Novice: "« Avancé car : … » (stored reasons)"
```

## Notes

- **Compute is server-side only** (ADR-0002 / ADR-0020) — the mobile never runs the rules; it
  consumes `effectiveDifficulty` + `reasons`. This is the anti-pattern the diagram makes
  visible: any client-side difficulty computation would be a bug.
- `reasons[]` is **stored** on write (not recomputed on read) so tap-to-explain is a plain read
  (ADR-0024 D3).
- **Override branch**: if the author set `difficulty_override`, the API returns it as the
  effective level but keeps `difficulty_computed` for the « calculé : … » hint.
- The `compute()` call is synchronous within the create/update transaction — difficulty is a
  pure function of the recipe, so no async job is warranted (ADR-0001, YAGNI).
