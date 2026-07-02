# State diagram — brew-day — batch lifecycle (draft → archived)

> **Feature**: brewing assistant / brew-day guidance layer (novice-journey audit).
> **Related**: refines `../batches/05-state-batch-lifecycle.md` (#595/#605) for the brew-day
> scope; the per-step machine that drives `in_progress` is `06-state-brew-step.md`.
> **Decisions captured**: debrief 2026-07-01 — a batch created by "Préparer" is a reversible
> `draft` (« en préparation ») that CARRIES the prep; add `cancelled` (abandon a launched brew).

## Context

The batch's overall lifecycle as the journal tracks it — coarser than the per-step machine
(`06`), it is what the list status badge reflects. This refines `batches/05` by making the
pre-launch state a first-class **`draft` (« en préparation »)** that holds the mise-en-place
checklist (fixes F14/F15), and by adding **`cancelled`** for abandoning a launched brew (F16).
It does NOT model the per-step phases (that is `06`).

## Diagram

```mermaid
stateDiagram-v2
  [*] --> draft: Prepare a recipe

  draft --> in_progress: Launch
  draft --> discarded: Discard

  in_progress --> completed: Last step complete
  in_progress --> cancelled: Cancel

  completed --> archived: Archive
  cancelled --> archived: Archive

  completed --> [*]
  archived --> [*]
  cancelled --> [*]
  discarded --> [*]

  note right of draft
    « En préparation » — the batch created by
    "Préparer" CARRIES the mise-en-place checklist
    (F14/F15): the prep lives on the batch, not the
    recipe. Reversible / discardable before launch.
  end note

  note right of in_progress
    Driven by the per-step machine (06). The batch
    advances as each step reaches TERMINÉ; the last
    step (Packaging) completing moves it to completed.
  end note
```

## Notes

- **Reconciliation with `batches/05`.** `draft` refines that diagram's `planned` state — same
  slot (created-from-recipe, not started), but now explicitly **carrying the prep checklist**
  so the mise-en-place is per-batch and resets each brew (fixes **F14**: the checklist no longer
  persists on the recipe) and cleanly separates Recipe (template) from Batch (instance) (**F15**).
- **`Launch`** is the existing pre-brew launch gate (#1266): the irreversible "Lancer le
  brassage" after the ingredient checklist is complete. It is the `draft → in_progress`
  transition.
- **`Cancel` (F16).** `in_progress → cancelled` lets a brewer stop a launched brew (e.g. an
  accidental launch, or a batch gone wrong) — distinct from `Discard` and `Archive`. It is a
  **status update to a soft `cancelled` state** (a new `PATCH` on the batch), **not** the
  `DELETE /batches/:id` endpoint: cancelling **preserves the journal** (the brew stays in history,
  hidden from the active list). The existing hard-deleting `DELETE` (F25/F22) is reserved for
  `Discard` below.
- **`Discard` vs `Archive` (delete mechanics).** `Discard` (`draft → discarded`) is a **hard
  delete** of a never-launched draft — the same shipped `DELETE /batches/:id` (F25/F22), since a
  draft has no journal worth keeping; `discarded` is therefore **not a stored status** but the
  terminal "row removed" outcome, drawn only to close the diagram. `cancelled` and `archived` are
  **soft states** that preserve the journal (a cancelled/finished brew stays in history, just
  hidden from the active list).
- **`Archive` (F25).** `completed → archived` (and `cancelled → archived`) soft-hides a batch
  from the active « Mes brassins » list without deleting its journal — declutters the list.
- **Persistence model — timestamps, not new status enum values (07a implementation refinement).**
  `cancelled` and `archived` are persisted as nullable **`cancelled_at` / `archived_at` timestamp
  columns** on the batch (a plain `ADD COLUMN` migration, no backfill), **NOT** as new `status`
  enum values: SQLite cannot alter the `status` CHECK constraint in place, and `batches` is
  referenced by many cascade-FK child tables, so a table rebuild would be risky. The **effective**
  lifecycle state returned to clients is *derived* — `archived` > `cancelled` > the raw
  `in_progress`/`completed` status. Endpoints: `cancelled` = `PATCH /batches/:id/cancel` (only a
  launched brew), `archived` = `PATCH /batches/:id/archive` (only a finished or cancelled brew).
  `discarded` stays the terminal hard-delete outcome (not stored). **`draft`** + moving the prep
  onto the batch (F14/F15) is the second slice (07b) — see below.
- **`draft` persistence — same timestamp model (07b implementation refinement).** `draft` is
  realised as a nullable **`launched_at`** stamp (plain `ADD COLUMN`, legacy rows backfilled
  `launched_at = started_at` since they were all launched at creation), **not** a new `status`
  enum value — same CHECK-constraint rationale as 07a. The effective-state derivation becomes
  `archived` > `cancelled` > `draft` (`launched_at` null) > raw status; while a batch is a draft
  its DTO `started_at` reads **null** (the brew has not started). The draft **carries the prep**
  as a `prep_checked_ids` JSON column (only the coches — the checklist items stay derived from
  the recipe, see brew-prep/04). Endpoints: `POST /batches/prepare` (idempotent per
  owner+recipe: re-preparing resumes the existing draft), `PATCH /batches/:id/prep-checklist`
  (draft-only), `PATCH /batches/:id/launch` (= `Launch`; the recipe steps are snapshotted at
  launch, not at prepare, so the brew runs the recipe as it stands). Brewing-journal endpoints
  (steps, fermentation, measurements, observations, reminders, cancel) reject a draft — it has
  brewed nothing; its only exits are `Launch` and `Discard` (the shipped hard `DELETE`).
- **`completed`** still opens the closure/celebration (B3 `BatchClosureView`) and is kept in
  history; the transition is driven by the last step completing (see `06`). This is the **same
  `completed` state** already amended by `05-state-batch-closure.md` with the `bottledAt`
  timestamp + post-closure tasting — unchanged here (see `05` for that slice).
- **Two levels kept separate** (as in `batches/05`): the fine-grained step phases
  (`prep`/`active`/`paused`) live on `BatchStep` (`06`), never on the batch — a batch is
  `in_progress` regardless of which phase its current step is in.
- **Reopen-scope dependency (see `06`).** The open question in `06` — whether Reopen targets any
  completed step or only the current one — affects the batch `currentStepOrder` pointer and the
  "in_progress regardless of phase" claim above. Resolve before the implementation slice.
