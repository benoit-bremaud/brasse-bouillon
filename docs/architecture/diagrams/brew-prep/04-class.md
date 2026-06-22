# Class diagram — brew-prep — volume planning & readiness model

> **Feature**: first real-world brew — the pre-batch domain model.
> **Related ADRs**: ADR-0020 (equipment-driven, backend-computed).

## Context

The domain types behind ADR-0020: how an `EquipmentProfile` + a `Recipe`'s
targets derive a `VolumePlan`, and how readiness gates the launch. Crown jewel:
**the fermenter caps the batch**.

## Diagram

```mermaid
classDiagram
  class Recipe {
    +UUID id
    +string style
    +number ogTarget
    +number fgTarget
    +number ibu
    +number ebc
  }
  class EquipmentProfile {
    +number fermenterCapacityL
    +number fermenterHeadspaceRatio
    +number kettleCapacityL
    +number boilOffRatePerHourL
    +number grainAbsorptionLPerKg
    +number kettleLossL
    +number fermenterLossL
  }
  class VolumePlan {
    <<value object>>
    +Method method
    +number strikeWaterL
    +number spargeWaterL
    +number preBoilL
    +number postBoilL
    +number intoFermenterL
    +number bottledL
  }
  class ChecklistItem {
    +string name
    +string qty
    +boolean required
    +boolean have
  }
  class ReadinessChecklist {
    +Kind kind
    +ChecklistItem[] items
    +isComplete() boolean
  }
  class BrewReadiness {
    +boolean readyToLaunch
  }
  Recipe "1" ..> "1" VolumePlan : targets feed
  EquipmentProfile "1" ..> "1" VolumePlan : caps & method (D1/D2)
  BrewReadiness "1" o-- "1" VolumePlan
  BrewReadiness "1" o-- "2" ReadinessChecklist
  ReadinessChecklist "1" *-- "1..*" ChecklistItem
```

## Notes

- **Derivation (ADR-0020 D1/D2):**
  `intoFermenterL = fermenterCapacityL × (1 − fermenterHeadspaceRatio)`;
  `bottledL = intoFermenterL − fermenterLossL`; the cascade is back-calculated up
  to `strikeWaterL`;
  `method = kettleCapacityL ≥ (strikeWaterL + grainVolumeL) ? FULL_VOLUME : DUNK_SPARGE`
  — the kettle must hold the **mash-in volume** (strike water + grain, grain
  displacing ~0.67 L/kg) *during the mash*, **not** the post-boil wort (the grain
  is lifted out before the boil). Matches ADR-0020 D2.
- `VolumePlan` is **computed and persisted by the backend** — not stored on the
  recipe; snapshotted onto the batch at launch (ADR-0020 D3).
- `BrewReadiness.readyToLaunch = ingredientChecklist.isComplete() && equipmentChecklist.isComplete()` (UC6).
- Enums: `Method` = {FULL_VOLUME, DUNK_SPARGE}; `Kind` = {INGREDIENT, EQUIPMENT}.
- **Design patterns (named, see ADR-0020 § Design patterns):** `VolumePlan` is a
  **Value Object** (immutable, identity-less — the `«value object»` stereotype);
  the derivation `Recipe + EquipmentProfile → VolumePlan` is owned by the
  **Domain Service** `VolumePlanner` (component 03); the launch snapshot is a
  **Memento** (state 05); and `Method` is a **Strategy seam** — a plain
  conditional today, promoted to a `MashStrategy` only if a third method appears
  (YAGNI).
