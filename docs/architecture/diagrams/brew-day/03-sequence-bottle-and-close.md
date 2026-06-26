# Sequence diagram — brew-day — Bottle and close the batch (B3)

> **Feature**: first real brew — making the LIVE journey reach the bottle (roadmap P0 "TRACKER → ASSISTANT", B3).
> **Realizes**: B3. **Related**: step enrichment ([`01-sequence-step-enrichment.md`](01-sequence-step-enrichment.md)), gravity measurement ([`02-sequence-record-gravity-measurement.md`](02-sequence-record-gravity-measurement.md)), ADR-0020 (volume), ADR-0021 (D4 — bottle sanitizing belongs to this phase).

## Context

In LIVE mode the journey **dead-ends** at the **PACKAGING** step (a disabled "Brassin terminé" button; the celebration screen is demo-only). B3 turns that step into a real **bottling + closure** flow: the app gives a beginner-safe **priming-sugar** dose (to carbonate in-bottle), a **bottle-bomb safety** gate, the bottling gestures, then **closes** the batch live and lets the novice record a first **tasting**. This diagram covers only that interaction; it reuses the existing step engine (`completeCurrentStep`) and the existing volume (ADR-0020) — no recompute.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant M as Mobile (BottlingScreen)
  participant UC as Use-case (closeBottling / recordTasting)
  participant API as Backend API
  B->>M: Reach the "Conditionnement" step, tap "Mettre en bouteille"
  M->>API: GET /batches/:id/priming
  API-->>M: sugarGrams, sugarType, targetCo2Vol, volumeL, safetyWarning
  M-->>B: Show priming dose + bottling gestures + a prominent bottle-bomb warning
  Note over M,B: simple rule ~6-7 g/L table sugar by default; precise formula (CO2 vol + temperature) is an advanced option
  B->>M: Tick "j'ai compris le risque" (required), then "Mettre en bouteille / clôturer"
  M->>UC: closeBottling(batchId)
  UC->>API: POST /batches/:id/bottling/close
  API->>API: set bottledAt, then completeCurrentStep(PACKAGING) -> batch COMPLETED
  API-->>UC: closed batch (COMPLETED, bottledAt set)
  UC-->>M: batch closed
  M-->>B: Live closure / celebration (real volume + dates, no mock)
  opt Record a first tasting
    B->>M: Open "Noter ma dégustation", rate 1-5 stars + free note
    M->>UC: recordTasting(batchId, rating, note)
    UC->>API: POST /batches/:id/tasting
    API-->>UC: 201 TastingDto
    UC-->>M: tasting saved -> shown on the closure view
  end
```

## Notes

- **Reuses the existing step engine (no rewrite):** the batch already auto-advances and auto-COMPLETES on the final step (`BatchDomainService.completeCurrentStep`); the seeded Blonde recipe already declares a **PACKAGING** step ("Conditionnement"). `POST /bottling/close` sets `bottledAt` AND drives the PACKAGING completion through that proven path — it does **not** duplicate completion logic.
- **Priming = read-only computation (founder decision):** `GET /priming` returns a **simple ~6-7 g/L table-sugar** dose by default (zero input); a **precise** mode (target CO2 volumes + beer temperature) is an advanced option. Volume comes from the batch / recipe (ADR-0020) — never recomputed here.
- **Closure = `bottledAt` timestamp, status stays COMPLETED (founder decision):** mirrors `fermentation_completed_at`; no new BOTTLED status (see [`05-state-batch-closure.md`](05-state-batch-closure.md)).
- **Safety (founder decision):** a prominent bottle-bomb warning **plus a required "j'ai compris" checkbox** — closing is disabled until it is ticked. The only real physical risk of the novice journey (over-priming -> over-pressure).
- **Tasting (founder decision):** a **1-5 star rating + a free note** (no structured BJCP form in v1); optional, recorded after closure; replaces the placeholder "Noter ma dégustation" that today just navigates back.
- **Cleaning (ADR-0021 D4):** sanitizing the **bottles** belongs to this bottling phase; the broader pre/post cleaning ritual is the P1 epic.
