# Class diagram — tools & academy — calculators, topics, glossary

> **Feature**: calculators E03; academy E06; save/history #657; glossary #914.
> **Source**: `features/tools/domain/academy.types.ts`, `water-profiles.ts`,
> `@/core/brewing-calculations`.

## Context

The model behind calculators and academy. Calculators are pure functions over
typed inputs (no persistence unless a calculation is saved — #657). Academy topics
and glossary terms are content. Reflects existing types; `SavedCalculation` and
the API-backed `GlossaryTerm` are flagged additions.

## Diagram

```mermaid
classDiagram
  class Calculator {
    +CalculatorSlug slug
    +compute(inputs) CalculationResult
  }
  class CalculationResult {
    +string metric
    +float value
    +string unit
  }
  class SavedCalculation {
    +UUID id
    +CalculatorSlug slug
    +json inputs
    +CalculationResult result
    +Date savedAt
  }
  class WaterStylePreset {
    +WaterStylePresetId id
    +string name
    +string description
    +IonRange ca
    +IonRange mg
    +IonRange na
    +IonRange so4
    +IonRange cl
    +IonRange hco3
  }
  class AcademyTopic {
    +string slug
    +string title
    +AcademyTopicStatus status
    +AcademyMascotVariant mascotVariant
    +string mascotAlt
    +string calculatorDescription
    +int calculatorOrder
  }
  class GlossaryTerm {
    +string term
    +string definition
  }

  Calculator ..> CalculationResult : produces
  SavedCalculation ..> CalculationResult : stores
  AcademyTopic ..> Calculator : links by slug (calculatorOrder/Description)
  AcademyTopic ..> GlossaryTerm : references

  class CalculatorSlug {
    <<enumeration>>
    couleur
    houblons
    fermentescibles
    levures
    eau
    rendement
    carbonatation
    avances
  }
  class AcademyTopicStatus {
    <<enumeration>>
    ready
    coming_soon
  }
```

## Notes / suggestions

- **Calculators are pure** (`@/core/brewing-calculations`): inputs → result, no
  state. `SavedCalculation` (#657) is the only persistence, and only if save is
  built — KISS/YAGNI until then.
- **`AcademyTopic`** has no direct `calculator` field; it carries
  `calculatorDescription` + `calculatorOrder` and links to a calculator **by slug
  convention** (the learn→compute bridge). `AcademyTopicStatus` literals are
  `"ready"` / `"coming-soon"` (rendered `coming_soon` in the enum — Mermaid avoids
  the hyphen).
- **`GlossaryTerm`** is content; **suggestion** — back it by the API (#914) and
  reuse it for the brewing-session pedagogical tips + recipe term tooltips, so
  there is **one glossary** across the app rather than three.
- **Unit i18n (#660)**: a `UnitSystem` (see account `Profile`) should drive
  calculator display units — cross-link so units are a single preference.
