# Dashboard real deadlines — sequence

Request flow when the dashboard loads its "Alertes & échéances" section.
Backend computes the absolute deadline + criticality from the snapshotted
step; the client derives only the live now-relative bucket.

```mermaid
sequenceDiagram
    actor Novice
    participant Dash as DashboardScreen (mobile)
    participant API as GET /batches (BatchController)
    participant Svc as BatchService.listMine
    participant Repo as Batch + BatchStep repos

    Novice->>Dash: opens home (Tableau de bord)
    Dash->>API: GET /batches (JWT)
    API->>Svc: listMine(userId)
    Svc->>Repo: load owned batches + their steps
    Repo-->>Svc: batches[], steps[]
    loop per batch
        Svc->>Svc: currentStep = steps[current_step_order]
        Svc->>Svc: due_at = currentStep.started_at + planned_duration_min (null if absent)
        Svc->>Svc: is_critical = isQualityCriticalType(currentStep.type)
    end
    Svc-->>API: BatchSummaryDto[] (+ current_step_label, current_step_due_at, current_step_is_critical)
    API-->>Dash: 200 BatchSummaryDto[]
    Dash->>Dash: bucket = classify(current_step_due_at, now)  %% En retard de Nh / Urgent / Bientôt
    Dash-->>Novice: real deadlines + urgency + critical count ("Temps réel", now honest)
```

## Notes

- No new endpoint and no extra round-trip: the dashboard already calls
  `GET /batches`.
- `due_at` is absolute, computed once per request from the snapshotted step; the
  client re-derives the human "Nh / Nj" and the urgency bucket against its own
  clock, so the countdown stays live between fetches.
- When `current_step_due_at` is `null` (step not started / legacy row), the
  dashboard shows a neutral state (no fabricated deadline) instead of a baked-in
  projection — this is the honesty fix.
