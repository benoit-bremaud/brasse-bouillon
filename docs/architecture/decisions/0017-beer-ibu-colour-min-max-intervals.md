# ADR-0017 — Beer IBU and colour stored as min/max intervals (honest beer-level uncertainty)

**Status**  Proposed
**Date**    2026-06-05
**Owners**  @benoit-bremaud
**Relates** epic #1175 (enrichment). Builds on [ADR-0013](0013-beer-canonical-model-and-conception-order.md) (canonical model), [ADR-0015](0015-beer-ingestion-enrichment-strategy.md) (ingestion/veracity), [ADR-0016](0016-recipe-equivalence-matching-v2.md) (matching consumes these numerics). Conception: [`../diagrams/beer-encyclopedia/04-class.md`](../diagrams/beer-encyclopedia/04-class.md). Related caveat: [`../specs/scan-algorithms.md`](../specs/scan-algorithms.md) §8.5.

> Scope: the **`Beer`** entity's `ibu` and colour only. `abv` is unchanged (scalar). `Recipe` numerics are unchanged (see D-scope below).

## Context

Manual end-to-end scan tests on real bottles (La Goudale Ambrée, BrewDog Hazy Jane, Leffe Blonde) repeatedly showed that **IBU and colour are almost never officially published**, and when several sources do quote them they disagree — e.g. Leffe Blonde IBU was found as **20, 21.5 and 28** across sources, with no authoritative figure from the brewer. Storing a single integer (`Beer.ibu = 20`) is **false precision**: it presents one arbitrary point as if it were the fact.

Two existing facts make the fix obvious:

1. **The model is already asymmetric.** The `Style` entity already stores `abv_min/max`, `ibu_min/max`, `srm_min/max` — style numerics are ranges. But `Beer` stores single `abv`, `ibu`, `srm`. A *beer's* bitterness/colour is at least as uncertain as a *style's*; the single-point storage on `Beer` is the anomaly.
2. **ADR-0016** established that OpenFoodFacts rarely carries IBU/SRM and that downstream consumers (the matcher) must stay honest about coverage rather than invent precision. It explicitly **deferred imputing** a beer's colour/IBU band from its style family.

This ADR makes `Beer`'s two uncertain numerics honest by reusing the range pattern `Style` already uses.

## Decision

### D1 — `Beer.ibu` and `Beer.srm` become min/max intervals

Replace the single columns with:

- `ibu_min` / `ibu_max` (`SmallInteger`, nullable)
- `srm_min` / `srm_max` (`SmallInteger`, nullable)

This mirrors `Style`'s existing column **types** (`Style.ibu_min/max` + `srm_min/max` are already `SmallInteger`).

**Rounding rule (integer columns).** Values are stored as integers. When a source quotes a decimal (e.g. Leffe `21.5`), round **outward** to the bracketing integers — `min = floor(value)`, `max = ceil(value)` — so `21.5` becomes `21–22`, keeping the interval honestly conservative rather than inventing a precise point. An integer single-source value stays `min == max` (D2); only decimals widen to a 1-unit interval.

`abv` stays a single `Numeric(4,2)` — it is almost always printed exactly on the label, so an interval would add complexity for no honesty gain (scope decision, 2026-06-05). `Style` keeps `abv_min/max` because *styles* genuinely span a strength band — a different rationale.

### D2 — The interval is self-describing; no per-field "estimated" flag

`Beer` has no `is_*_estimated` columns and gains none. The interval encodes uncertainty directly:

- `min == max` → a single known value (e.g. an official `32–32`).
- `min < max` → a genuine range (e.g. Leffe `20–28`).
- both `NULL` → unknown.

Trust/provenance stays on the **existing** `source` + `is_verified` fields. A single sourced-but-unverified value is `min == max` with `is_verified = false`. We deliberately do **not** add a confidence float (the range width already carries the uncertainty signal — YAGNI).

