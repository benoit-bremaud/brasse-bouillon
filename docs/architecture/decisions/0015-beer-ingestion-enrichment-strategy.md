# ADR-0015 — Beer ingestion & enrichment strategy (multi-source → staging → human-gated promotion)

**Status**  Proposed
**Date**    2026-06-04
**Owners**  @benoit-bremaud

> Crystallizes the ingestion + enrichment strategy for the beer-encyclopedia:
> how scanned/looked-up bottles (and the breweries that make them) acquire
> data from external sources and become part of the canonical catalogue.
> Extends ADR-0013 (canonical `Beer` model + scan-catalogue reconciliation);
> realizes the already-modelled use cases UC4/UC5/UC6/UC9. Tracked by epic
> #1175.

---

## Context

- The beer-encyclopedia is the **canonical reference** of the product
  (ADR-0013): `Beer` (+ `Brewery`, `Style`) is the source of truth;
  `scan_catalog_items` is an explicitly **transitional cache**, reconciled
  into the canonical model.
- The conception (PR #1146) already models the acquisition use cases:
  **UC4** (barcode → OpenFoodFacts → upsert, delivered backend), **UC5**
  (label scan → identify → `Beer(source=scan, is_verified=false)` or
  `BeerDataSuggestion(pending)`), **UC6/UC9** (community corrections +
  moderation), the provenance/verification lifecycle
  (`05-state.md`: `Imported`/`Scanned` → `Verified`), and a **polymorphic,
  multi-source** `Source`/`EntitySource` model (`entity_type` + `external_id`,
  no FK; unique `(source_id, entity_type, external_id)` for idempotency).
- What was **not** yet decided: the ingestion + enrichment **strategy** — how
  many sources feed the catalogue, the trust boundary between a scan and the
  canonical truth, the promotion criterion, and sync vs async. A discovery
  session (2026-06-04) settled decisions **D1–D4** (below).
- Goal: grow the catalogue from **real usage** (crowd-sourcing) — every
  scanned bottle, after enrichment, should be capturable — **without**
  polluting the canonical truth with noisy/unverified data.

## Decision

**Adopt a multi-source → staging → human-gated promotion pipeline.**

1. **Staging first, then promotion (D1).** Every ingested `Beer`/`Brewery`,
   from any source, is written as **`is_verified = false`** (staging buffer).
   It is usable immediately to the contributing user but is **not** part of the
   shared canonical catalogue until promoted.

2. **No auto-promotion — human queue only (D4).** The transition
   `is_verified = false → true` is performed **only** by human moderation
   (UC9). There is **no** completeness/confidence auto-promotion criterion for
   now (KISS). This is revisited only if the moderation queue becomes a
   throughput bottleneck (#1153 priority-by-aggregation mitigates first).

3. **Source order (D2).** **OpenFoodFacts via EAN (UC4)** is the first and
   primary source — the machine is built and proven on the barcode path
   (already delivered backend). Craft **label/OCR (UC5)** and
   **web/directory/AI research** sources are plugged into the **same** machine
   afterward. Adding a source = a new `Source` row + an importer + a value in
   the `source` enum — **no schema change**.

4. **Insufficient data is staged, never rejected outright.**
   - Confident identification with **partial** fields → an **unverified
     `Beer`**. Only `name, slug, is_active, is_verified, source` are NOT NULL;
     all descriptive fields (abv, ibu, ebc, style, brewery, …) are nullable,
     so partial data does not block creation.
   - **Uncertain/partial** identification → a **`BeerDataSuggestion(pending)`**
     that goes to the moderation queue and **never touches** the canonical
     `Beer` until approved.

5. **Multi-source provenance.** Each source contribution is an `EntitySource`
   row, polymorphic over `Beer` **and** `Brewery`. One entity accumulates
   `EntitySource` rows across sources; provenance (`contributed_by/at`,
   `approved_at`) is recorded so every field is auditable.

6. **Research sources (web / AI) are importers, not exceptions.** Deeper
   enrichment — searching the web for more about the beer **and its brewery** —
   is implemented as an importer that returns candidate fields **+ cited source
   URLs + a confidence**. Provider-agnostic candidates: a **citation-first
   research API (e.g. Perplexity)** — preferred because it returns sources by
   construction — or an **LLM agent with web-search tool use (e.g. the Claude
   API)**. Non-negotiable constraints:
   - output is **always staged** (`is_verified = false`), never written
     directly to canonical;
   - the **cited URLs** are captured into `EntitySource` (provenance is
     "these sources", not "an AI said so");
   - fetched web content is **untrusted input** — agentic-AI security applies
     (prompt-injection from a malicious page; see the global `security-policy`).
     Tool output is never trusted to mutate canonical data;
   - enrichment runs **asynchronously** (return the partial/cache result
     immediately, enrich in the background) and is **cost-bounded + tiered**
     (#878).

## Consequences

- **The canonical catalogue stays trustworthy.** Nothing becomes official
  without a human decision (D4) — the deliberate cost is moderation throughput.
- **Crowd-sourcing works without pollution.** A scanned bottle is immediately
  useful (staged) and only graduates to shared truth once verified.
- **Sources are pluggable.** OFF, OCR, web, and AI all feed one pipeline via
  `Source`/`EntitySource`; new sources cost an importer, not a migration.
- **AI/web sources carry obligations**: provenance capture, async + tiering,
  and a security review (prompt injection, cost). The human gate is the safety
  net that makes a low-trust source acceptable.
- The `scan` value is not yet in the coded `Beer.source` enum (#1156); the
  one-line `05-state.md` note that `is_verified` only flips via moderation lands
  with the moderation endpoints (#1149, #1153/1154/1155).

## Alternatives considered

- **Auto-promotion by completeness/confidence score** — rejected for now (D4):
  more design + tuning, and it risks promoting plausible-but-wrong data
  (especially LLM-generated) into the source of truth. Deferred, not foreclosed.
- **Direct canonical writes from scans/sources** — rejected: violates ADR-0013
  (`scan_catalog` = transitional cache, `Beer` = canonical) and the trust
  boundary; would let any source pollute the truth.
- **Single source (OpenFoodFacts only)** — rejected: insufficient for the
  craft/micro-brewery target, which is largely absent from barcode/OFF data
  (the panoramic label path and research sources exist precisely for them).

## Realization

Tracked by **epic #1175**: UC5 ingestion (#1156, #1149), UC9 moderation queue
(#1153, #1154, #1155), maintainer admin UI (#1152), mobile UC4 wiring, and
abuse/tiering (#878).

## Relation to other ADRs

- **Extends ADR-0013** — canonical `Beer` model + scan-catalogue reconciliation.
- **Respects ADR-0004** (data locality) and **ADR-0005** (encyclopedia/product
  backend split): ingestion + enrichment live in the encyclopedia service.
- **Security** per the global `security-policy` (agentic-AI/LLM section) for the
  research/AI sources.
