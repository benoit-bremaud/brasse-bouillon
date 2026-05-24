# Sequence diagram — batches — open detail & record a measurement

> **Feature**: 5-section detail #606; measurement entry #607.
> **Source**: mobile `features/batches` + API `batches` module.

## Context

Two journal interactions: loading the 5-section batch detail, and recording a
measurement from the Measurements section (retrospective entry, any time — not
necessarily mid-live-step). The live-step start/complete flow is in
`brewing-session/02-sequence`.

## Open the 5-section detail

```mermaid
sequenceDiagram
  actor B as Brewer
  participant L as "Mobile — BatchesScreen (list)"
  participant S as "Mobile — BatchDetailsScreen"
  participant UC as "Mobile — batches.use-cases"
  participant HTTP as "core/http/http-client"
  participant API as "API — batches controller"

  B->>L: Tap a batch
  L->>S: navigate(batchId)
  S->>UC: getBatchDetailsViewModel(batchId)
  UC->>HTTP: GET /batches/:id (steps, measurements, observations, alerts)
  HTTP->>API: forward
  API-->>S: 200 { batch, steps, measurements, observations, alerts }
  S-->>B: render Identity / Plan / Live / Measurements / Notes
```

## Record a measurement

```mermaid
sequenceDiagram
  actor B as Brewer
  participant S as "Mobile — Measurements section"
  participant UC as "Mobile — batches.use-cases"
  participant HTTP as "core/http/http-client"
  participant API as "API — batches controller"
  participant DB as "DB"

  B->>S: Tap "Ajouter une mesure", pick type (OG/temp/pH), enter value
  S->>UC: recordMeasurement(batchId, stepId?, type, value, unit)
  UC->>HTTP: POST /batches/:id/measurements
  HTTP->>API: forward
  API->>DB: insert Measurement (timestamp = now)
  API->>API: re-evaluate threshold alerts
  API-->>S: 201 { measurement, alerts? }
  S-->>B: append row to the Measurements table (+ alert badge if raised)
```

## Notes

- **Egress**: screen → use-case → `core/http/http-client`; no direct `fetch`.
- **`getBatchDetailsViewModel`** already exists (assembles recipe name + steps);
  the rewrite extends it to also fetch measurements/observations/alerts for the
  5 sections.
- **Alert re-evaluation** happens server-side on measurement insert (threshold
  breach) — the brewer then *reviews* it (use-case UC6), it is not pushed.
- **Demo mode**: use-cases mutate the in-memory demo batch (existing pattern).