### D3 — Canonical colour unit is **SRM**; EBC is a display conversion

The stored columns stay in **SRM** (consistent with the prior `Beer.srm` and with `Style.srm_min/max`). EBC is derived at presentation time via the canonical SRM↔EBC mapping (`vocab-mapping`). No EBC column is added. (The product-side scan cache uses `color_ebc`; see Consequences.)

### D4 — No imputation from the style family

A `Beer` with no IBU does **not** inherit its `Style.ibu_min/max` into its own columns. The style range may be shown as a **read-time display fallback** ("typical for this style"), computed on read and **never persisted** onto the beer. This keeps ADR-0016's deferral intact: beer-level data stays beer-level; style ranges stay style-level.

### D5 — Validation follows the ABV CHECK pattern on `Style`

New CHECK constraints on `Beer`, following the **ABV CHECK pattern already on `Style`** (`ck_styles_abv_min_positive` / `ck_styles_abv_max_positive` / `abv_min ≤ abv_max`): `ibu_min ≤ ibu_max`, `srm_min ≤ srm_max`, each `≥ 0` when non-NULL.

> Note: `Style` today constrains only `abv`; its `ibu_min/max` + `srm_min/max` columns carry **no** CHECKs yet. These IBU/SRM CHECKs are therefore **new work** on `Beer` (not a copy of an existing `Style` constraint). Adding the matching CHECKs to `Style.ibu/srm` for symmetry is a consistent, optional follow-up.

## Out of scope (deferred, captured)

- **ABV intervals** — kept scalar; revisit only if batch-variance demand appears.
- **Style-range display fallback (D4)** — a UI/read-model concern; depends on `Style` ranges being seeded (the BJCP work under ADR-0016). Not built here.
- **A SRM/EBC unit toggle in the UI** — display concern, later.
- **Recipe numerics** — `Recipe` IBU/colour are *computed* from the grain bill + hop schedule (deterministic), not observed; they stay scalar. The Beer≠Recipe split is preserved.
- **Reconciling the product-side `ScanCatalogItem`** (NestJS cache: `color_ebc` + `is_*_estimated`) with this interval model — tracked as a follow-up, not solved here (see Consequences).

## Consequences

- **Beer model** (`packages/beer-encyclopedia/db/models/beer.py`): drop `ibu`/`srm`, add `ibu_min/max` + `srm_min/max` with CHECK constraints; a migration is cheap **now** (no canonical beer seed yet, dynamic ingestion, `is_verified` staging — ADR-0001 "build for today"). The class diagram `04-class.md` is updated (both representations) as part of this ADR.
- **Enrichment** (ADR-0015): when sources disagree (Leffe 20/21.5/28), the pipeline records `ibu_min = 20`, `ibu_max = 28` instead of arbitrating to one figure — a more faithful enrichment output. Single-source results record `min == max`.
- **Matcher** (ADR-0016): can refine colour/IBU similarity to interval overlap rather than point distance — a future refinement, non-blocking.
- **Shape mismatch to flag**: the transitional product-side `ScanCatalogItem` (ADR-0005) keeps `color_ebc` + `is_color_ebc_estimated`. The canonical `Beer` (the source of truth, ADR-0013) now diverges in shape. This is acceptable while the scan module is transitional, but the eventual cutover must map intervals ↔ the product cache. Captured as a follow-up under epic #1175.

## Sources

- **BJCP 2021 — "where did those numbers come from"**: vital stats (OG/FG/IBU/SRM/ABV) are guideline *ranges*, not fixed values — bjcp.org/faq
- **Empirical (this project)**: scan tests on La Goudale, BrewDog Hazy Jane, Leffe Blonde — IBU/colour absent from labels and divergent across web sources (Leffe IBU 20 / 21.5 / 28).
- **Existing precedent**: the encyclopedia `Style` model already represents `ibu_min/max` + `srm_min/max` + `abv_min/max` — this ADR extends that accepted pattern to `Beer`.
