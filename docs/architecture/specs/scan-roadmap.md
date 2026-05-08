# Scan feature — development roadmap (2026-05-08)

> **Status:** roadmap draft. Companion to [scan-consolidation.md](scan-consolidation.md).
> The phases below sequence the work inventoried in
> [scan-consolidation.md §4](scan-consolidation.md#4-inventory-of-related-artefacts)
> into deliverable, dependency-aware phases, with explicit success criteria and
> soutenance fallbacks.

## 1. Why this document exists

The consolidation snapshot ([scan-consolidation.md](scan-consolidation.md))
inventories *what* exists in the scan backlog. This roadmap defines *when* and
*in what order* the work gets shipped, with three concerns interlocked:

- **The 2026-05-27 soutenance** — 19 working days from this document. Some
  phases must be demo-ready; others can ship after.
- **The craft-beer audience constraint** ([scan-consolidation.md §3](scan-consolidation.md#3-structuring-constraints))
  — the panoramic scan is the *primary* recognition path for the target user,
  not a fallback. Prioritisation flows from this.
- **The ADR-0005 backend split** — every phase must respect the
  catalog-in-Python / user-in-NestJS boundary, with [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980)
  as the in-flight reconciliation gate for legacy NestJS code.

This document is opinionated about ordering. It is not a contract — it
will be revised as phases close and reality reveals the gaps.

## 2. Soutenance constraint (anchors the entire roadmap)

The 2026-05-27 demo is the immovable deadline. Working backwards:

| Date | Milestone |
|---|---|
| 2026-05-08 (today) | This roadmap published |
| 2026-05-13 (J-14) | Phase 0 complete; Phase 1 in progress |
| 2026-05-20 (J-7) | Phase 1 + Phase 3 (mobile capture) complete; capture flow demo-ready end-to-end |
| 2026-05-25 (J-2) | Minimum 2 full rehearsals complete on real bottles ([#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642)) |
| 2026-05-27 (J0) | Soutenance |

Any phase or sub-issue that doesn't fit before J-2 must have a Plan B
or be moved to post-soutenance.

## 3. Phasing overview

```
Phase 0 ────► Phase 1 ────► Phase 3 ────► Phase 4 ────► Phase 5
   │            │              │             │             │
   │            │              │             │             ▼
   │            └──► Phase 2 ──┴────────────┴─────────► (post-MVP)
   │                                                       │
   └────► [demo-essential path: 0 → 1 → 3]                Phase 6
                                                          (v0.3+)
```

- **Phase 0 → 1 → 3** is the **demo-essential path**: barcode-fix + foundations + capture mobile. Must land before J-2.
- **Phase 2** (enrichment pipeline) can run in parallel with Phase 3 once Phase 1 closes; full Phase 2 is *not* demo-essential.
- **Phase 4** (OCR + AI vision) is *not* demo-essential — Plan B handles its absence.
- **Phase 5** is post-MVP polish; Phase 6 is post-soutenance.

## 4. Phase 0 — Quick wins + prerequisites

**Goal.** Lift the immediate UX friction on existing barcode flows and unblock
Phase 1+3 with a tech-spike. None of these block each other.

**Deliverables.**

| # | Title | Effort | Owner |
|---|---|---|---|
| [#944](https://github.com/benoit-bremaud/brasse-bouillon/issues/944) | Tech-spike: Expo camera burst + JS hash + tesseract.js | 2 d | mobile |
| [#870](https://github.com/benoit-bremaud/brasse-bouillon/issues/870) | OFF mapping fix (abv, style, ingredients, allergens, image) | 1 d | api |
| [#874](https://github.com/benoit-bremaud/brasse-bouillon/issues/874) | "Suggest a correction" CTA misplaced on not-found screen | 0.5 d | mobile |
| [#932](https://github.com/benoit-bremaud/brasse-bouillon/issues/932) | Refactor `BeerCatalogProvider` interface (DIP) | 1 d | api |
| [#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642) | Demo assets — 6 bottles seeded + Demo override | 0.5 d | api + content |

**Total effort.** ~5 working days, parallelisable across mobile / api tracks.

**Exit criteria.**

- `#944` — tech-spike doc published at `docs/architecture/specs/scan-tech-spike-results.md` with explicit go/no-go on the Expo Managed bets.
- Existing barcode-lookup flow surfaces correctly-mapped fields (verifiable on EAN `3261570004196` La Goudale).
- The "Suggest a correction" CTA only appears on the result screen, never on the not-found screen.
- `BeerCatalogProvider` is the only injection point in `ScanService`; tests pass.
- 6 demo beers seeded in the API DB (BrewDog Punk IPA, La Chouffe, Rochefort 10, Karmeliet Tripel, La Goudale 75 cl, one local microbrewery underdog) with verified barcodes.

**Open during Phase 0.** Decisions deferred to [#878](https://github.com/benoit-bremaud/brasse-bouillon/issues/878) (freemium quotas) and [#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938) (2nd web-search) stay parked.

## 5. Phase 1 — Data foundations (Python beer-encyclopedia)

**Goal.** Ship the persistent backbone for panoramic captures and the canonical
catalog table per ADR-0005. Mobile and AI work all depend on this.

**Deliverables.**

| # | Title | Effort | Note |
|---|---|---|---|
| [#935](https://github.com/benoit-bremaud/brasse-bouillon/issues/935) | Extend `scan_catalog_items` schema (Python) | 1 d | After [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) retitling |
| [#951](https://github.com/benoit-bremaud/brasse-bouillon/issues/951) | `panoramic_capture` entity + Alembic + repository | 1 d | — |
| [#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948) | Backend stitching service + frame upload endpoint **+ SSE Phase 4.5** | 4 d | Stitching tech + SSE timing already decided ([#948 comments 2026-05-08](https://github.com/benoit-bremaud/brasse-bouillon/issues/948)) |
| [#936](https://github.com/benoit-bremaud/brasse-bouillon/issues/936) | Completeness ratio + below-threshold UI signal (Python compute, mobile UI, NestJS proxy) | 2 d | Split per [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) |

**Total effort.** ~8 working days. Cannot easily parallelise — `#948` depends on `#951`.

**Exit criteria.**

- A `cURL` upload of 15 JPEG frames to `POST /panoramic-captures` returns a `capture_id` in < 1 s and produces `panorama.jpg` + 2-3 keyframes on disk in < 5 s.
- An SSE client connecting to `GET /panoramic-captures/{capture_id}/stream` receives the full sequence of `upload.received → stitching.completed → suggestion.created` events (suggestion event stubbed before Phase 2).
- Completeness ratio computed correctly on 6 fixtures (BrewDog Punk IPA, La Chouffe, etc.) with the correct above/below-threshold classification.
- All Alembic migrations green; `pytest packages/beer-encyclopedia/` passes; type checks pass.

**Demo readiness.** End of Phase 1 = barcode flow can route below-threshold results, and panoramic frames can be uploaded, even though no AI runs on them yet.

## 6. Phase 2 — Enrichment pipeline (shared barcode + panoramic)

**Goal.** Build the multi-source enrichment + maintainer-validation chain
that turns a low-confidence catalog row into a reviewed suggestion.
Reused by both barcode-below-threshold and panoramic flows.

**Deliverables (post-[#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) retitling).**

| # | Title | Effort | Backend |
|---|---|---|---|
| [#937](https://github.com/benoit-bremaud/brasse-bouillon/issues/937) | `BeerDataSuggestion` entity + read-only admin endpoints (Python) | 2 d | Python |
| [#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938) | Multi-source enrichment (Brave + 2nd web + Claude) | 5 d | Python |
| [#939](https://github.com/benoit-bremaud/brasse-bouillon/issues/939) | Notifications table + endpoints + mobile bell | 3 d | NestJS |
| [#940](https://github.com/benoit-bremaud/brasse-bouillon/issues/940) | Admin review screen — approve / refuse / refine / instruct | 4 d | mobile |
| [#941](https://github.com/benoit-bremaud/brasse-bouillon/issues/941) | `EnrichmentRevision` chain | 2 d | Python |
| [#942](https://github.com/benoit-bremaud/brasse-bouillon/issues/942) | Caching, rate-limit, cost monitoring (Python + NestJS split) | 3 d | both |

**Total effort.** ~19 working days. **Not demo-essential** — Plan B skips it.

**Exit criteria.**

- A barcode lookup with completeness `< 0.5` triggers an enrichment job, surfaces a `Données partielles` banner on mobile, and creates a `BeerDataSuggestion` row.
- The maintainer (Benoît) sees a bell-icon notification, opens the review screen, picks one of the four actions, and the row's status advances accordingly.
- Refinement re-runs produce a linked revision (no orphan suggestions).
- The total cost per scan stays under 0.05 € on the median path; cost dashboard ([#942](https://github.com/benoit-bremaud/brasse-bouillon/issues/942)) shows live counters.

## 7. Phase 3 — Mobile capture + decision tree

**Goal.** Ship the capture-side experience end-to-end, from the initial scan
screen to the panorama-uploaded confirmation.

**Deliverables.**

| # | Title | Effort | Depends on |
|---|---|---|---|
| [#945](https://github.com/benoit-bremaud/brasse-bouillon/issues/945) | Pre-capture screen — silhouette + distance/blur + Commencer CTA | 3 d | [#944](https://github.com/benoit-bremaud/brasse-bouillon/issues/944) |
| [#946](https://github.com/benoit-bremaud/brasse-bouillon/issues/946) | Burst capture loop + dedup + gyro progress | 4 d | [#944](https://github.com/benoit-bremaud/brasse-bouillon/issues/944) |
| [#947](https://github.com/benoit-bremaud/brasse-bouillon/issues/947) | Loop-closure + auto end + 30s timeout | 3 d | [#946](https://github.com/benoit-bremaud/brasse-bouillon/issues/946) |
| [#952](https://github.com/benoit-bremaud/brasse-bouillon/issues/952) | Decision-tree wiring (auto-switch / prompt / silence) | 2 d | [#936](https://github.com/benoit-bremaud/brasse-bouillon/issues/936), [#945](https://github.com/benoit-bremaud/brasse-bouillon/issues/945) |

**Total effort.** ~12 working days. `#945` and `#946` can partially overlap;
`#947` is gated by `#946`.

**Exit criteria.**

- On a Pixel + iPhone, scanning an EAN unknown to the barcode lookup auto-switches to the panoramic capture screen with the canonical FR banner.
- Pre-capture indicators (silhouette, distance, blur) gate the **Commencer** CTA correctly on 33 cl, 44 cl, and 75 cl bottles ([#945](https://github.com/benoit-bremaud/brasse-bouillon/issues/945) AC absorbed from closed [#639](https://github.com/benoit-bremaud/brasse-bouillon/issues/639)).
- A full bottle rotation (~ 5 s) ends in loop-closure detection in < 1 s after the first frame matches the anchor set; capture closes automatically.
- Frames upload to the Phase 1 endpoint and the SSE stream is consumed; mobile shows live progression based on real backend events.
- A 30 s timeout exits cleanly with a "retry" UX path.

**Demo readiness.** End of Phase 3 = full happy-path demo possible without AI: live capture → backend stitches → panorama displayed in fiche screen.

## 8. Phase 4 — OCR + AI vision (Python beer-encyclopedia)

**Goal.** Turn the stitched panorama into a structured, AI-extracted catalog
suggestion.

**Deliverables.**

| # | Title | Effort |
|---|---|---|
| [#949](https://github.com/benoit-bremaud/brasse-bouillon/issues/949) | Cloud Vision OCR + escalation Phase 6.5 (5-channel ensemble) | 4 d |
| [#950](https://github.com/benoit-bremaud/brasse-bouillon/issues/950) | Claude multimodal pass + handoff to enrichment ([#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938)) | 3 d |

**Total effort.** ~7 working days. Both depend on Phase 1 ([#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948)).
**Not demo-essential** — Plan B skips it.

**Exit criteria.**

- On the 6 fixture panoramas (the demo beers from [#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642)), Cloud Vision OCR returns text with `avg_confidence ≥ 0.7` on the `name` / `brewery` / `abv` blocks at least 5 of 6 times. The Phase 6.5 escalation fires only when needed and stays under 6× the baseline cost.
- Claude vision pass produces a structured `Partial<ScanCatalogItem>` with per-field confidence; low-confidence fields (< 0.7) trigger the handoff to [#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938) for web verification.
- End-to-end: capturing a panorama on Phase 3 produces a suggestion in Phase 2 with `name + brewery + abv` filled in, confidence ≥ 0.8 on at least 3 of the 6 fixtures.

## 9. Phase 5 — Polish + community contribution

**Goal.** Wrap up the soutenance-supporting concerns and ship the
community-contribution track that reuses the panoramic infrastructure.

**Deliverables.**

| # | Title | Notes |
|---|---|---|
| [#803](https://github.com/benoit-bremaud/brasse-bouillon/issues/803) | Community contribution flow (4-photo bottle tour) | Reuses [#947](https://github.com/benoit-bremaud/brasse-bouillon/issues/947) + [#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948) + [#951](https://github.com/benoit-bremaud/brasse-bouillon/issues/951) |
| [#538](https://github.com/benoit-bremaud/brasse-bouillon/issues/538) | Coup de coeur live scan challenge prep | Soutenance |
| [#702](https://github.com/benoit-bremaud/brasse-bouillon/issues/702) | Demo script (90 s) + screencast fallback | Soutenance |

**Effort.** ~7 working days. **Demo-essential** scope: only [#702](https://github.com/benoit-bremaud/brasse-bouillon/issues/702) and the rehearsals from [#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642).

## 10. Phase 6 — Out of scope MVP (post-soutenance / v0.3+)

These are tracked but explicitly off the J-19 path:

- [#859](https://github.com/benoit-bremaud/brasse-bouillon/issues/859) — CLIP + pgvector visual recognition fallback (v0.3+)
- [#878](https://github.com/benoit-bremaud/brasse-bouillon/issues/878) — Rate-limit + freemium tiering (decision parked by maintainer until Phase 1 closes)
- [#832](https://github.com/benoit-bremaud/brasse-bouillon/issues/832) — Creator gallery / label design history (adjacent epic)
- Auto-promotion of suggestions without maintainer review (deferred to v0.3+)

## 11. Soutenance strategy 2026-05-27

Three explicit fallback levels, picked at most J-2 based on what shipped.

### Plan A — Live demo idéale (target)

Scope: Phase 0 + Phase 1 + Phase 3 complete; Phase 4 partially live.

1. Scan barcode of BrewDog Punk IPA → enriched fiche (seed + [#870](https://github.com/benoit-bremaud/brasse-bouillon/issues/870) fix).
2. Scan barcode of an unknown craft beer → auto-switch to panoramic capture.
3. Rotate La Goudale 75 cl → loop-closure auto-stop in ~ 6 s.
4. Upload → backend stitches → SSE shows phase-by-phase progress live.
5. Cloud Vision + Claude produce `name + brewery + abv` → fiche populated.
6. Talking-point: explain why this matters for craft-beer users.

### Plan B — Demo dégradée (Phase 4 not ready)

Scope: Phase 0 + Phase 1 + Phase 3 complete; no AI extraction.

- Same as Plan A up to step 5, then: panorama displayed in the fiche with the message *"Analyse IA en cours d'intégration — voici la base technique posée"*.
- Backup screencast (recorded in Phase 5 [#702](https://github.com/benoit-bremaud/brasse-bouillon/issues/702)) shown at step 6 to demonstrate the full chain in a controlled environment.

### Plan C — Demo override (live capture fails on stage)

Scope: anything broken on stage.

- Activate the [#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642) demo override switch — surfaces a pre-recorded panorama with stubbed OCR/AI output.
- The jury sees the UX flow, not the internals.
- Honest framing: *"En contexte salle, je vous montre l'expérience utilisateur. Le pipeline live est démontré sur la vidéo backup."*

## 12. End-to-end verification per phase

| Phase | Verification gate |
|---|---|
| 0 | `npm run ci:all` green; spike doc published; 6 EAN fixtures resolve correctly |
| 1 | `pytest packages/beer-encyclopedia/` green; cURL upload of 15 frames produces panorama in < 5 s; SSE stream emits `upload.received` + `stitching.completed` (the 2 events Phase 1 actually produces — Phase 2 / Phase 4 events come online with their respective phases) |
| 2 | Suggestion PENDING created on a low-completeness EAN; mobile bell rings; review screen approve/refuse work end-to-end |
| 3 | On Pixel + iPhone: unknown EAN → auto-switch → rotation → loop-closure < 30 s → upload OK |
| 4 | 5 fixture panoramas → suggestion with name+brewery+abv > 80% confidence on at least 3 of 5 |
| 5 | Minimum 2 full rehearsals on real bottles ([#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642) AC), no incident |

## 13. Risk register (selected)

| Risk | Mitigation |
|---|---|
| Phase 0 tech-spike reveals Expo Managed cannot reach 5 fps burst on mid-range Android | Drop to 3 fps + 30 s capture window; Plan B becomes default |
| OFF rate-limit ([#876](https://github.com/benoit-bremaud/brasse-bouillon/issues/876) / [#877](https://github.com/benoit-bremaud/brasse-bouillon/issues/877)) trips during demo prep | Activate freemium quota [#878](https://github.com/benoit-bremaud/brasse-bouillon/issues/878) earlier than planned + IP whitelist on stage |
| Claude vision pass produces hallucinated brewery names | Phase 6.5 OCR escalation + low-confidence handoff to web verification ([#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938)) catches most cases |
| Phase 1 endpoint not ready by J-7 | Cut Phase 3 scope to "static panorama display" without backend round-trip; Plan C ready as backup |
| Loop-closure false-positive on identical-pattern labels (e.g. La Trappe) | Combine perceptual hash with feature matching, minimum frame threshold 12 |

## 14. Decisions captured upstream

These were resolved before this roadmap and are referenced here for context.
**Do not reopen** without revising this document.

- Stitching backend tech → in-process Python (recorded on [#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948), 2026-05-08)
- Streaming SSE Phase 4.5 → implement alongside [#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948), do not defer (recorded on [#948](https://github.com/benoit-bremaud/brasse-bouillon/issues/948), 2026-05-08)
- Target audience = craft-beer users → panoramic is primary recognition path (recorded in [scan-consolidation.md §3](scan-consolidation.md#3-structuring-constraints))
- ADR-0005 reconciliation tracking → [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980)

## 15. Maintenance protocol

- **Update the timeline** (§2) when a phase slips by more than 2 days. The slip propagates to all downstream phases.
- **Update the deliverables tables** when a sub-issue is closed, retitled, or split — keep the issue numbers correct.
- **Update §11 Plan A/B/C** when a phase confirms its demo-readiness; J-2 is the hard cutover point.
- **Update §13 Risk register** when a risk materialises (move it to a closed section with the actual mitigation taken) or when a new risk emerges from a sub-issue.
- **Do not duplicate** content from [scan-consolidation.md](scan-consolidation.md) or [scan-algorithms.md](scan-algorithms.md) — link to the canonical source.
- **No AI tool attribution** anywhere in this document, ever, per project policy.
