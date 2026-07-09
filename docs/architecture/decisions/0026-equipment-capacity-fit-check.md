# ADR-0026 — Equipment capacity fit-check: advisory pre-batch readiness, backend-computed

**Status** Accepted
**Date** 2026-07-07 (accepted 2026-07-09, on the equipment fit-check leg landing: backend #1362 + mobile #1364)
**Owners** @benoit-bremaud

---

## Context

The pre-batch **readiness journey** (brew-prep conception, PR #1248) already ships an
**ingredient checklist** and a **launch gate** (`BrewReadiness.readyToLaunch`), reached from a
recipe's "Préparer mon brassin" CTA. The conception (UC5, `01-use-case`; `04-class`) also modelled
an **equipment checklist** — a `ReadinessChecklist` of `Kind = EQUIPMENT` with have/required
`ChecklistItem`s — as the second leg of the gate (`ingredient.isComplete() && equipment.isComplete()`).

Reconciling that conception against the **shipped code** (audit 2026-07-07) surfaces a mismatch that
this ADR resolves:

- **The equipment model is capacity-based, not an item list.** The stored `equipment_profiles` ORM
  entity carries three **volumes** (`mash_tun_volume_l`, `boil_kettle_volume_l`,
  `fermenter_volume_l`) plus three **loss** fields (`trub_loss_l`, `dead_space_loss_l`,
  `transfer_loss_l`). There is **no discrete-equipment inventory** and no recipe field expressing a
  "required equipment items" list. A have/required item checklist (UC5 as drawn) therefore has **no
  data source**.
- **ADR-0020's volume cascade is not built.** `VolumePlanner`, the `VolumePlan` value object, the
  boil-off / grain-absorption constants, and the **method** decision (full-volume BIAB vs
  dunk-sparge, ADR-0020 D2) are **conception-only**. No service computes a pre-boil volume today.
- **The equipment profile is declared but consumed nowhere.** It is stored and editable, but no
  batch/recipe logic reads it — so a novice's declared capacities currently mean nothing.
- **The recipe carries its own target volume** in the **nullable** column `batch_size_l`
  (`recipe.orm.entity.ts`; the mobile layer surfaces it as `RecipeStats.volumeLiters`, aliased in
  `recipes.api.ts`). The mash/sparge water volumes (`mash_volume_l` / `sparge_volume_l`) do **not**
  live on the recipe — they are on the **optional** `recipe_water` 1:1 entity (written only via
  `upsertWater`; `getWater` returns `null` when absent), and the **seeded/demo public recipes carry
  no `recipe_water` row** (all `batch_size_l: 20`). Both inputs are therefore routinely **missing**.
- **No rescale/scale path exists** anywhere in the code.

The concrete novice failure this leaves invisible: importing a **20 L** recipe while brewing in a
**5 L** demijohn. Nothing warns the novice; the app lets them walk into a batch their gear cannot
hold — a silent dead-end that contradicts the "never dead-end mid-brew" north-star.

### Documented study (why we are not guessing)

- **Fermenter sizing is a fit question, headspace ≠ losses.** The general krausen-safe norm sizes the
  fermenter **~20–25 % above** the batch volume (blow-off room), but the project's **own canonical
  first brew deliberately runs tight** — `Blonde Facile (premier brassin)` seeds `batch_size_l: 4.3`
  into a **5 L demijohn** (`public-recipes.seed.ts`), i.e. ~14 % headspace. So **v1 defaults
  `HEADSPACE_RATIO = 0.10`** (usable = `5 × 0.90 = 4.5 L ≥ 4.3` → the flagship reads `FITS` with
  margin, never `TOO_LARGE`); the 20–25 % norm is the **deferred per-style refinement**. That
  **headspace** decides whether the wort *physically fits*; the stored
  `trub_/dead_space_/transfer_loss_l` fields reduce *final yield*, not fit. The two must not be
  conflated. No `headspace` value exists on the profile today, so v1 introduces it as a **constant**.
- **The kettle "physically impossible" test is method-dependent.** Whether a kettle can hold the
  pre-boil volume depends on the method (full-volume BIAB holds all the water at mash-in; a
  dunk-sparge / 3-vessel build raises volume gradually), and that method logic (ADR-0020 D2) is
  **not built**. Using `mash_volume_l + sparge_volume_l` as the pre-boil volume is an
  **approximation** (ignores grain absorption ~1 L/kg and the method split). A **hard block** on an
  approximate number would risk **false-blocking** a novice whose real method would pass.
- **The volume math belongs in the backend** (ADR-0020 D3): a single source of truth for the
  headspace/loss constants, testable, and the natural home of the future `VolumePlanner`.

## Decision

Ship the equipment leg of the readiness journey as an **advisory capacity fit-check**, computed in
the **backend**, reusing the **real** equipment fields — **not** the conceived item checklist.

- **Fermenter (primary check).** `fermenterUsableL = fermenter_volume_l × (1 − HEADSPACE_RATIO)`
  compared to the recipe's **`batch_size_l`**. Verdicts: **`FITS`** (`batch_size_l ≤ fermenterUsableL`)
  or **`TOO_LARGE`** (`batch_size_l > fermenterUsableL`, **strict `>`** so a boundary-equal recipe
  reads `FITS`). `TOO_LARGE` is **advisory**: it surfaces the **scale ratio**
  `scaleRatio = batch_size_l / fermenterUsableL` ("cette recette vise 20 L, ton fermenteur ne tient
  que ~4,5 L utiles → réduis d'un facteur ~4–5") as a manual escape hatch — computed **only when
  `fermenterUsableL > 0`** (never a raw division). **No auto-rescale in
  v1** (guided rescale is the next slice; the recipe-scaling code does not exist yet). The fermenter
  verdict is **`NOT_EVALUATED`** (**never `FITS`**, never a division) whenever **either input is
  missing/degenerate**: `batch_size_l` **null, non-finite, or ≤ 0** (a common case — user recipes
  omit it → "cette recette n'indique pas de volume cible"), **or** `fermenter_volume_l` **null,
  non-finite, or ≤ 0** (`@Min(0)` lets a `0` through → "ton profil n'indique pas de volume de
  fermenteur exploitable"). This mirrors the existing guard in `batch.service.ts`
  (`volumeL == null || !Number.isFinite(volumeL) || volumeL <= 0`).
- **Kettle (secondary check).** `boil_kettle_volume_l` compared to an **approximate pre-boil volume**
  (`mash_volume_l + sparge_volume_l`, both on the optional `recipe_water`). Verdicts: **`OK`** or
  **`WARNING`**. The kettle verdict is a **non-blocking warning in v1** — a `HARD_STOP` verdict is
  kept in the model but stays **inactive** until the method decision (ADR-0020 D2) makes "physically
  impossible" reliable. The kettle verdict is **`NOT_EVALUATED`** (never a computed `NaN`) when
  **no `recipe_water` row exists** (the demo-recipe case → pre-boil undefined) **or**
  `boil_kettle_volume_l` is **null, non-finite, or ≤ 0**; only the fermenter check then runs.
- **No profile → `NOT_EVALUATED`.** When the user has declared no equipment, the check renders a
  **just-in-time call-to-action** ("déclare ton matériel pour vérifier l'adéquation", linking to the
  Equipment screen) and does **not** block the launch. There is **no persisted default marker** on
  `equipment_profiles` today, so v1 uses the user's **single profile** when there is one, and — for a
  user with several — the **most-recently-created** one (the existing `EquipmentProfileService.listMine`
  `created_at DESC` order), documented as the de-facto default. An explicit `profileId` selection / a
  real default marker is a **deferred** slice; until then the endpoint accepts an optional
  `profileId` and falls back to that most-recent profile.
- **One response shape for `NOT_EVALUATED`, tagged with a `reason`.** Every non-evaluable case
  returns the **same `CapacityFit`** object with the affected per-verdict enum(s) set to
  `NOT_EVALUATED`, the numeric fields absent (optional — `number?` on the class), and a **per-verdict
  `reason`** so the mobile picks the right message without inferring intent from absent numbers (a
  no-profile payload and a valid-profile-but-volume-less payload are otherwise byte-identical):
  `NO_PROFILE` → the whole-screen JIT CTA "déclare ton matériel"; `NO_RECIPE_VOLUME` → "cette recette
  n'indique pas de volume cible"; `NO_FERMENTER_VOLUME` → "ton profil n'indique pas de volume de
  fermenteur exploitable"; `NO_RECIPE_WATER` / `NO_KETTLE_VOLUME` → the kettle leg is simply omitted.
  It stays **one payload TYPE**, just self-describing — for the `GET /recipes/:id/equipment-fit`
  response.
- **The launch gate is unchanged in v1.** `readyToLaunch = ingredientChecklist.isComplete()`. The
  capacity fit-check is **advisory only** — it never disables "Démarrer" in v1. Placement on the
  screen puts the **capacity block first** (most fundamental), then the ingredient checklist.
- **`HEADSPACE_RATIO` is a calibratable constant** (defaulted **0.10**, calibrated so the shipped
  guided first brew — `batch_size_l 4.3` in a 5 L demijohn — reads `FITS`), in the spirit of ADR-0020
  D4 — a backend constant in v1, promotable to a per-profile `fermenterHeadspaceRatio` field later.

This is the **first consumer** of the equipment profile and a **partial, honest realization** of
ADR-0020: it reuses ADR-0020's model and constants for the two comparisons it can make reliably
today, and explicitly defers the full cascade, the method decision, the active hard-stop, and the
guided rescale.

### Readiness power of the capacity check (weighted decision matrix)

Weights reflect a novice-facing, KISS-first goal that must not create a silent dead-end **nor**
false-block a viable brew.

| Criterion (weight) | A. Strict gate | **B. Advisory + physical hard-stop** | C. Pure informative |
| --- | --- | --- | --- |
| Prevents the novice dead-end (20 L on 5 L) (30%) | 5 | **4** | 3 |
| Avoids false-blocking on approximate / method-less math (25%) | 1 | **4** | 5 |
| Novice safety — stops the physically impossible (20%) | 5 | **4** | 2 |
| KISS / build cost v1 (15%) | 3 | **4** | 5 |
| Preserves novice autonomy / escape hatch (10%) | 1 | **4** | 5 |
| **Weighted score** | **3.30** | **4.00** | **3.80** |

**Chosen: B (advisory + physical hard-stop) — as the durable MODEL, with C's behaviour in v1.**
The scores above rate the **target model** (B warns without dead-ending and blocks only the truly
impossible). **Honest caveat:** the "stops the physically impossible" row (20 %) credits B a `4`,
and that credit is what carries B's 4.00 over C's 3.80 — but v1 ships **no active hard-stop** (the
kettle is a non-blocking warning; `HARD_STOP` is modelled-but-inactive until ADR-0020 D2). On the
capability **actually shipped in v1**, B's safety row collapses to C's (`2`), making B ≈ C
(≈ 3.60 vs 3.80). **B is therefore chosen for its durable model/roadmap value, not a v1 safety
advantage** — v1 deliberately behaves like C (advisory-only), and the hard-stop activates when the
method logic lands. **A** (strict gate) is rejected: blocking on an approximate volume punishes the
novice for the app's missing method math.

### Where the verdict is computed (weighted decision matrix)

| Criterion (weight) | A. Mobile arithmetic | **B. Backend service** | C. Hybrid |
| --- | --- | --- | --- |
| Single source of truth for constants / losses (30%) | 2 | **5** | 4 |
| Consistency with ADR-0020 D3 (volume-math = backend) (25%) | 1 | **5** | 3 |
| Testability (20%) | 3 | **5** | 3 |
| Build cost v1 (15%) | 5 | **3** | 3 |
| Offline / latency (10%) | 5 | **2** | 3 |
| **Weighted score** | **2.70** | **4.40** | **3.30** |

**Chosen: B (backend service).** The headspace/loss constants live once, the verdict is testable,
and it sits where the future `VolumePlanner` will live. The user is already online for the rest of
the prep flow, so the latency cost is marginal.

### "Too large" behaviour (weighted decision matrix)

| Criterion (weight) | A. Auto-rescale (ADR-0020 D1) | **B. Advisory + explicit ratio** | C. Bare warning |
| --- | --- | --- | --- |
| Avoids a soft dead-end / gives a path (35%) | 5 | **4** | 2 |
| Build cost v1 (30%) | 1 | **5** | 5 |
| Does not surprise the novice (numbers changing) (20%) | 2 | **5** | 5 |
| Reuses existing code (15%) | 1 | **5** | 5 |
| **Weighted score** | **2.60** | **4.65** | **3.95** |

**Chosen: B (advisory + explicit ratio).** Giving the concrete scale ratio is a real manual escape
without building the (non-existent) rescale engine or silently changing the novice's numbers.
**A** (auto-rescale) is the natural **next slice** once the cascade + a guided-rescale UX exist.

## Consequences

- The equipment profile becomes **consumed for the first time**, giving the declared capacities
  meaning inside the readiness journey.
- A new **backend fit-check** (a focused service + `GET /recipes/:id/equipment-fit?profileId=`, or
  the equivalent folded onto the pre-batch draft) is introduced; the mobile only renders verdicts.
- **Introduced now, deferred deliberately:** the active kettle `HARD_STOP` (needs ADR-0020 D2
  method logic), the **guided rescale** (needs a scaling engine), the full **`VolumePlanner`
  cascade**, multi-profile selection, and a per-profile `fermenterHeadspaceRatio`.
- **Underfill is out of scope for v1 — a known, accepted limitation.** v1 only guards the overflow
  direction (recipe > fermenter). The opposite failure — a tiny recipe in a large fermenter (recipe
  ≪ `fermenterUsableL` → excessive headspace → oxidation risk) — is a real novice hazard, but the v1
  `FermenterVerdict` enum has **no underfill member**, so **in v1 it is reported as `FITS`** (the
  accepted limitation). A dedicated `UNDERFILL` `FermenterVerdict` lands in a later slice so it is no
  longer conflated with a good fit — it is flagged here so the gap is explicit, not silent.
- The `04-class` `ReadinessChecklist` of `Kind = EQUIPMENT` is **replaced** by a `CapacityFit`
  value object; the launch gate stays ingredient-only in v1 (`05-state-readiness` updated).
- `HEADSPACE_RATIO = 0.10` is a documented, calibratable constant (calibrated so the shipped guided
  first brew reads `FITS`), distinct from the stored losses.

## Relation to other ADRs

- **ADR-0020 (equipment-driven volume planning)** — this ADR is its **first partial realization**:
  it reuses ADR-0020's model (fermenter caps the batch, D1) and backend-math principle (D3) for the
  two reliable comparisons, and defers the cascade + method (D2) + calibratable constants (D4).
- **ADR-0002 (centralized NestJS backend)** — the verdict is computed backend; the mobile egress
  stays through `core/http/http-client` only.
- **brew-prep conception** (`docs/architecture/diagrams/brew-prep/`) — `01`, `03`, `04`, `05` are
  updated and `02b-sequence-capacity-fit` is added to realize this decision.
