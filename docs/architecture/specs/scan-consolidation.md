# Scan feature — backlog consolidation (2026-05-07)

> **Status:** consolidation snapshot — no implementation phasing in this document.
> A development plan, sequenced by phases and milestones, will be written
> separately once the inventory below is stable.

## 1. Why this document exists

Over a 15-day window the scan feature accumulated four epics, ~25 sub-issues and
satellite issues, one merged algorithmic specification ([scan-algorithms.md](scan-algorithms.md))
and two structuring ADRs ([ADR-0004](../decisions/0004-data-locality-hybrid-principle.md),
[ADR-0005](../decisions/0005-backend-split-encyclopedia-vs-product.md)). The
material is dispersed across the issue tracker. This document is the single
visible artefact any contributor (human or automated) reads to understand the
scan feature as a whole *before* touching any of it.

It is intentionally **agent-agnostic** and contains no AI tool attribution.

## 2. Canonical decree (the rule that triggers everything)

When the user scans a beverage, the app first attempts a barcode lookup against
the Brasse-Bouillon catalogue and OpenFoodFacts. The decision tree from
[scan-algorithms.md §2](scan-algorithms.md#2-decision-tree--which-scan-mode-runs-when):

```
Barcode lookup → no data anywhere    → AUTO-SWITCH silently to label scan
                                         (one-line banner explaining why)
Barcode lookup → ratio ≥ 0.5         → DISPLAY only, no panoramic prompt
Barcode lookup → ratio < 0.5         → enrichment + non-blocking prompt
                                         "Données partielles. Veux-tu compléter
                                          via le scan d'étiquette ?"
```

Every implementation decision in the inventory below is constrained by this
rule.

## 3. Structuring constraints

| Constraint | Source | Implication |
|---|---|---|
| Backend split: catalogue tables (`scan_catalog_items`, `beer_data_suggestions`, `panoramic_capture`) live in **Python beer-encyclopedia** (Postgres). NestJS owns user-side concerns (auth, sessions, `notifications`). Mobile talks to both. | [ADR-0005](../decisions/0005-backend-split-encyclopedia-vs-product.md) | Any new catalogue / ML / enrichment work goes to Python. The current NestJS `scan/` module is transitional and on a deprecation roadmap. |
| Mobile stays on **Expo Managed pure** (no eject, no custom dev client) | [scan-algorithms.md §6](scan-algorithms.md#6-tech-stack-constraints--expo-managed-pure) | Heavy computer-vision work runs on the backend. The on-device flow uses `expo-camera` + `expo-sensors` + pure-JS perceptual hashing. |
| **Persistence imperative** (since 2026-05-04) | Project memory | No demo-mode-only builds. Every new scan-related feature persists from day one. |
| **UI stays French**, code / commits / PRs / issue bodies stay English | Project memory | UX copy in `scan-algorithms.md §5` is the canonical French source. |
| **Target audience = craft / micro-brewery beers** — panoramic scan is the *primary* recognition path, not a fallback | Product framing | Mainstream beers (Heineken, Leffe, Punk IPA) resolve via OpenFoodFacts barcode lookup in ~200 ms. Craft / micro-brewery beers are almost never indexed in OFF, so the auto-switch to panoramic scan fires *as the nominal flow*. Capture quality (#945–#947) and the enrichment pipeline (#934) are demo-essential for the target user, not stretch goals. |

## 4. Inventory of related artefacts

### 4.1 Active epics (4)

| # | Epic | Role |
|---|---|---|
| [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) | Smart bottle photo capture — guided panoramic capture for cylindrical labels | Core epic for the panoramic capture itself |
| [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) | Incomplete-record enrichment with maintainer validation workflow | Shared pipeline — fed by both scan d'étiquette and below-threshold barcode lookups |
| [#803](https://github.com/benoit-bremaud/brasse-bouillon/issues/803) | Community contribution flow — guided 4-photo bottle tour | Reuses the panoramic capture infrastructure to enrich the catalogue with a different downstream destination |
| [#878](https://github.com/benoit-bremaud/brasse-bouillon/issues/878) | Rate-limit + freemium tiering | Defensive guard-rail — protects against OFF rate-limits, finances the recurring Cloud Vision / Claude cost |

### 4.2 Sub-issues under epic [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751)

Filed 2026-05-07 from [scan-algorithms.md §9](scan-algorithms.md#9-implementation-roadmap-sub-issues-to-file-under-751).

| # | Title | Spec phase | Depends on |
|---|---|---|---|
| [#944](https://github.com/benoit-bremaud/brasse-bouillon/issues/944) | Tech-spike: Expo Managed camera burst + JS hashing + tesseract.js benchmarks | — | — |
| [#945](https://github.com/benoit-bremaud/brasse-bouillon/issues/945) | Pre-capture screen — silhouette + distance/blur indicators + Commencer CTA | Phase 1 | #944 |
| [#946](https://github.com/benoit-bremaud/brasse-bouillon/issues/946) | Burst capture loop + frame deduplication + gyro progress gauge | Phase 2 | #944 |
| [#947](https://github.com/benoit-bremaud/brasse-bouillon/issues/947) | Loop-closure detection + auto end-of-capture | Phase 3 | #946 |
| [#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948) | Backend stitching service + frame upload endpoint (Python beer-encyclopedia) | Phase 5 | — |
| [#949](https://github.com/benoit-bremaud/brasse-bouillon/issues/949) | Server-side OCR via Cloud Vision (Python) | Phase 6 | #948 |
| [#950](https://github.com/benoit-bremaud/brasse-bouillon/issues/950) | Multimodal Claude pass + handoff to shared enrichment pipeline | Phase 7 | #949, #938 |
| [#951](https://github.com/benoit-bremaud/brasse-bouillon/issues/951) | `panoramic_capture` entity + Alembic migration + repository | Phases 5–8 | #948 |
| [#952](https://github.com/benoit-bremaud/brasse-bouillon/issues/952) | Decision-tree wiring on the mobile side (auto-switch / prompt / no panoramic) | §2 | #936, #945 |

### 4.3 Sub-issues under epic [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934)

> **ADR-0005 reconciliation tracking:** these sub-issues were filed before ADR-0005
> and are scoped against the legacy NestJS `scan/` module. Migration to Python
> beer-encyclopedia (where applicable) is tracked in
> [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) — see §4.4.

| # | Title | Depends on |
|---|---|---|
| [#935](https://github.com/benoit-bremaud/brasse-bouillon/issues/935) | Extend `scan_catalog_items` schema with OFF fields currently dropped | — |
| [#936](https://github.com/benoit-bremaud/brasse-bouillon/issues/936) | Completeness ratio + below-threshold UI signal | #935 |
| [#937](https://github.com/benoit-bremaud/brasse-bouillon/issues/937) | `BeerDataSuggestion` entity + read-only admin endpoints | #935 |
| [#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938) | Multi-source enrichment pipeline (Brave + 2nd web + Claude) producing PENDING suggestions | #936, #937 |
| [#939](https://github.com/benoit-bremaud/brasse-bouillon/issues/939) | In-app notification system + bell icon for pending beer suggestions | #937 |
| [#940](https://github.com/benoit-bremaud/brasse-bouillon/issues/940) | Admin review screen with approve / refuse / refine / instruct actions | #937, #938, #939 |
| [#941](https://github.com/benoit-bremaud/brasse-bouillon/issues/941) | `EnrichmentRevision` chain to track refinement / re-prompts | #938, #940 |
| [#942](https://github.com/benoit-bremaud/brasse-bouillon/issues/942) | Caching, rate limiting, cost monitoring for the enrichment pipeline | #938 |

The two epics converge at [#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938)
(shared enrichment pipeline) and [#940](https://github.com/benoit-bremaud/brasse-bouillon/issues/940)
(shared review screen).

### 4.4 Cross-cutting open issues

| # | Topic | Disposition |
|---|---|---|
| [#870](https://github.com/benoit-bremaud/brasse-bouillon/issues/870) | OFF mapping discards 80 % of useful fields (abv, style, ingredients, allergens, image) | Quick win — landing this immediately upgrades the demo without waiting on the panoramic chain |
| [#874](https://github.com/benoit-bremaud/brasse-bouillon/issues/874) | "Suggest a correction" CTA appears on the not-found screen where it makes no sense | Quick win — low-effort UX cleanup |
| [#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642) | Demo assets (4-6 real bottles + Demo override fallback) | Soutenance safety net |
| [#538](https://github.com/benoit-bremaud/brasse-bouillon/issues/538) | Live scan challenge for the soutenance "coup de coeur" | Soutenance |
| [#702](https://github.com/benoit-bremaud/brasse-bouillon/issues/702) | Demo script (90 s) + screencast fallback | Soutenance |
| [#932](https://github.com/benoit-bremaud/brasse-bouillon/issues/932) | Refactor `BeerCatalogProvider` interface (DIP) | Tech-debt — clears the way for #936 to inject the provider cleanly |
| [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) | ADR-0005 reconciliation for #934 sub-issues | Tracking — retitle / relabel / rebody #935 / #937 / #938 / #941 / #942 / #936 to match the ADR-0005 backend split (Python beer-encyclopedia for catalog work, NestJS for user-side) |
| [#859](https://github.com/benoit-bremaud/brasse-bouillon/issues/859) | CLIP + pgvector visual recognition fallback | Out of scope of the panoramic MVP — flagged as v0.3+ |
| [#832](https://github.com/benoit-bremaud/brasse-bouillon/issues/832) | Creator gallery / label design history | Adjacent epic, not a blocker |

### 4.5 Triage performed on 2026-05-07

- [#858](https://github.com/benoit-bremaud/brasse-bouillon/issues/858) — closed as superseded by #945 / #946 / #947 (CamScanner-like behaviour fully covered by Phases 1–3 of the spec).
- [#639](https://github.com/benoit-bremaud/brasse-bouillon/issues/639) — closed as merged into #945; its acceptance criteria (33 cl / 44 cl / 75 cl silhouette validation + optional darker out-of-frame mask) absorbed.
- [#803](https://github.com/benoit-bremaud/brasse-bouillon/issues/803) — commented to make explicit that the community contribution flow reuses #948 (frame upload + stitching), #951 (`panoramic_capture` entity), and #947 (loop-closure); the differentiator is the downstream destination (`community_submission` instead of `beer_data_suggestions`).

### 4.6 Closed issues retained for context

- [#594](https://github.com/benoit-bremaud/brasse-bouillon/issues/594) — recognition pipeline v1 (closed)
- [#693](https://github.com/benoit-bremaud/brasse-bouillon/issues/693) — DB schema for Scan Tranche 2 (closed)
- [#794](https://github.com/benoit-bremaud/brasse-bouillon/issues/794) — jury edge cases (B + D + photo fallback placeholder) (closed)
- [#796](https://github.com/benoit-bremaud/brasse-bouillon/issues/796) – [#798](https://github.com/benoit-bremaud/brasse-bouillon/issues/798) — UX scenarios B and D (closed)
- [#696](https://github.com/benoit-bremaud/brasse-bouillon/issues/696) – [#701](https://github.com/benoit-bremaud/brasse-bouillon/issues/701) — Scan Tranche 2 (OpenFoodFacts proxy + result screen) (closed)

## 5. Target architecture (visual recap)

The diagram below describes the **target** architecture per ADR-0005 — a
single owner for `scan_catalog_items` (Python beer-encyclopedia). The
**transitional** state until [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980)
closes is described under §5.1.

```
┌──────────────┐     barcode       ┌──────────────┐
│   Mobile     │ ────────────────▶ │   NestJS     │  (proxy + auth + sessions)
│  Expo SDK 54 │ ◀──── result ──── │  /scan/*     │
└──┬───────────┘                   └──────┬───────┘
   │                                      │ proxy
   │ multipart frames                     ▼
   │                              ┌─────────────────────────────┐
   └────────────────────────────▶ │  Python beer-encyclopedia   │
                                  │  (FastAPI + Postgres)       │
                                  │                             │
                                  │  panoramic_capture          │
                                  │  scan_catalog_items         │ ← single owner
                                  │  beer_data_suggestions      │
                                  │  OpenCV stitcher            │
                                  │  Cloud Vision OCR           │
                                  │  Claude vision              │
                                  │  Brave + 2nd web search     │
                                  └────────────┬────────────────┘
                                               │ webhook SuggestionCreated
                                               ▼
                                  ┌──────────────┐
                                  │   NestJS     │ → notifications table → mobile bell
                                  │  /admin/*    │ → maintainer review actions
                                  └──────────────┘
```

The mobile app is allowed to talk to both backends per ADR-0005.

### 5.1 Transitional state (until [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) closes)

A **legacy** `scan_catalog_items` table exists in the NestJS API on SQLite —
the artefact of the pre-ADR-0005 implementation. While the migration tracked
by [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) is in
flight:

- The legacy NestJS table remains read/write for the existing barcode-lookup
  flow.
- The Python `scan_catalog_items` table is the canonical store for any new
  field, any panoramic-capture row, and any enrichment-suggestion linkage.
- No row should be duplicated across the two tables. Reconciliation is by
  cutover, not by sync.

ADR-0005 §Roadmap describes the deprecation of the legacy table.

## 6. Critical files / zones

### Mobile (`packages/mobile-app/src/features/scan/`)

- `presentation/ScanScreen.tsx` — entry point; will gain the decision-tree branching from #952
- `presentation/BeerInfoCardScreen.tsx` — fiche result screen; affected by #870 (OFF mapping) and #874 (CTA placement)
- **To create:** `presentation/PanoramicCaptureScreen.tsx`, `domain/loop-closure-detector.ts`, `infrastructure/panoramic-capture.client.ts`

### NestJS API (`packages/api/src/scan/`)

- `services/openfoodfacts.client.ts` — target of #870 mapping fix
- `services/scan.service.ts` — target of #932 DIP refactor
- **To create:** `services/notifications.service.ts`, `controllers/admin-review.controller.ts`

### Python beer-encyclopedia (`packages/beer-encyclopedia/`)

- `db/models/` — to extend: `scan_catalog_item.py`. To create: `panoramic_capture.py`, `beer_data_suggestion.py`
- `db/migrations/versions/` — Alembic migrations for the above
- `routers/` — to create: `panoramic_captures.py`, `suggestions.py`
- `services/` — to create: `stitching.py`, `cloud_vision_ocr.py`, `claude_vision.py`, `web_enrichment.py`

### Specifications (read-only)

- [scan-algorithms.md](scan-algorithms.md) — algorithmic spec, merged via [PR #943](https://github.com/benoit-bremaud/brasse-bouillon/pull/943) and [PR #954](https://github.com/benoit-bremaud/brasse-bouillon/pull/954)
- [ADR-0005](../decisions/0005-backend-split-encyclopedia-vs-product.md) — backend split
- [ADR-0004](../decisions/0004-data-locality-hybrid-principle.md) — data locality hybrid principle

## 7. Open decisions (to resolve before sequencing implementation)

These decisions block the dev-plan finalisation; they do **not** block reading
or planning further consolidation.

1. **Second web-search provider** — Google Programmable Search Engine vs
   SerpAPI vs DuckDuckGo HTML scraping. To be decided in [#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938)
   based on a benchmark at implementation time, not in chambre.
2. **Loop-closure thresholds** — `min_frames_before_closure = 12` and
   `match_score_threshold = 0.7` are first-cut guesses. To tune during the
   tech-spike of [#944](https://github.com/benoit-bremaud/brasse-bouillon/issues/944).
3. **Freemium quotas activation timing** — activate alongside the enrichment
   pipeline (parallel with the #934 work) to protect against OFF rate-limits,
   or defer to v0.2 post-soutenance with a soft client-side counter only.
   Tracked in [#878](https://github.com/benoit-bremaud/brasse-bouillon/issues/878).
   Maintainer is parking this decision until Phase 1 closes.

### Resolved on 2026-05-08

- **Server-side stitching backend technology** → in-process Python (OpenCV
  native call). `opencv-python` is already a transitive dependency of YOLO +
  EasyOCR in beer-encyclopedia, no new infra. Sub-process and Node FFI
  rejected. Recorded on [#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948).
- **Streaming progression UX (Phase 4.5)** → implement alongside [#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948)
  (do not defer). Driven by the craft-beer audience constraint (§3): a
  15-second spinner without feedback is unacceptable when the panoramic scan
  *is* the primary recognition path. Recorded on #948.

## 8. What this document is NOT

- **Not a development plan** — phases, milestones, sprint allocation, and
  soutenance fallback strategy live in a separate planning artefact
  (to be written once Section 7 is settled).
- **Not a specification** — algorithmic details, data model, UX copy, and
  tech-stack constraints live in [scan-algorithms.md](scan-algorithms.md).
- **Not a release changelog** — released versions live in [docs/changelog.md](../../changelog.md).
- **Not the project log** — daily operational events are recorded in [PROJECT_LOG.md](../../../PROJECT_LOG.md).

## 9. Maintenance protocol

- **Update the inventory** (Section 4) whenever an issue is opened, closed, or
  re-scoped under any of the four epics. Treat a missing or stale row as a
  bug in this document.
- **Update Section 7** when an open decision is resolved (move the decision out
  of this document into the originating issue or ADR, and remove the row).
- **Do not rewrite or split** Sections 1–3 — they are stable framing.
- **Do not add narrative or progress reports** here — those belong in
  [PROJECT_LOG.md](../../../PROJECT_LOG.md).
- **No AI tool attribution** anywhere in this document, ever, per project
  policy.
