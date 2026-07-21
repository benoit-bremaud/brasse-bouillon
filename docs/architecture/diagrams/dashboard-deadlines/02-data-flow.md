# Dashboard real deadlines — data flow

Where each value the user sees comes from, after the fix. The hardcoded
`BREWING_STEPS` planning is removed; the only client-side computation is the
now-relative presentation bucket.

```mermaid
flowchart TD
    subgraph DB["Persisted (snapshotted at launch)"]
        PD["batch_step.planned_duration_min"]
        SA["batch_step.started_at"]
        TY["batch_step.type (RecipeStepType)"]
        LB["batch_step.label"]
        CO["batch.current_step_order"]
    end

    subgraph Backend["BatchService.listMine (computed backend)"]
        CS["currentStep = steps[current_step_order]"]
        DUE["current_step_due_at = started_at + planned_duration_min"]
        CRIT["current_step_is_critical = isQualityCriticalType(type)"]
        LBL["current_step_label = label"]
    end

    subgraph DTO["BatchSummaryDto (over the wire)"]
        F1["current_step_label"]
        F2["current_step_due_at (nullable)"]
        F3["current_step_is_critical"]
    end

    subgraph Client["DashboardScreen (presentation only)"]
        BUCKET["classify(due_at, now) → En retard de Nh / Urgent / Bientôt / Dans Nj"]
        COUNTS["Actions 24h = count(due_at in [now, now+24h]) · Alertes critiques = count(is_critical)"]
        RENDER["Alertes & échéances list + KPI grid ('Temps réel', honest)"]
    end

    CO --> CS
    LB --> LBL
    SA --> DUE
    PD --> DUE
    TY --> CRIT
    CS --> DUE
    CS --> CRIT
    CS --> LBL
    DUE --> F2
    CRIT --> F3
    LBL --> F1
    F2 --> BUCKET
    F2 --> COUNTS
    F3 --> COUNTS
    F1 --> RENDER
    BUCKET --> RENDER
    COUNTS --> RENDER

    REMOVED["REMOVED: BREWING_STEPS.expectedHours + isCriticalQuality (hardcoded schedule)"]
    REMOVED -. deleted .-> RENDER
```

## Rule: `isQualityCriticalType(type)`

Criticality is derived from `batch_step.type` (RecipeStepType), not a new
column. Quality-critical types are the post-boil biological/packaging phases
where a missed deadline degrades the beer (fermentation, conditioning /
cold-crash, bottling / carbonation). Mash/boil steps are time-sensitive but not
"quality-critical" in the dashboard's alert sense. The exact enum→boolean map is
pinned in the backend rule + covered by a unit test, so adding a step type
forces an explicit criticality decision.
