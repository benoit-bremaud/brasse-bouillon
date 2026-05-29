# ADR-0005 — Deterministic recipe-recommendation scoring

- **Status:** Accepted
- **Date:** 2026-05-29
- **Deciders:** Benoît Bremaud
- **Tags:** ml, scan, recommendation, algorithm

> **Note on numbering:** this is the **package-local** ADR-0005
> (`packages/beer-encyclopedia/docs/adr/`). It is distinct from the
> **repo-level** ADR-0005 (backend split, `docs/architecture/decisions/`).

## Context

The scan pipeline ranks candidate recipes from the fields extracted off a label
(`ml/recommender.py`). The scoring weights and match rules were chosen in code
but never recorded. This ADR captures the as-built algorithm.

## Decision

Rank each recipe with a deterministic weighted score (no trained model):

```
score = 0.60 · style_score + 0.25 · abv_score + 0.15 · ibu_score
```

- **`style_score`** — exact style match = 1.0; close family = 0.6; distant = 0.15;
  recipe has a style but none was extracted = 0.35.
- **`abv_score`** — `max(0, 1 − gap / 5.0)` where `gap` is the absolute ABV
  difference (a 5-point gap scores 0).
- **`ibu_score`** — neutral (0.5) when the recipe carries an IBU, since the
  extractor does not reliably recover IBU from labels.

Return the top `n` (default 3) with their match reasons. Recipes come from the
bundled `data/recipes.sample.json`, decoupled from the `beers` catalog.

## Consequences

### Positive

- Deterministic, explainable, and testable without an ML training loop.
- Style dominates (0.60), matching the intuition that style is the strongest
  signal a label reliably yields.

### Negative / trade-offs

- Hand-tuned weights, not learned — quality is bounded by the heuristic.
- IBU contributes little signal today (neutral score).
- Sample-file recipes, not live catalog data — recommendations do not reflect
  the encyclopedia's actual beers yet.

## Alternatives considered

- **Embedding / learned ranker**: rejected for v0.1 — needs labelled data and
  serving infrastructure; premature.
- **Style-only match**: rejected — discards the useful ABV proximity signal.

## Links

- `ml/recommender.py`, `data/recipes.sample.json`
- `docs/diagrams/beer-encyclopedia/02-sequence-scan.md`
- ADR-0001 (detection-first) — defers ranking refinement
