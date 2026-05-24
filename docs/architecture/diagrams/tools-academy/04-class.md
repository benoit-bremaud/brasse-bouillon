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
    +IonRange calcium
    +IonRange sulfate
    +IonRange chloride
  }
  class AcademyTopic {
    +string slug
    +string title
    +AcademyTopicStatus status
    +AcademyMascotVariant mascot
    +CalculatorSlug calculator
  }
  class GlossaryTerm {
    +string term
    +string definition
  }

  Calculator ..> CalculationResult : produces
  SavedCalculation ..> CalculationResult : stores
  AcademyTopic ..> Calculator : links (optional)
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
- **`AcademyTopic.calculator`** already links a topic to its calculator (UC8) —
  the learn→compute bridge exists in the type.
- **`GlossaryTerm`** is content; **suggestion** — back it by the API (#914) and
  reuse it for the brewing-session pedagogical tips + recipe term tooltips, so
  there is **one glossary** across the app rather than three.
- **Unit i18n (#660)**: a `UnitSystem` (see account `Profile`) should drive
  calculator display units — cross-link so units are a single preference.
