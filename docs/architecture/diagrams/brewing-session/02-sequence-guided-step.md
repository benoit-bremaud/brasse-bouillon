# Sequence diagram — brewing-session — execute a guided step

> **Feature**: epic #868; step state machine #608; assistance #781.
> **Source spec**: `docs/architecture/specs/brewing-session.md`

## Context

What happens in time when the brewer runs one phase of the session: start the
step (persist timestamp, launch the countdown), optionally record a measurement,
read the tip, then complete and advance. Shows the mobile ↔ API boundary and the
offline-resilient timer. Does not cover session creation (recipe → batch steps
snapshot) — that precedes this loop.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant S as "Mobile — BrewingSessionScreen"
  participant UC as "Mobile — step.use-cases"
  participant HTTP as "core/http/http-client"
  participant API as "API — batches controller"
  participant DB as "DB"

  Note over S: current step = in_progress (recipe-derived)
  B->>S: Tap "Démarrer l'étape"
  S->>UC: startStep(batchId, stepId)
  UC->>HTTP: POST /batches/:id/steps/:stepId/start
  HTTP->>API: forward
  API->>DB: set actualStart, status=in_progress
  API-->>S: 200 { step }
  S->>S: persist actualStart locally, start countdown

  opt Record a measurement
    B->>S: Enter OG / temp value
    S->>UC: recordMeasurement(stepId, type, value)
    UC->>HTTP: POST /batches/:id/steps/:stepId/measurements
    HTTP->>API: forward
    API->>DB: insert Measurement
    API-->>S: 201 { measurement }
  end

  opt Read the tip
    B->>S: Tap ⓘ
    S-->>B: show pedagogical tip (local, from step snapshot)
  end

  Note over S: countdown reaches target → visual shift (trigger, not a transition)
  B->>S: Tap "Terminer l'étape" (confirm)
  S->>UC: completeStep(batchId, stepId)
  UC->>HTTP: POST /batches/:id/steps/:stepId/complete
  HTTP->>API: forward
  API->>DB: set actualEnd, status=completed; advance currentStepOrder
  API-->>S: 200 { batch }
  S-->>B: render next step (or celebration if last)
```

## Notes

- **Egress is explicit**: the screen calls a use-case, which calls
  `core/http/http-client` — never a direct `fetch` (ADR / project rule). The
  component diagram (`03-component.md`) makes this boundary structural.
- **Offline-resilient timer**: `actualStart` is persisted locally on Start so
  the countdown is recomputed on reopen even before the API round-trip resolves;
  the API call reconciles the server timestamp.
- **Confirm on Complete**: irreversible transition → confirmation modal (#608).
- **Tip is local**: read from the step snapshot (no network), so it works mid-brew
  without signal.
- **Demo mode**: the same use-cases branch on `dataSource.useDemoData` and mutate
  the in-memory demo batch instead of calling the API (existing pattern).
