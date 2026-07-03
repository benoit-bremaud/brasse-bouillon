# Class diagram — recipe-difficulty — data model & compute inputs

> **Feature**: recipe difficulty badge (screen-review Tranche B)
> **Source specs**: `docs/architecture/specs/recipe-difficulty-algorithm.md`
> **Related ADRs**: ADR-0024
> **Decisions captured**: D2, D3, D4 (ADR-0024)

## Context

The additions to the recipe model (three fields) and the existing sub-entities the rule engine
reads. Only `Recipe` gains fields; the sub-entities are unchanged (all signals already exist —
all-grain baseline, no `brewMethod`).

## Diagram

```mermaid
classDiagram
  class Recipe {
    +UUID id
    +String name
    +String style
    +Real ogTarget
    +Real abvEstimated
    +Real ibuTarget
    +Real ebcTarget
    +DifficultyLevel difficultyComputed
    +DifficultyLevel~nullable~ difficultyOverride
    +DifficultyReason[] difficultyReasons
    +difficultyEffective() DifficultyLevel
  }
  class DifficultyLevel {
    <<enumeration>>
    facile
    intermediaire
    avance
  }
  class DifficultyReason {
    +String factor
    +int tier
    +String sentence
  }
  class RecipeYeast {
    +RecipeYeastType type
    +int temperatureMaxC
  }
  class RecipeYeastType {
    <<enumeration>>
    ale
    lager
    wild
    brett
  }
  class RecipeHop {
    +String variety
    +RecipeHopAdditionStage additionStage
  }
  class RecipeWater {
    +Real calciumPpm
    +Real magnesiumPpm
    +Real sulfatePpm
    +Real chloridePpm
    +Real phTarget
  }
  class DifficultyService {
    +compute(Recipe) DifficultyResult
  }

  Recipe "1" --> "1" DifficultyLevel : computed
  Recipe "1" --> "0..1" DifficultyLevel : override
  Recipe "1" o-- "0..*" DifficultyReason
  Recipe "1" o-- "1..*" RecipeYeast
  RecipeYeast "1" --> "1" RecipeYeastType
  Recipe "1" o-- "0..*" RecipeHop
  Recipe "1" o-- "0..1" RecipeWater
  DifficultyService ..> Recipe : reads
  DifficultyService ..> DifficultyReason : produces
```

## Notes

- **New on `Recipe`**: `difficultyComputed` (not null), `difficultyOverride` (nullable),
  `difficultyReasons` (json). `difficultyEffective()` = `override ?? computed` (ADR-0024 D3).
- **`DifficultyReason`** is the stored breakdown that feeds tap-to-explain — computed on write,
  read as-is (no client compute).
- The rule-engine inputs (spec §F1–F6): `RecipeYeast.type` (+ `temperatureMaxC`),
  `RecipeWater` ion/pH targets, `RecipeHop.variety` (for the F6 variety count),
  and `ogTarget`/`abvEstimated`/`ebcTarget` on `Recipe`. `RecipeStep` is **not** an input
  (F5 mash complexity deferred — no per-rest temperature). The sub-entities themselves are
  **unchanged** by this feature — only `Recipe` gains the three difficulty fields.
- `DifficultyService` holds no state — a pure function (ADR-0024 D1), which is why it is a
  service, not an entity.
