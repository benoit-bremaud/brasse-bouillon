# Class diagram — batches — the batch aggregate & 5-section view

> **Feature**: epic #595; data model #605; 5-section detail #606.
> **Shared entities**: `Measurement`, `Observation`, `Alert`, `BatchStep` are
> detailed in `diagrams/brewing-session/04-class.md` — not redrawn here.

## Context

The Batch aggregate as the journal sees it, and how the 5 detail sections (#606)
project over it. The live-execution entities (steps, measurements, observations,
alerts) are owned by the brewing-session class diagram; this one shows the batch
root, its recipe link, and the section grouping so the detail-screen rewrite has
a structural map.

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
    +Date archivedAt
  }
  class Recipe {
    +UUID id
    +string name
    +int version
  }
  class BatchStep {
    +int stepOrder
    +BatchStepStatus status
  }
  class Measurement {
    +MeasurementType type
    +float value
  }
  class Observation {
    +string freeText
  }
  class Alert {
    +AlertSeverity severity
  }

  Batch "1" --> "1" Recipe : recipeId (snapshot link)
  Batch "1" o-- "1..*" BatchStep
  Batch "1" o-- "0..*" Measurement
  Batch "1" o-- "0..*" Observation
  Batch "1" o-- "0..*" Alert

  note for Batch "5-section detail (#606) is a VIEW over this aggregate:\n1 Identity = Batch + Recipe link\n2 Plan = Recipe ingredients/equipment\n3 Live/History = BatchStep[]\n4 Measurements = Measurement[]\n5 Notes = Observation[]"

  class BatchStatus {
    <<enumeration>>
    in_progress
    completed
  }
```

## Notes

- **The 5 sections are presentation, not new entities** — the `note` maps each
  section to the underlying data. Keeping that explicit prevents the rewrite
  from inventing parallel models.
- **`recipeId` is a snapshot link**: the batch references the recipe it was
  started from, but its step list is copied at start (see brewing-session) so a
  later recipe edit/fork does not mutate a recorded batch.
- **`archivedAt`** is the only field this journal adds beyond #605 (for UC9
  archive); confirm with the data-model issue before migration.
- **Entity field detail** (Measurement/Observation/Alert columns, enums) lives in
  `brewing-session/04-class.md` — single source, cross-referenced.
