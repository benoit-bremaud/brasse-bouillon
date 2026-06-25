# ADR-0021 — Equipment readiness = reusable profile + capacity fit-check + cleaning ritual; adaptive pedagogy

**Status**  Proposed
**Date**    2026-06-24
**Owners**  @benoit-bremaud

> Settles how "equipment readiness" works in the novice brew-preparation journey,
> after the first-brew debrief showed it is **not** a per-brew possession checklist.
> Conception: [`../diagrams/equipment-cleaning/`](../diagrams/equipment-cleaning/).
> Builds on ADR-0020 (equipment-driven volume planning) and refines brew-prep
> ([`../diagrams/brew-prep/`](../diagrams/brew-prep/)). Relates: ADR-0002, ADR-0001.

## Context

"A3 = an equipment checklist mirroring the ingredient one" proved wrong:

- the backend has **no recipe↔equipment relation** — equipment is the brewer's,
  stored as reusable **`equipment_profiles`** (per-user CRUD) + an
  **`equipment_templates`** catalog;
- equipment is **durable / reusable** (declared once, reused every brew), unlike
  consumed ingredients — so re-ticking owned gear each brew is meaningless;
- a live recipe (the blonde) carries no equipment; mobile has only a read-only
  list (no capture);
- the product's **maître-mot is education** — a novice must learn to brew on
  their own, in the app.

## Decision

**D1 — Equipment is a reusable profile, declared once via a guided wizard.** An
`EquipmentProfile` (on the existing `equipment_profiles` API) is created in a
**dedicated equipment space**, from a **preset** (`equipment_templates`),
answering **3 essential questions** (system type, fermenter + size, kettle size).
The create-DTO requires more than those 3 answers (`name`, `mash_tun_volume_l`,
`evaporation_rate_l_per_hour`, `efficiency_estimated_percent`, plus the losses):
these are **preset-seeded and hidden from the novice, but still sent** in the
snake_case `POST /equipment-profiles` body so validation passes (editable later).
Multi-fermenter is out of v1.

**D2 — Equipment readiness for a brew = a capacity fit-check + the cleaning
ritual, NOT a possession checklist.** Per brew the app does **not** re-tick owned
gear; it (a) runs a **graded fit-check** (fits / tight-krausen / too-small) **with
advice** (reduce volume, or dunk-sparge), and (b) gates on the **cleaning** phase.
Refines brew-prep UC6:
`readyToLaunch = ingredientChecklist.isComplete() && fitCheck.ok() && preCleaning.isComplete()`.

**D3 — The fermenter caps the batch and the recipe target-volume.** Consistent
with ADR-0020 D1, the profile's fermenter capacity (minus krausen headspace)
**caps the recipe target-volume slider**. v1 = a simple UI ceiling + a graded
fit-check comparing fixed numbers; the full ADR-0020 **VolumePlanner cascade is
deferred** (not required while the first recipe's volume is fixed).

**D4 — Cleaning is a guided, beginner phase: guide + hybrid checklist, before and
after the brew.** It distinguishes **cleaning** (residues; e.g. percarbonate)
from **sanitizing** (microbes, no-rinse; e.g. Star San), teaches the rule
"post-boil = sanitize", and adapts instructions (dose / contact time / rinse) to
the **products the brewer declares** (light v1 — *which* products, no stock
tracking; full inventory deferred, unified with ingredients later). Items =
curated beginner set + adjustable. Bottle sanitizing belongs to bottling (phase
B).

**D5 — Pedagogy is everywhere and adaptive.** Every screen teaches (inline
explanation + a foldable "why?" + glossary, plus links to the academy).
Intrusiveness adapts to a **brewer level declared at onboarding** (novice /
intermediate / confirmed), overridable anytime, with guides **always one tap
away** (guidance + escape hatch). Gamification / **badges** = a future competence
layer (deferred).

## Consequences

- The equipment feature becomes a **reusable profile + fit-check + cleaning**,
  decoupled from recipes — matching ADR-0020's "equipment as a first-class input".
- Cleaning guidance is a **differentiator** vs Brewfather / BeerSmith (which
  assume the user already knows).
- v1 stays small (no VolumePlanner, no stock tracking) yet brew-meaningful; the
  heavier layers (ADR-0020 cascade, unified inventory, badges, wait-tracking) are
  deferred behind clear seams.
- Cost: a new mobile equipment-capture surface + a cleaning content set; both
  serve the educational vocation.

### Rejected (for now)

- **Recipe-declared equipment** — would need a new recipe↔equipment relation +
  migration + per-recipe seeding; wrong model (equipment is the brewer's, not the
  recipe's).
- **Per-brew possession checklist** (re-tick owned gear) — redundant once a
  profile exists; the meaningful per-brew act is fit + cleaning.
- **Full quantitative inventory now** (products + ingredients) — deferred as a
  unified epic; v1 only declares *which* cleaning products.

## Relation to other ADRs

- **Builds on ADR-0020** — D3 defers its VolumePlanner cascade while honouring
  "the fermenter caps the batch".
- **Refines brew-prep** — supersedes the placeholder "equipment readiness = a
  checklist".
- **Respects ADR-0001 / KISS** — names seams (fit-check, cleaning, level,
  inventory) without speculative code.
- **Implements ADR-0002** — equipment profiles and any future volume calc live in
  the NestJS API; mobile talks via the http-client.
