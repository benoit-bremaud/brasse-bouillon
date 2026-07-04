# Spec — recipe brewing-difficulty scoring algorithm

> **Feature**: recipe difficulty badge (screen-review Tranche B)
> **Related ADRs**: ADR-0024 (the decision + decision matrix), ADR-0002 (backend-computed),
> ADR-0020 (backend owns the math), ADR-0019 (testing)
> **Consumed by**: `docs/architecture/diagrams/recipe-difficulty/*`
> **Revised** 2026-07-03 after a multi-lens review (brewing-domain, adversarial, consistency,
> pedagogy) — see the CHANGELOG note at the end.

This spec holds the **exact rules and thresholds** the backend `DifficultyService` implements.
Per ADR-0024, thresholds are **v1 defaults, calibratable** — the intent is documented so the
numbers can move without re-litigating the model. All inputs are **existing** recipe fields
(all-grain baseline — no extraction-method axis, ADR-0024 D2).

## 0. Output & inputs

```
DifficultyLevel = "facile" | "intermediaire" | "avance"   // tiers 0 / 1 / 2
effectiveDifficulty = difficultyOverride ?? difficultyComputed
```

Badge colour: a **brand traffic-light** in the app's warm charte (not literal RGB) — facile =
olive-green, intermediaire = amber, avance = terracotta. The mobile maps each level onto the
design-system semantic tokens (`success` / `warning` / `error`); label text is darkened off the
decorative amber so every pill clears WCAG AA (ADR-0024 D4, slice 3 decision 2026-07-04).

`yeastClass` is derived **once** from `RecipeYeastType` (`ale | lager | wild | brett`) and used by
several factors, so a factor never doubles as a category (kept separate from the integer tiers):

```
yeastClass = wild   if type ∈ {wild, brett}      // "wild culture" — v1 enum has no sour/mixed
           = lager  if type == lager
           = ale    otherwise (incl. no yeast row → assume ale)
```

**Null / absent inputs**: any factor whose signal is null/absent scores **tier 0** (insufficient
data ⇒ most permissive — never punish a beginner for a sparse recipe).

## 1. Per-factor tiering

Each factor returns a tier in `{0,1,2}` and, when it fires (tier ≥ 1), one **plain-French
explanation sentence** — the sentence is the _deepest_ pedagogy layer (nothing behind it), so it
must introduce **and** gloss each brewing term (`feedback_educational_vocation`).

### F1 — Fermentation / yeast _(tier from the signal; sentence from the type)_

