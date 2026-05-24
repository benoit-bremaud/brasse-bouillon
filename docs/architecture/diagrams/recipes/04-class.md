# Class diagram — recipes — domain model & versioning

> **Feature**: epic #740; versioning #882 #883; write CRUD #410–#420.
> **Source**: `packages/api/src/recipe/entities/*` and
> `packages/mobile-app/src/features/recipes/domain/recipe.types.ts`.

## Context

The recipe aggregate and its ingredient/step satellites, plus the
root/parent/version lineage that powers clone and fork. Reflects the **existing**
schema (not a proposal) so the write-CRUD UI maps onto real tables. The 9-phase
`RecipeStepType` extension is the brewing-session decision D1, not made here.

## Diagram

```mermaid
classDiagram
  class Recipe {
    +UUID id
    +UUID ownerId
    +string name
    +string description
    +RecipeVisibility visibility
    +int version
    +UUID rootRecipeId
    +UUID parentRecipeId
    +float batchSizeL
    +int boilTimeMin
    +float ogTarget
    +float fgTarget
    +float abvEstimated
    +float ibuTarget
    +float ebcTarget
    +float efficiencyTarget
    +string style
    +UUID importedFromRecipeId
    +string importProvenance
    +int brewCount
    +float avgRating
    +bool isOfficial
  }
  class RecipeStep {
    +UUID recipeId
    +int stepOrder
    +RecipeStepType type
    +string label
    +string description
  }
  class RecipeHop {
    +UUID recipeId
    +string variety
    +RecipeHopType type
    +float weightG
    +float alphaAcidPercent
    +RecipeHopAdditionStage additionStage
    +int additionTimeMin
  }
  class RecipeFermentable {
    +UUID recipeId
    +string name
    +RecipeFermentableType type
    +float weightG
    +float potentialGravity
    +float colorEbc
  }
  class RecipeYeast {
    +UUID recipeId
    +string name
    +RecipeYeastType type
    +float amountG
    +float attenuationPercent
    +float temperatureMinC
    +float temperatureMaxC
  }
  class RecipeAdditive {
    +UUID recipeId
    +string name
    +RecipeAdditiveType type
    +float amountG
    +RecipeStepType additionStep
    +int additionTimeMin
  }
  class RecipeWater {
    +UUID recipeId
    +float mashVolumeL
    +float spargeVolumeL
    +float mashTemperatureC
    +float spargeTemperatureC
    +float calciumPpm
    +float sulfatePpm
    +float chloridePpm
    +float phTarget
  }

  Recipe "1" o-- "0..*" RecipeStep
  Recipe "1" o-- "0..*" RecipeHop
  Recipe "1" o-- "0..*" RecipeFermentable
  Recipe "1" o-- "0..*" RecipeYeast
  Recipe "1" o-- "0..*" RecipeAdditive
  Recipe "1" o-- "0..1" RecipeWater
  Recipe "1" --> "0..1" Recipe : parentRecipeId (fork)
  Recipe "1" --> "1" Recipe : rootRecipeId (lineage)

  class RecipeVisibility {
    <<enumeration>>
    private
    unlisted
    public
  }
  class RecipeHopAdditionStage {
    <<enumeration>>
    first_wort
    boil
    whirlpool
    dry_hop
  }
  class RecipeStepType {
    <<enumeration>>
    mash
    boil
    whirlpool
    fermentation
    packaging
  }
```

## Notes

- **Versioning** is the two self-references: `rootRecipeId` (first recipe of the
  lineage, immutable) + `parentRecipeId` (direct parent). A fork = new Recipe,
  `version+1`, same `rootRecipeId`, `parentRecipeId` = source. No mutation of the
  source — variants are first-class rows.
- **Clone from community** (#601, implemented): deep-copies all satellites into a
  **new private root** (`rootRecipeId = newId`, `parentRecipeId = null`,
  `version = 1`); provenance kept in `importedFromRecipeId` + `importProvenance`.
- **Ingredient satellites** are one-to-many by `recipeId` FK; `RecipeWater` is
  0..1 (one water profile per recipe). Enums shown are the load-bearing ones;
  fermentable/yeast/additive type enums omitted for space (exist in the API).
- **`RecipeStepType` (5 values)** is shared with the brewing session; its 9-phase
  extension is brewing-session **D1** (ADR before build), not decided here.
