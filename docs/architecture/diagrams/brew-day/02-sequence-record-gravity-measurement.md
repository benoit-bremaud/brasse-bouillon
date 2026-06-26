# Sequence diagram — brew-day — Record a gravity measurement (B2)

> **Feature**: first real brew — making fermentation measurement work in **LIVE** mode (roadmap P0 "TRACKER → ASSISTANT").
> **Realizes**: B2 (US-0404). **Related**: brew-day step enrichment ([`01-sequence-step-enrichment.md`](01-sequence-step-enrichment.md)), brew-prep state machine ([`../brew-prep/05-state-readiness.md`](../brew-prep/05-state-readiness.md)).

## Context

Today the mobile has **no** measurement-entry UI; the fermentation tracker is demo-only. B2 adds the first **write path**: a novice records the **original gravity (OG)** at the start and the **final gravity (FG)** at the end of fermentation, against the live batch, via the **already-existing** `POST /batches/:id/measurements` API. The app then **computes and explains** ABV client-side. This diagram covers only that interaction (OG/FG entry + the no-hydrometer alternate + the implausible-value guard); it does **not** redesign the backend.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant M as Mobile (MeasurementEntryScreen)
  participant UC as Use-case (recordBatchMeasurement)
  participant API as Backend API (existing)
  B->>M: Open my batch, tap "Saisir une densité"
  M->>B: Form - pick OG or FG, enter SG (e.g. 1.050)
  alt No hydrometer (escape, never a dead-end)
    B->>M: Tap "Je n'ai pas de densimètre"
    M-->>B: Buy-advice card; proceed without OG/FG; ABV marked unavailable (no estimate)
  else A reading is entered
    B->>M: Submit value
    M->>M: Client guard - if FG >= OG, block and explain in plain words
    M->>UC: recordBatchMeasurement(batchId, type, value, takenAt)
    alt demo mode
      UC->>UC: local mock (mirrors the existing demo tracker)
    else live mode
      UC->>API: POST /batches/:id/measurements (type, value, takenAt)
      alt value within SG range 0.99 to 1.2
        API-->>UC: 201 MeasurementDto
      else out of range
        API-->>UC: 400 MeasurementValidationError
        UC-->>M: surface the range error in plain words
      end
    end
    UC-->>M: measurement saved
    M->>M: invalidate batch cache, recompute ABV = (OG - FG) x 131.25
    M-->>B: Show ABV + plain explanation (or "ABV calculée à la fin" if only OG yet)
  end
```

## Notes

- **Reuses the existing API verbatim (no redesign):** `POST` + `GET /batches/:id/measurements`, `CreateMeasurementDto` (`type` in `og`/`fg`/`sg_spot`, `value`, `takenAt`), ownership via `getMineBatch`, and `measurement.factory` range validation (gravity `[0.99, 1.2]` -> `400`). B2's backend work is therefore minimal.
- **OG + FG only for v1** (founder decision): interim `sg_spot` readings are **deferred** (atomic refinement once the app is used on real brews). Consequence captured below.
- **Fermentation end = taught, not auto-detected** (founder decision): with OG/FG only the app cannot compute gravity stability, so it **teaches the rule** ("stable 2-3 days = done") and the brewer judges and records FG. The app does **not** auto-write `fermentation_completed_at`; completion stays an explicit user action on the existing independent lifecycle.
- **No hydrometer = never a dead-end** (founder decision, US-0404): advise buying one, let the brew proceed, show **"alcool indisponible"** — **no** fabricated estimate (pedagogy).
- **Implausible value guard** (founder decision): `FG >= OG` is blocked **client-side** with a plain explanation — this is distinct from the API's range `400` (which guards `[0.99, 1.2]`).
- **ABV computed client-side** (KISS): `(OG - FG) x 131.25`, rounded to 1 decimal, in a pure helper; the `abv_actual` server snapshot is **deferred**. Pedagogy is the maître-mot: the screen explains what OG/FG/ABV are (BeerXML/BJCP vocab: OG = densité initiale, FG = densité finale).
- **Clean Architecture:** `presentation` (MeasurementEntryScreen) -> `application` (recordBatchMeasurement, demo/live branch) -> `data` (batches.api via the shared http-client); domain stays type-only. Mirrors the existing `completeCurrentBatchStep` flow.
