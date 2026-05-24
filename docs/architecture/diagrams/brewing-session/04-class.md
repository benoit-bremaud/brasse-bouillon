# Class diagram — brewing-session — domain model

> **Feature**: epic #868; data model #605.
> **Source spec**: `docs/architecture/specs/brewing-session.md`

## Context

The domain entities a guided session needs and their relations. Captures the
#605 extension (Measurement / Observation / Alert + batch metadata + step
timestamps) and the recipe link that makes the step list **recipe-derived**.
This is the conceptual model (cross-package); the persistence mapping (TypeORM
entities) and the API/mobile split live in `03-component.md`.

## Diagram

```mermaid
classDiagram
  class Batch {
    +UUID id
    +UUID ownerId
    +UUID recipeId
    +BatchStatus status
    +int currentStepOrder
    +Date plannedDate
    +Date actualStartDate
    +float targetVolume
    +float realVolume
    +Date completedAt
  }
  class BatchStep {
    +UUID batchId
    +int stepOrder
    +BrewPhase type
    +string label
    +string description
    +string pedagogicalTip
    +int plannedDurationMin
    +BatchStepStatus status
    +Date plannedStart
    +Date actualStart
    +Date plannedEnd
    +Date actualEnd
    +string skipReason
  }
  class Measurement {
    +UUID id
    +MeasurementType type
    +float value
    +string unit
    +Date timestamp
  }
  class Observation {
    +UUID id
    +string freeText
    +string[] photoRefs
    +int moodScore
    +Date timestamp
  }
  class Alert {
    +UUID id
    +AlertTrigger trigger
    +AlertSeverity severity
    +Date createdAt
    +Date dismissedAt
  }
  class RecipeStep {
    +UUID recipeId
    +int order
    +BrewPhase type
    +float stepTemp
    +int stepTime
  }

  Batch "1" o-- "1..*" BatchStep : derived from recipe
  BatchStep "1" o-- "0..*" Measurement
  BatchStep "1" o-- "0..*" Observation
  BatchStep "1" o-- "0..*" Alert
  RecipeStep "1" ..> "1" BatchStep : seeds (recipe-derived)

  class BatchStatus {
    <<enumeration>>
    in_progress
    completed
  }
  class BatchStepStatus {
    <<enumeration>>
    pending
    in_progress
    paused
    completed
    skipped
  }
  class BrewPhase {
    <<enumeration>>
    mash
    sparge
    boil
    whirlpool
    cool
    pitch
    primary_fermentation
    dry_hop
    conditioning_packaging
  }
  class MeasurementType {
    <<enumeration>>
    OG
    FG
    temperature
    pH
    SG_spot
  }
  class AlertSeverity {
    <<enumeration>>
    info
    warning
    critical
  }
```

## Notes

- **`BrewPhase`** is the 9-phase set from the spec — it **extends** today's API
  `RecipeStepType` (5 values) and the mobile `BatchStepType` (5 values). This is
  decision **D1** (ADR needed before build) — flagged here so the model is not
  silently committed.
- **Recipe-derived steps**: `RecipeStep ..> BatchStep` — starting a session
  copies the recipe's ordered steps into batch steps (snapshot), so editing the
  recipe later does not mutate an in-flight batch.
- **`pedagogicalTip` + `plannedDurationMin`** live on `BatchStep` (snapshot from
  recipe/phase defaults) so the timer and ⓘ tip work offline without re-reading
  the recipe.
- New entities (`Measurement`, `Observation`, `Alert`) are #605; they compose
  under `BatchStep` (cascade delete with the batch).
