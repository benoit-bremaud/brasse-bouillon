# ADR-0024 — Recipe brewing-difficulty badge: rule-based, max-dominates, backend-computed

**Status** Proposed
**Date** 2026-07-03
**Owners** @benoit-bremaud

---

## Context

The screen-by-screen UX review (2026-07-03) activated a **per-recipe brewing-difficulty
badge**: a novice must see, at a glance, _how hard a recipe is to brew_ so they can pick one
at their level. This is a property of the **recipe** (how hard it is to brew), distinct from
the **user's declared level** (ADR-0021 D5). It surfaces on the recipe « Vue » tab / hero and on
the recipe cards (« Mes recettes » / catalog), with a tap-to-explain sentence (the app **teaches
why**), plus an optional reminder on the Brassage tab. See [[project_screen_by_screen_ux_review]]
and the difficulty-badge decisions in `bb-recipe-hallmark`.

**Locked before this ADR** (requirements workshop, 2026-07-03):

- **3 levels**: Facile / Intermédiaire / Avancé, colour-coded as a brand traffic-light
  (olive-green / amber / terracotta — see D4), each with a tap-to-explain sentence.
- **Determination = BOTH**: a **backend-computed** default from objective recipe signals,
  **overridable by the recipe author**.
- **Factors** the founder retained: base (step/ingredient count) + **techniques**,
  **force/densité** (gravity/ABV), **fermentation/levure** (yeast), **chimie de l'eau**, plus —
  added on the strength of the research below — a **fault-tolerance** axis.
- **Extraction method** (extract → all-grain), the dominant axis in the literature, is
  **out of scope**: the app is novice-guided and de-facto all-grain, so the axis would be
  constant (non-discriminating). Baseline = all-grain.

### Documented study (why we are not guessing)

A four-angle web study (homebrew apps, beginner-vs-advanced styles, brewing techniques,
scoring rubrics) was run to ground the model. Load-bearing sources: **John Palmer, _How to
Brew_** (progression ladder); the **American Homebrewers Association** (beginner recipe design,
SMaSH first-brew); **Brew Your Own — "10 easiest / 10 hardest styles"**; **Brulosophy**
(blind exBEERiments); **Grainfather** (lager control); and — for the aggregation principle —
**Kusu et al. 2017, _Calculating Cooking Recipe's Difficulty based on Cooking Activities_** (a
peer-reviewed method that scores a recipe from the difficulty of the _operations_ it requires).

Three findings shaped the decision:

