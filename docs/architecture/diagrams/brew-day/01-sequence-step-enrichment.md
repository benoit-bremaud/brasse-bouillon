# Sequence diagram — brew-day — Enrich live batch steps with guidance (B1-live, F4 prep actions, F5 done-when)

> **Feature**: first real brew — making the brew-day step guide work in **LIVE** mode (roadmap P0 "TRACKER → ASSISTANT").
> **Realizes**: B1-live + **F4 physical prep actions** + **F5 end conditions** (novice-journey audit). **Related**: brew-prep state machine ([`../brew-prep/05-state-readiness.md`](../brew-prep/05-state-readiness.md)), step lifecycle ([`06-state-brew-step.md`](06-state-brew-step.md)).
> **Amended 2026-07-02 (F4 + 07b sync)**: enrichment now happens at **launch** (steps are snapshotted by `launchBatch`, not at batch creation — brew-day/07 F14/F15) and carries the **physical prep actions** shown in the step's PRÉP phase.
> **Amended 2026-07-02 (F5)**: enrichment also carries the step's **end condition** (`doneWhen`) — one pedagogical FR sentence per type shown in the **ACTIF** phase, so the brewer always knows *when the step is over* (the timer is an aid, the condition is the truth; event-gated steps like fermentation get their condition instead of a countdown).

## Context

In live mode, batch steps were bare (`label` + `description`); the ⓘ pedagogical tip + the countdown timer — **already rendered** by the mobile `StepCard` / `BrewStepTimer` — were **demo-only**. This slice adds, at launch, a per-step-type guidance persisted onto the batch, so the live brew-day is guided. **MVP source = per-step-type defaults** (no recipe↔guidance link yet; deferred).

**F4 (amendment):** the guidance now also carries the step's **physical prep actions** — the concrete gestures the novice must do before starting the technical phase (heat ~X L of strike water, sanitize, dough-in; chill to ~20 °C, transfer, pitch…), **each with its one-line pedagogical why** so the brewer learns the craft, not just the app. They are rendered as a lightweight checklist in the step's **PRÉP** phase (brew-day/06); ticks are UI-local (not persisted) and `Start` is **not hard-gated** on them (guidance + escape hatch, never a lock).

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant M as Mobile
  participant API as Backend (BatchService)
  participant D as BatchDomainService
  B->>M: "Lancer le brassage" (from the prepared draft)
  M->>API: PATCH /batches/:id/launch
  API->>API: load recipe steps (order, type, label, description)
  API->>D: launchBatch(draft, steps)
  loop each step
    D->>D: getStepGuidance(step.type) gives tip + duration + prepActions + doneWhen, or none
  end
  D-->>API: BatchStep[] enriched (tip + duration + prepActions + doneWhen)
  API->>API: persist batch_steps (pedagogical_tip, planned_duration_min, prep_actions, done_when)
  API-->>M: BatchDto (steps carry tip + duration + prepActions + doneWhen)
  M-->>B: PRÉP shows the physical actions; ACTIF shows the timer + « C'est terminé quand… »
```

## Notes

- **Per-type defaults (MVP):** `STEP_TYPE_GUIDANCE` maps each `RecipeStepType` to `{ pedagogicalTip, plannedDurationMin, prepActions }`. Unknown type gives `undefined` (graceful: no tip/timer/prep). `FERMENTATION` / `PACKAGING` carry a tip but a `null` duration (they run over days — no countdown).
- **Prep actions per type (F4):** a handful of `{ action, why }` pairs per type — the short
  imperative gesture PLUS its one-line pedagogical why (the app TEACHES: a novice must learn to
  brew alone, not just execute — educational vocation + ADR-0021 D5). Mobile renders the action
  as the primary line and the why as a secondary line beneath it (always visible in v1; adaptive
  folding by declared brewer level is the D5 iteration). MASH = heat strike water + clean/rinse +
  dough-in; BOIL = remove the bag (BIAB) + rolling boil uncovered + stage the hop additions;
  WHIRLPOOL = stir the cone + ready the chiller; FERMENTATION = chill to ~20 °C + sanitize +
  transfer/aerate/pitch + airlock & temperature; PACKAGING = **none** — bottling already has the
  richer B3 gate (`03-sequence-bottle-and-close.md`), prep actions must not duplicate it.
- **Not a gate:** the PRÉP checklist is guidance; `Start` stays a single ✋ confirmation (brew-day/06). Ticks are local UI state — nothing new persisted per tick (unlike the brew-prep ingredient checklist F14, which is a launch gate).
- **End condition per type (F5):** `doneWhen` — one pedagogical FR sentence stating when the step is over, rendered in the **ACTIF** phase near the ✋ Complete CTA. For timed steps it frames the countdown as an aid, not an order (MASH/BOIL/WHIRLPOOL); for event-gated steps it IS the end signal (FERMENTATION: stable gravity over 2-3 days, never a fixed date). Like the prep actions it never gates `Complete` — the ✋ stays sovereign (unified end, brew-day/06).
- **Description preserved:** the recipe-authored `description` is untouched; only type-level guidance is added.
- **Backward compatible:** the `batch_steps` columns are nullable; steps launched before this carry no enrichment (mobile falls back to the bare card).
- **Mobile:** `BatchDetailsScreen` already derives the PRÉP phase (`startedAt == null`, F1) — the PRÉP block renders `prepActions` above the Start CTA.
- **Deferred:** recipe-level override of the guidance (same deferral as tips); **computed figures** in prep actions (real strike-water litres/temperature from the batch volume plan, ADR-0020) — v1 ships plausible static defaults worded as approximations (« ~7 L à ~72 °C pour ~4 L de bière »).
- ~~**Next (P0):** B2 (measurements OG/FG/ABV) then B3 (bottling + closure).~~ Shipped; superseded by the F-series audit backlog.
