# Sequence diagram — dashboard — load overview & open statistics

> **Feature**: home rewrite #829; unified Statistics + period filter #646.

## Context

How the dashboard assembles its KPIs/alerts on open, and how the statistics
screen recomputes when the period changes. Both are read/aggregation flows over
batches + recipes.

## Load the dashboard

```mermaid
sequenceDiagram
  actor B as Brewer
  participant S as "Mobile — DashboardScreen"
  participant UC as "Mobile — dashboard.use-cases"
  participant HTTP as "core/http/http-client"
  participant API as "API — batches / recipes"

  B->>S: Open Accueil
  S->>UC: getDashboardViewModel()
  UC->>HTTP: GET /batches?status=active
  HTTP->>API: forward
  API-->>UC: active batches (+ steps, alerts)
  UC->>UC: derive KPIs (active count, due actions, critical alerts)
  UC-->>S: DashboardViewModel
  S-->>B: render KPIs + alerts + active batches + journey entries
```

## Open statistics & change period

```mermaid
sequenceDiagram
  actor B as Brewer
  participant S as "Mobile — StatisticsScreen"
  participant UC as "Mobile — statistics.use-cases"
  participant HTTP as "core/http/http-client"
  participant API as "API — batches / recipes"

  B->>S: Open Statistiques (default period = year)
  S->>UC: getStatistics(period)
  UC->>HTTP: GET /batches + /recipes (period-filtered)
  HTTP->>API: forward
  API-->>UC: rows
  UC->>UC: aggregate (brewed, in-progress, success rate, volume, signed recipes)
  UC-->>S: StatisticsViewModel
  B->>S: Change period (30d / 90d / all)
  S->>UC: getStatistics(newPeriod)
  UC-->>S: recomputed StatisticsViewModel
```

## Notes / suggestions

- **Aggregation locus**: shown client-side over API rows (KISS for v0). **Suggestion**
  — if datasets grow, move aggregation to a dedicated API endpoint
  (`GET /statistics?period=`) so the mobile doesn't pull all rows; flag as the
  scaling path (don't build yet — YAGNI).
- **Egress**: via `core/http/http-client`; demo mode aggregates the in-memory
  demo batches/recipes.
- **Period filter (#646)** currently exists but is pinned to "year" — this
  sequence is what unpins it.
