# Dashboard real deadlines — conception

## Problem

The home dashboard ("Tableau de bord brassage") shows, under a **"Temps réel"**
caption, per-active-batch deadlines and urgency: *"En retard de Nh"*, urgency
pills, *"Actions 24h"*, *"Alertes critiques"*. Today these are **fabricated
client-side** from a hardcoded brewing schedule (`BREWING_STEPS` in
`DashboardScreen.tsx`: Empâtage 2h, Ébullition 8h, Fermentation 24h,
Conditionnement 7d, Embouteillage 10d) indexed by the batch's fetched
`current_step_order`. The label "Temps réel" is therefore misleading: the
numbers are a baked-in projection, not the batch's real schedule.

The real data already exists in the backend: each `batch_step` snapshots
`planned_duration_min`, `label`, `type`, and `started_at` at launch, and the
batch carries `current_step_order` + `started_at`. The gap is only that the
**list endpoint** (`GET /batches` → `BatchSummaryDto`) does not expose the
current step's timing, so the dashboard cannot compute a real deadline and
falls back to the hardcoded schedule.

## Decision (approach "B'") — validated 2026-07-21

Backend owns the schedule **data + rules**; the client owns only the trivial,
now-relative presentation so the countdown stays live without re-fetching.

1. **Enrich `GET /batches`** (`BatchSummaryDto`) — no new endpoint. The
   dashboard already fetches this list, so there is no extra round-trip.
2. The backend computes and returns, per batch, the current step's:
   - `current_step_label` — the real snapshotted step label.
   - `current_step_due_at` — `current_step.started_at + planned_duration_min`
     (absolute instant, computed backend). `null` when the current step has no
     `started_at`/`planned_duration_min` yet (not started, or legacy row).
   - `current_step_is_critical` — **derived from the step `type`** (a backend
     rule, no schema change): fermentation / conditioning / bottling-class step
     types are quality-critical.
3. **Mobile** drops `BREWING_STEPS` entirely. It computes only the presentation
   bucket ("En retard de Nh" / "Urgent" / "Bientôt" / "Dans Nj") from
   `current_step_due_at` vs the device `now`. The 8h "Urgent" threshold stays
   client-side — it is UI presentation, not domain data.
4. The **"Temps réel"** caption becomes truthful (real snapshotted step timing +
   backend-derived criticality).

### Sub-decisions

| # | Decision | Chosen | Rationale |
|---|----------|--------|-----------|
| 1 | Endpoint shape | **Enrich `GET /batches`** | Dashboard already fetches it; zero extra round-trip; the fields are a natural part of a batch summary. |
| 2 | Criticality source | **Derive from `batch_step.type`** | No migration; the rule lives in one backend place; `type` (RecipeStepType) already classifies the step. |
| 3 | Urgency threshold (8h) | **Client-side bucketing from `due_at`** | The bucket is now-relative presentation; keeping it client-side lets the countdown stay live without polling. |

## ADR alignment

Consistent with the project's "compute in the backend" pattern —
[ADR-0020](../../decisions/0020-equipment-driven-volume-planning.md)
(volume), [ADR-0024](../../decisions/0024-recipe-difficulty-scoring.md)
(difficulty), [ADR-0026](../../decisions/0026-equipment-capacity-fit-check.md)
(fit-check). The schedule/criticality domain logic moves out of the mobile
client into the backend; the client renders.

## Non-goals

- No polling / websockets — "Temps réel" here means "reflects the batch's real
  snapshotted schedule", refreshed on the dashboard's existing fetch + a live
  client-side countdown. A push/refresh strategy is a separate concern.
- No change to how steps are snapshotted at launch (already correct).
- The demo-mode hero/ribbon path is untouched (already demo-gated).
