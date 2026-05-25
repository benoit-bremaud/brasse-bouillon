# ADR-0010 — Extend `RecipeStepType` to the 9-phase brewing set

**Status**  Proposed
**Date**    2026-05-25
**Owners**  @benoit-bremaud

> Records decision **D1** surfaced by the brewing-session conception
> ([`docs/architecture/specs/brewing-session.md`](../specs/brewing-session.md),
> PR #1096). Gates the guided-brewing implementation (#781) and recipe steps
> (#410–#420). Sibling of the BeerXML/BeerJSON mapping epic #866.

---

## Context

A recipe's ordered steps **are** the brewing process. Today `RecipeStepType`
(both `packages/api/src/recipe/domain/enums/recipe-step-type.enum.ts` and the
mobile `recipe.types.ts`) has **5 values**: `MASH, BOIL, WHIRLPOOL,
FERMENTATION, PACKAGING`.

The guided-brewing assistant (#781/#868) and the standard all-grain workflow
(grounded in BeerXML 1.0, BeerJSON 1.0, BrewDog DIY Dog — see the brewing-session
spec) need a finer **9-phase** sequence to drive per-phase timers, temperatures
and pedagogical tips:

`mash → sparge → boil → whirlpool → cool → pitch → primary_fermentation →
dry_hop → conditioning_packaging`.

The 5-value enum cannot express sparge, cool, pitch, or the split of
"fermentation" into primary / dry-hop / conditioning. The choice crosses three
surfaces — the **API enum + entity**, the **mobile domain types**, and the
**BeerXML/BeerJSON import/export mapping** (#866) — so it must be decided before
the assistant is built, not discovered mid-implementation.

---

## Decision

**Extend `RecipeStepType` to the 9-phase `BrewPhase` set**, applied consistently
in the API enum, the API `recipe_steps` rows, and the mobile domain type:

`mash, sparge, boil, whirlpool, cool, pitch, primary_fermentation, dry_hop,
conditioning_packaging`.

- **Optional phases** (`sparge` for BIAB, `whirlpool`, `dry_hop`) appear only
  when the recipe carries the matching data — the step list is recipe-derived,
  never a fixed 9.
- **Migration is additive**: existing rows keep their legacy values (`mash`,
  `boil`, `whirlpool`, `fermentation`, `packaging`); a data migration maps legacy
  `fermentation → primary_fermentation` and `packaging → conditioning_packaging`.
  No row is dropped.
- **BeerXML/BeerJSON mapping (#866)** is the translation layer: BeerJSON's
  explicit boil/whirlpool steps and sparge-as-mash-step map onto these phases;
  the mapping table lives with #866, not duplicated here.
- The guided assistant reads the **snapshot** of these steps copied onto the
  batch at session start (per the brewing-session conception), so a later recipe
  edit never mutates an in-flight batch.

---

## Consequences

### Positive

- The assistant can drive correct per-phase timers/temps/tips (the #781 goal).
- One vocabulary shared by recipes, batches and the BeerXML mapping — no
  per-feature ad-hoc step lists.
- Additive migration → no data loss, backward-compatible reads during rollout.

### Trade-offs

- A coordinated change across API enum + entity + migration + mobile types +
  the #866 mapping; must land together to avoid a split-brain enum.
- `whirlpool` already exists as a 5-set value **and** appears in the 9-set —
  confirm it is not double-counted when mapping (decision **D2**, see below).

### Rejected alternatives

- **Keep 5 values, encode sub-phases in free text** — unparseable, defeats
  timers/tips; rejected.
- **A separate `BrewPhase` enum only on the batch side** — would desync recipe
  authoring from execution and duplicate the mapping; rejected in favour of one
  shared enum.

### Open follow-ups

- **D2** — whirlpool as its own phase vs a boil sub-step (BeerJSON makes it
  explicit; #781 folds it into boil/cool). Resolve when wiring the mapping.

---

## References

- Spec [`docs/architecture/specs/brewing-session.md`](../specs/brewing-session.md) (§ canonical phases, D1).
- Brewing-session UML [`docs/architecture/diagrams/brewing-session/`](../diagrams/brewing-session/) (class `BrewPhase`).
- Recipes UML [`docs/architecture/diagrams/recipes/`](../diagrams/recipes/).
- Epics #868 (guided session), #781 (assistance), #866 (BeerXML/BeerJSON mapping), #605/#608 (batch model + step state).