1. **No homebrew design app exposes a difficulty score** (verified against Brewfather's docs;
   inferred for BeerSmith / Brewer's Friend / Grainfather). They compute only objective style
   metrics (OG, FG, ABV, IBU, SRM/EBC). So difficulty is **not a field to copy — it must be
   derived** from recipe signals. Explicit difficulty labels exist only on the **kit/retail**
   side (Homebrew Emporium literally has a 3-tier taxonomy), which are editorial, not a formula
   — useful only as corroboration of the 3-tier boundaries.
2. **No formal published point-rubric exists** for homebrew difficulty. Sources instead
   enumerate the _attributes_ that make a brew hard, all derivable from our structured recipe
   fields.
3. **The hardest single factor should set the tier** (max-dominates), not an average: a recipe
   trivial on seven axes but soured, or a light lager, is still hard — averaging would hide it.
   This is the transferable principle from the 2017 cooking-activities paper and the homebrew
   "no place to hide" idea.

Repo constraints: ADR-0001 (build for today), ADR-0002 (computation server-side, single source
of truth — like ADR-0020 volume planning), ADR-0013 (canonical beer/recipe model), ADR-0019
(testing).

---

## Decision

### D1 — Rule-based, per-factor tiering, **max-dominates + bounded compounding**

The difficulty is computed by a deterministic **rule engine** over the recipe's structured
fields. Each factor is scored to a tier (`facile=0` / `intermediaire=1` / `avance=2`); the recipe
tier is the **maximum** of the per-factor tiers, with a **bounded compounding** step (when ≥ 3
factors are at tier 1, bump one level, capped at Avancé — so several moderate stressors outrank a
single one). The wild-culture → Avancé and lager → ≥ Intermédiaire escalations are **encoded in
the yeast factor's tier** (not a separate override step, which would double-count). Every factor
that fires contributes a plain-French **explanation sentence**, and **all** firing factors (not
only the one at the max) go into the tap-to-explain, so pedagogy is not silently dropped.

Rejected alternatives — see the decision matrix below: a **weighted numeric score** (opaque,
hard to explain to a novice, arbitrary weights), a **style→tier lookup table** (the same
"stout"/"IPA" label spans easy and hard versions — the sources are explicit that a style label
is a poor proxy), and an **ML/learned model** (no labelled dataset, un-explainable, massive
over-engineering per ADR-0001).

### D2 — Factors (all derivable from existing fields; **all-grain baseline**)

| Factor                    | Signal (existing field)                                                       | Escalates because                                                                                                                                     |
| ------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fermentation / levure** | `recipe-yeast.type` (`{wild, brett}` / `lager` / `ale`) + `temperature_max_c` | wild culture = Avancé; lager **or** cold ferment (<14 °C) **or** hot/active ferment (>26 °C, e.g. saison) = ≥ Intermédiaire                           |
| **Force / densité**       | `og_target`, `abv_estimated`                                                  | high-gravity stresses the yeast, needs a starter                                                                                                      |
| **Tolérance aux fautes**  | `ebc_target` (pale ≤ 10) **gated on `lager`**                                 | a pale _lager_ = "no place to hide" → Avancé; a pale _ale_ stays Facile (keeps « Blonde Facile »). IBU is **not** used — hops don't mask lager faults |
| **Chimie de l'eau**       | `recipe-water` ion/pH **targets**                                             | a real target profile (pH or ≥2 ion targets), not a lone pre-measured sachet                                                                          |
| **Base (complexité)**     | count of fermentables + hop **varieties** + additives (> 7)                   | "kitchen-sink" bill multiplies error surface; counts varieties, not timed additions                                                                   |
| ~~Empâtage multi-palier~~ | `recipe-step`                                                                 | **deferred v1** — steps carry no per-rest temperature, so a step/decoction mash is not detectable yet                                                 |

Exact thresholds and the explanation strings live in the spec
(`docs/architecture/specs/recipe-difficulty-algorithm.md`) — they are **v1 defaults, meant to
be calibrated** as we see real recipes, not frozen here. The **extraction-method** axis is
deliberately omitted (all-grain baseline, D-context above).

### D3 — Backend-computed default + author override (ADR-0002)

- The API computes `difficulty_computed` (enum) **on recipe create/update**, storing it plus a
  **structured breakdown of the reasons** (which factors fired, at which tier, with the
  explanation string) so the mobile renders the tap-to-explain **without recomputing
  client-side**.
- The author may set `difficulty_override` (nullable enum). The **effective** difficulty is
  `difficulty_override ?? difficulty_computed`; when an override is set, the computed value is
  kept and shown as a hint (« calculé : Intermédiaire »).
- The mobile is a **pure consumer** — it never computes difficulty (consistent with ADR-0020:
  the backend owns the math).

### D4 — 3 levels, explainable, novice-first

`facile` / `intermediaire` / `avance`, colour-coded as a **brand traffic-light** — the app's warm
charte, not literal RGB. The mobile maps each level onto the existing design-system semantic tokens
(`facile` → olive-green `success`, `intermediaire` → amber `warning`, `avance` → terracotta `error`),
so the badge stays on-palette (decided 2026-07-04, slice 3): a novice reads green→amber→red at a
glance while every pill respects the earthy charte and WCAG AA legibility (label text darkened off
the decorative amber). An internal integer score MAY back
the tiering for calibration, but **only 3 levels are ever exposed** (no false precision). Every
badge is **tap-to-explain**, and each stored sentence is written in **glossed plain French** (the
sentence is the deepest layer — nothing behind it — so it must introduce _and_ explain each term),
e.g. « Avancé car : une lager blonde et nette — ni houblon fort ni malt torréfié pour cacher un
défaut, la moindre erreur se voit ». Pedagogy is the point (`feedback_educational_vocation`); the
spec holds the exact strings and they must stay at this clarity bar.

### D5 — Brassage tab (same review)

Separate but adjacent: the Brassage tab replaces its **generic** brewing-phase glossary
(identical for every recipe) with a **condensed overview of THIS recipe's real steps**; the
generic glossary **moves to the Academy** (ADR-0023) — it is education, not recipe-specific.
The difficulty badge appears here as a reminder. Captured here for traceability; detailed in
the use-case diagram.

**Emulator-grounded refinement (2026-07-03):** the tab already exposes three modes —
« Phases de brassage » (the generic glossary, currently default), « Étapes de la recette » (the
real steps), « Condensé ». So D5 is a re-default + relocation, not a rebuild: **promote « Étapes
de la recette » as the default**, and **move « Phases de brassage » into the Academy**.

---

## Decision matrix — how the difficulty is computed (weighted)

Criteria weighted for a **novice-first, explainable, no-dataset** app (5 = best).

| Approach                                | Explainable to novice (×3) | Faithful to sources (×2) | Effort / YAGNI (×2) | Calibratable (×1) | **Score** |
| --------------------------------------- | -------------------------- | ------------------------ | ------------------- | ----------------- | --------- |
| **Rule-based + max-dominates (chosen)** | 5                          | 5                        | 4                   | 4                 | **41**    |
| Weighted numeric score + thresholds     | 2                          | 4                        | 3                   | 5                 | 29        |
| Style → tier lookup table               | 3                          | 1                        | 5                   | 2                 | 23        |
| ML / learned model                      | 1                          | 3                        | 1                   | 3                 | 14        |

Rule-based + max-dominates wins on the two heaviest criteria (explainability, source fidelity):
every tier decision traces to a named factor with a novice sentence, and "hardest factor sets
the tier" is exactly what the literature prescribes. A weighted score calibrates more smoothly
but its weights are arbitrary and it cannot answer "why is this Avancé?" in one sentence.

---

## Consequences

**Positive** — deterministic and testable (H/S/E per ADR-0019); fully explainable (each tier
traces to a factor + sentence → feeds tap-to-explain and the app's teaching mission); no new
recipe-authoring burden (computed from fields already captured); no data-model change for the
omitted extraction axis; backend-owned (ADR-0002) so all clients agree.

**Negative / risks** — thresholds are **judgement calls**; v1 defaults will need calibration
against real recipes (mitigation: thresholds isolated in the spec + the author override as an
escape hatch). Documented v1 limitations (spec §6): (a) **fault-tolerance uses `lager` as a coarse
proxy** and deliberately under-penalises clean pale _ales_ (Kölsch, Cream Ale, Bitter…) to keep
the flagship « Blonde Facile » at Facile; (b) **F5 mash complexity is deferred** — `recipe-step`
carries no per-rest temperature, so step/decoction mashes are invisible until the mash model
gains rests; (c) the yeast enum has **no `sour`/`mixed`** value, so a kettle-sour is folded into
`wild` and scored Avancé (conservative); (d) malt-forward big beers still score up on gravity
(accepted). Omitting extraction method is safe **only while the app stays all-grain**; if extract
recipes are ever modelled, revisit with a `brewMethod` field (follow-up, not built). All mitigated
by max-dominates + author override + the calibration knobs.

---

## Alternatives considered

- **Weighted numeric score with thresholds** — smoother calibration, but opaque weights and no
  one-sentence "why"; loses the pedagogical payload. Rejected on explainability.
- **Style → tier lookup table** — simplest, but the sources are explicit that a style label is a
  poor proxy (same label spans easy and hard recipes). Rejected on fidelity.
- **ML / learned difficulty** — no labelled dataset, un-explainable, over-engineering
  (ADR-0001). Rejected.
- **Client-side computation** — would let clients disagree and duplicate the rules; violates the
  backend-owns-the-math principle (ADR-0020). Rejected.
