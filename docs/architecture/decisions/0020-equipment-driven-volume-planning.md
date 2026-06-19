# ADR-0020 — Equipment-driven batch sizing & volume planning (computed in the backend)

**Status**  Proposed
**Date**    2026-06-19
**Owners**  @benoit-bremaud

> Settles, for the novice brew-preparation journey, two coupled questions that
> Brasse-Bouillon's **first real-world brew** surfaced: (1) **what sets the batch
> volume**, and (2) **where the volume math runs**. Conception:
> [`../diagrams/brew-prep/`](../diagrams/brew-prep/). Recipe content:
> [`../../real-world-test/blonde-ale-5l-first-brew.md`](../../real-world-test/blonde-ale-5l-first-brew.md).
> Relates: ADR-0002 (centralized NestJS backend), ADR-0001 (build for today).

## Context

The first real brew (a 5 L demijohn) showed that a brewer's **equipment**, not a
free "target volume", determines the batch:

- a **5 L fermenter** minus krausen headspace caps the wort (~4.3 L → ~4 L
  bottled);
- the **pot (kettle) size** decides the BIAB method (full-volume vs dunk-sparge);
- boil-off + grain absorption + kettle/fermenter losses set the **water cascade**
  (strike → pre-boil → post-boil → fermenter → bottled).

The plan must be shown **pre-batch** (reversible) and **persisted into the batch**
at launch (the brew runs against it). Two decisions follow: how the volume is
set, and where the math lives — mobile or API.

## Decision

**D1 — The fermenter capacity (minus headspace) caps the batch.** Batch size is
*derived from equipment*, not entered as a fixed target:
`intoFermenter = fermenterCapacity × (1 − headspaceRatio)`;
`bottled = intoFermenter − fermenterLoss`; the recipe scales to that volume.

**D2 — The pot (kettle) capacity selects the method.** If the kettle holds the
full-volume mash (strike water + grain) → **full-volume BIAB, no sparge**; else →
**BIAB + dunk-sparge** (split mash + rinse). Pots too small to boil the pre-boil
volume are out of scope (reduced batch / concentrated boil deferred).

**D3 — The volume plan is computed in the backend and snapshotted into the
batch.** A pure NestJS **domain service** computes the cascade from the recipe
targets + the brewer's equipment profile, exposed via an endpoint for the
pre-batch preview, and **persisted on the batch** at launch.

**D4 — Boil-off and the loss constants are calibratable inputs**, defaulted and
stored on the equipment profile; the plan recomputes when they change.

## Consequences

- Single source of truth for the brewing math (tested once, reused by a future
  web client); consistent with **ADR-0002**.
- The batch carries a reproducible, authoritative volume plan.
- **Equipment becomes a first-class input** (capacities), not just an ownership
  checklist — this reshapes the equipment feature (build phase A3).
- Cost: a network round-trip for the pre-batch preview — acceptable (inputs
  change rarely, not per-keystroke). A mobile mirror for instant slider feedback
  is a deferred optimisation (YAGNI).

### Rejected (for now)

- **Frontend-only calc** — simplest today (mobile-only app), instant, offline;
  but duplicates domain logic when a web client arrives and forces the backend to
  trust client-sent numbers when persisting. Re-open if offline brew-day
  calculation becomes essential.
- **Hybrid (shared function, backend authoritative + mobile mirror)** — most
  robust but more complexity/maintenance; adopt only if instant feedback **and**
  authority both prove necessary.

## Relation to other ADRs

- **Implements ADR-0002** (logic centralized in NestJS; mobile talks only to the
  API via the http-client).
- **Respects ADR-0001** (build for today): one canonical backend calc now, mobile
  mirror deferred.