| Condition                                                  | Tier  | Sentence                                                                                                                                                                                                                                     |
| ---------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yeastClass = wild` (Brett/wild)                           | **2** | « levure sauvage (Brett) ou fermentation acide : c'est long, imprévisible, et il faut une hygiène irréprochable »                                                                                                                            |
| `yeastClass = lager` **or** `temperature_max_c` < 14       | **1** | lager → « elle fermente au froid (≈10 °C) puis se garde plusieurs semaines : il te faut de quoi refroidir et de la patience » · cold-fermented ale → « elle fermente au froid : il te faut de quoi refroidir, la marge d'erreur est faible » |
| `temperature_max_c` > 26 (hot/active ferment, e.g. saison) | **1** | « elle fermente au chaud (>26 °C) et finit très sèche : la fermentation peut caler, il faut savoir la relancer »                                                                                                                             |
| otherwise (ale, normal temp) or null                       | 0     | —                                                                                                                                                                                                                                            |

The tier already encodes the escalation (wild = Avancé, lager/cold/hot = ≥ Intermédiaire) — there
is **no separate post-aggregation override** (that would double-count). The sentence keys on the
**type**, so a cold-fermented _ale_ is never told « c'est une lager ».

### F2 — Force / densité (gravity)

Use `og_target`; else derive from `abv_estimated`; both null ⇒ tier 0.

| Condition                        | Tier  | Sentence                                                                                                                              |
| -------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| OG ≤ 1.055 (≈ ABV < 5.5 %)       | 0     | —                                                                                                                                     |
| 1.055 < OG ≤ 1.075 (≈ 5.5–7.5 %) | **1** | « bière assez forte : il y a beaucoup de sucres à transformer, la fermentation demande plus d'attention »                             |
| OG > 1.075 (≈ ABV > 7.5 %)       | **2** | « grosse bière : il faut BEAUCOUP de levure au départ (un “pied de levure”), sinon la fermentation risque de s'arrêter avant la fin » |

### F3 — Tolérance aux fautes (« no place to hide ») _(lager-gated proxy)_

Fault-tolerance uses **`yeastClass = lager` as a coarse proxy** for a clean, exacting
fermentation where nothing masks a flaw. This deliberately **under-penalises clean pale ales**
(Kölsch, Cream Ale, Blonde, Ordinary Bitter — genuinely unforgiving too) to keep the flagship
« Blonde Facile (premier brassin) » at Facile. Known limitation, see §6.

- **pale** ⇔ `ebc_target` ≤ 10 (true straw-to-gold; null ⇒ not pale).

| Condition                                             | Tier  | Sentence                                                                                                                         |
| ----------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| `yeastClass = lager` **and** pale (`ebc_target` ≤ 10) | **2** | « une lager blonde et nette : ni houblon fort ni malt torréfié pour cacher un défaut — la moindre erreur se voit tout de suite » |
| otherwise                                             | 0     | —                                                                                                                                |

IBU is intentionally **not** used here: on a lager, hop bitterness does **not** mask diagnostic
faults (DMS, diacetyl…), so a hoppy pale lager (IPL) is **not** easier than a pilsner.

### F4 — Chimie de l'eau _(a real target, not a single sachet)_

Fires only on a **genuine water-treatment intent**, not the mere presence of a water row (every
recipe has one for volumes).

| Condition (from `recipe-water`)                                                                                | Tier  | Sentence                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `ph_target` set, **or** ≥ 2 ion targets set among {`calcium_ppm`,`magnesium_ppm`,`sulfate_ppm`,`chloride_ppm`} | **1** | « l'eau est ajustée avec des sels minéraux pour coller au style : il faut mesurer et calculer, une étape que les débutants sautent souvent » |
| otherwise (volumes only / a lone addition / null)                                                              | 0     | —                                                                                                                                            |

### F5 — Empâtage multi-palier _(DEFERRED in v1 — data gap)_

`recipe-step` carries only a phase `type` (mash/boil/…), **no per-rest temperature or duration**,
so a step / decoction mash cannot be detected from the current model. **F5 is fixed at tier 0 in
v1** and revisited when the mash model carries rests (§6). (Counting raw rows was rejected: a
mash-out or a sparge is a row but not a temperature rest.)

### F6 — Complexité de la recette _(distinct varieties, not timed additions)_

`complexity = distinctFermentables + distinctHopVarieties + additives`. Counts **varieties**, not
timed additions — a 4-addition single-hop pale ale is **one** hop variety, so it is not punished.

| Condition      | Tier  | Sentence                                                                                                   |
| -------------- | ----- | ---------------------------------------------------------------------------------------------------------- |
| complexity ≤ 7 | 0     | —                                                                                                          |
| complexity > 7 | **1** | « recette riche : beaucoup d'ingrédients différents à gérer et à minuter, plus d'occasions de se tromper » |

## 2. Aggregation _(max-dominates + bounded compounding)_

```
f1..f6 = per-factor integer tiers    // f5 == 0 in v1
base   = max(f1, f2, f3, f4, f5, f6)
moderateCount = count(fi == 1)
tier   = (moderateCount >= 3) ? min(base + 1, 2) : base   // several moderate stressors ⇒ a notch up
computed = ["facile","intermediaire","avance"][tier]
reasons  = [sentence(fi) for fi where tier(fi) >= 1], ordered by tier desc, ties by factor id F1→F6
if tier == 0: reasons = [ positiveFacileReason ]          // stored, not synthesised client-side
```

- **Max-dominates** (ADR-0024 D1): the hardest factor sets the level. The **compounding** rule
  fixes the "five tier-1 stressors read the same as one" mis-ordering (a decoction strong lager
  must beat a salted pale ale) while staying explainable — `reasons` still names each firing
  factor.
- **reasons = every firing factor** (tier ≥ 1), not only the max — so a lager that is also strong
  still shows the lager sentence (pedagogy, ADR-0024 D4). Rendered as
  « <niveau> car : <reasons joined by " · "> ».
- **Facile** stores a positive reason (`factor:"facile", tier:0`, sentence « Recette accessible :
  fermentation haute, densité modérée, pas de technique avancée — idéale pour un premier brassin. »)
  so the mobile stays a pure renderer (no client-side text logic). An **Intermédiaire** lead-in
  frames it as reachable: « Un cran au-dessus de débutant, accessible après un premier brassin. Ce
  qui la corse : <reasons> ».

## 3. Author override

- `difficultyOverride` (nullable enum). `effective = override ?? computed`.
- When set, the UI shows the computed value as a hint (« calculé : Intermédiaire »), so the
  author's choice is transparent.

## 4. Data model (additions only)

On `recipe`:

- `difficulty_computed` : enum(`facile`,`intermediaire`,`avance`), not null, recomputed on
  create/update.
- `difficulty_override` : enum, nullable.
- `difficulty_reasons` : json — `[{ factor, tier, sentence }]` (the computed breakdown, incl. the
  positive Facile reason), so the mobile renders tap-to-explain without recomputing (ADR-0024 D3).

No change to `recipe-yeast` / `recipe-hop` / `recipe-water` / `recipe-step` — all v1 signals
already exist. No `brewMethod` field (all-grain baseline). `RecipeYeastType` has no `sour`/`mixed`
today (kettle-sour is folded into `wild`); an enum extension is a documented follow-up (§6).

## 5. Worked examples (happy / sad / edge — seed the tests)

Assumed bills are stated so each number is auditable. F5 = 0 (deferred) throughout.

| Recipe                                                                                         | yeastClass | F1    | F2    | F3    | F4  | F6  | → computed        | Why                                                       |
| ---------------------------------------------------------------------------------------------- | ---------- | ----- | ----- | ----- | --- | --- | ----------------- | --------------------------------------------------------- |
| **Blonde SMaSH** — ale, OG 1.046, EBC 8, IBU 20, no water target, 2 ferm + 1 hop var.          | ale        | 0     | 0     | 0     | 0   | 0   | **Facile**        | nothing fires; matches « Blonde Facile »                  |
| **American Pale Ale** — ale, OG 1.052, EBC 12, IBU 38, 4 additions but 2 hop var., 3 ferm      | ale        | 0     | 0     | 0     | 0   | 0   | **Facile**        | complexity = 2+2+0 = 4 ≤ 7; ale so F3 off                 |
| **Bohemian Pilsner** — lager, OG 1.050, EBC 6, IBU 35                                          | lager      | 1     | 0     | **2** | 0   | 0   | **Avancé**        | pale lager (EBC 6 ≤ 10) → F3; IBU irrelevant              |
| **Italian Pilsner (IPL)** — lager, OG 1.052, EBC 7, IBU 45, dry-hopped                         | lager      | 1     | 0     | **2** | 0   | 0   | **Avancé**        | regression lock: a hoppy pale lager is still Avancé       |
| **Saison (Dupont clone)** — ale, OG 1.054, IBU 30, ferment 30 °C                               | ale        | **1** | 0     | 0     | 0   | 0   | **Intermédiaire** | hot/active ferment (F1 >26 °C) — no longer a false Facile |
| **Amber kit + 1 gypsum sachet** — ale, OG 1.048, no pH/ion target                              | ale        | 0     | 0     | 0     | 0   | 0   | **Facile**        | a lone sachet with no target ⇒ F4 = 0                     |
| **Russian Imperial Stout** — ale, OG 1.095, EBC 80, IBU 60, water targets, 6 ferm + 3 hop var. | ale        | 0     | **2** | 0     | 1   | 1   | **Avancé**        | high gravity (F2); reasons also name water + rich bill    |
| **Decoction Strong Bock** — lager, OG 1.070, EBC 30, water targets, 8 var. bill                | lager      | 1     | 1     | 0     | 1   | 1   | **Avancé**        | base = 1 but 4 factors at tier 1 (≥3) ⇒ compounding +1    |
| **Brett IPA** — wild culture                                                                   | wild       | **2** | 0     | 0     | 0   | 0   | **Avancé**        | wild-culture (F1)                                         |

The Decoction Bock vs a salted pale ale (one tier-1 factor → Intermédiaire) shows the compounding
rule working. The Bock's F3 = 0 because EBC 30 > 10 (not pale).

## 6. Known limitations & calibration knobs (v1)

- **Pale clean ALES** (Kölsch, Cream Ale, Blonde, Ordinary Bitter, American Wheat) are genuinely
  unforgiving but score Facile — a deliberate calibration to protect the beginner flagship. `lager`
  is a coarse proxy for "clean/exacting", accepted for v1.
- **F5 mash complexity is deferred** — `recipe-step` has no per-rest temperature; step/decoction
  mashes are invisible until the mash model carries rests.
- **Wild-culture gradient** — a kettle-sour (Lacto, then clean ferment) is closer to Intermédiaire
  than a Brett/mixed sour, but the v1 enum can't tell them apart, so all score Avancé
  (conservative). Split when `sour`/`mixed` enum values exist.
- **Malt-forward big beers** — some high-gravity malt-forward styles (Dubbel, Old Ale) are called
  "easy" by BYO because malt hides flaws; F2 still scores them up. Accepted (max-dominates + author
  override are the escape hatch).
- **Multi-yeast reduction** — the factors score a _single_ yeast, but a recipe may carry several
  (e.g. a primary + a Brett secondary). The backend reduces them to the worst-case culture —
  `wild/brett` > `lager` > `ale`, first row within the winning class — carrying that yeast's
  `temperature_max_c`. A recipe normally has one yeast; a divergent multi-_ale_ bill (one cold, one
  hot) resolves to the first ale, and the author override is the escape hatch. (Implemented in the
  application adapter, not the pure scorer.)
- **Calibration knobs**: OG bands (F2), EBC ≤ 10 pale cut-off (F3), complexity > 7 (F6),
  compounding threshold (≥ 3). All v1 defaults, expected to move against real recipes.

## CHANGELOG

- **2026-07-03 — post multi-lens review**: fixed the Bohemian Pilsner contradiction; removed IBU
  from F3 (was making hoppy lagers _easier_); F3 pale cut-off tightened to EBC ≤ 10; F6 counts hop
  **varieties** (threshold > 7) instead of timed additions (was over-scoring APAs); added a hot-
  ferment clause to F1 (saison); F4 now needs a real target, not a lone sachet; F5 (mash) deferred
  (no per-rest data); separated `yeastClass` from the integer tiers; removed the no-op override step
  and broadened `reasons` to every firing factor; added bounded compounding; rewrote every
  tap-to-explain string in glossed plain French; corrected the yeast enum to `{wild, brett}`.
