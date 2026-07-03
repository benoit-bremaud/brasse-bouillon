# Spec — recipe brewing-difficulty scoring algorithm

> **Feature**: recipe difficulty badge (screen-review Tranche B)
> **Related ADRs**: ADR-0024 (the decision + decision matrix), ADR-0002 (backend-computed),
> ADR-0020 (backend owns the math), ADR-0019 (testing)
> **Consumed by**: `docs/architecture/diagrams/recipe-difficulty/*`

This spec holds the **exact rules and thresholds** the backend `DifficultyService` implements.
Per ADR-0024, thresholds are **v1 defaults, calibratable** — the intent is documented so the
numbers can move without re-litigating the model.

## 0. Output

```
DifficultyLevel = "facile" | "intermediaire" | "avance"   // tiers 0 / 1 / 2
```

`effectiveDifficulty = difficultyOverride ?? difficultyComputed`. The badge colour: facile =
green, intermediaire = amber, avance = red.

## 1. Per-factor tiering

Each factor returns a tier in `{0,1,2}` and, when it fires (tier ≥ 1), one **French
explanation sentence**. All inputs are existing recipe fields (all-grain baseline — no
extraction-method axis, ADR-0024 D2).

### F1 — Fermentation / yeast  *(also a hard override)*

| Condition (from `recipe-yeast`) | Tier | Sentence |
|---|---|---|
| type ∈ {`wild`, `brett`, `sour`, `mixed`} | **2** | « fermentation sauvage / acide — longue, imprévisible, contrôle microbiologique » |
| type = `lager`, **or** `temperature_max_c` < 14 | **1** (floor) | « c'est une lager — fermentation à froid contrôlée + garde longue, peu de marge d'erreur » |
| otherwise (ale) | 0 | — |

Overrides: a wild/sour yeast **forces Avancé**; a lager **forces at least Intermédiaire**
(applied after aggregation).

### F2 — Force / densité (gravity)

Use `og_target` if present, else derive from `abv_estimated`.

| Condition | Tier | Sentence |
|---|---|---|
| OG ≤ 1.055 (≈ ABV < 5.5 %) | 0 | — |
| 1.055 < OG ≤ 1.075 (≈ 5.5–7.5 %) | **1** | « densité assez élevée — la levure travaille plus, fermentation à surveiller » |
| OG > 1.075 (≈ ABV > 7.5 %) | **2** | « grosse bière (densité élevée) — pied de levure important, risque de fermentation bloquée » |

### F3 — Tolérance aux fautes (« no place to hide »)  *(EBC + IBU, gated on yeast)*

The homebrew fault-tolerance axis bites hardest on **lagers**: a pale, clean lager exposes
every flaw. A pale **ale** stays forgiving (ale-yeast tolerance) and is **not penalised** — this
keeps the app's flagship « Blonde Facile (premier brassin) » at Facile (calibration decided
2026-07-03). Roast / hops / haze always mask beginner mistakes.

- **fault-exposing** ⇔ `ebc_target` ≤ 15 **and** `ibu_target` ≤ 25.

| Condition | Tier | Sentence |
|---|---|---|
| fault-exposing **and** yeast is lager (F1 = lager) | **2** | « lager pâle et nette — le style le moins tolérant, aucune faute pardonnée » |
| otherwise (a pale **ale**, or any roasty/hoppy beer → flaws masked) | 0 | — |

### F4 — Chimie de l'eau

| Condition | Tier | Sentence |
|---|---|---|
| recipe has salt additions / a target water profile / water additives (`recipe-water` non-empty) | **1** | « ajustement de l'eau (sels) requis — mesure et calcul en plus » |
| otherwise | 0 | — |

### F5 — Techniques (mash)

| Condition (from `recipe-step`) | Tier | Sentence |
|---|---|---|
| ≥ 2 mash-type steps (multi-step / decoction mash) | **1** | « empâtage multi-palier — paliers de température à tenir » |
| single-infusion (1 mash step) or none | 0 | — |

### F6 — Base / recipe complexity  *(counts)*

`complexity = distinctFermentables + distinctHopAdditions + additives + (dryHopPresent ? 1 : 0)`.

| Condition | Tier | Sentence |
|---|---|---|
| complexity ≤ 5 (SMaSH-ish) | 0 | — |
| complexity > 5 | **1** | « recette riche (nombreux ingrédients et ajouts) — plus d'étapes, plus de timing » |

(Dry-hop presence counts here rather than as its own tier — a single dry-hopped pale ale stays
beginner-friendly; a "kitchen-sink" bill escalates.)

## 2. Aggregation

```
tier   = max(F1, F2, F3, F4, F5, F6)
if F1 == wild/sour:      tier = 2          // hard override
else if F1 == lager:     tier = max(tier, 1)
computed = ["facile","intermediaire","avance"][tier]
reasons  = sentences of every factor whose tier == tier   // the ones that SET the level
```

Max-dominates (ADR-0024 D1): the hardest factor sets the level. `reasons` drives the
tap-to-explain (« Avancé car : <reasons joined by " + "> »). For **Facile**, a positive line is
shown instead: « Recette accessible : fermentation haute, densité modérée, peu d'étapes — idéale
pour débuter. »

## 3. Author override

- `difficultyOverride` (nullable enum). `effective = override ?? computed`.
- When an override is set, the UI shows the computed value as a hint (« calculé :
  Intermédiaire »), so the author's choice is transparent, not silent.

## 4. Data model (additions only)

On `recipe`:

- `difficulty_computed` : enum(`facile`,`intermediaire`,`avance`), not null, recomputed on
  create/update.
- `difficulty_override` : enum, nullable.
- `difficulty_reasons`  : json — the structured breakdown `[{ factor, tier, sentence }]` so the
  mobile renders tap-to-explain without recomputing (ADR-0024 D3). Stores the *computed*
  breakdown; the effective level is derived at read time.

No change to `recipe-yeast` / `recipe-hop` / `recipe-water` / `recipe-step` — all signals
already exist. No `brewMethod` field (all-grain baseline, ADR-0024).

## 5. Worked examples (happy / sad / edge — seed the tests)

| Recipe | F1 | F2 | F3 | F4 | F5 | F6 | → computed | Why |
|---|---|---|---|---|---|---|---|---|
| **Blonde SMaSH**, ale, OG 1.046, EBC 8, IBU 20, tap water, single mash, 2 ingr. | 0 | 0 | 0 | 0 | 0 | 0 | **Facile** | pale **ale** → forgiving; F3 is gated on lager, so it does not fire. Matches « Blonde Facile ». |
| **American Pale Ale**, ale, OG 1.052, EBC 12, IBU 38, single mash | 0 | 0 | 0 | 0 | 0 | 0 | **Facile** | hoppy (IBU>25) masks flaws |
| **Bohemian Pilsner**, lager, OG 1.050, EBC 6, IBU 35 | 1 | 0 | **2** | 0 | 0 | 0 | **Avancé** | pale lager, clean → "no place to hide" (F3 lager combo) |
| **Russian Imperial Stout**, ale, OG 1.095, EBC 80, IBU 60, salts, multi-mash | 0 | **2** | 0 | 1 | 1 | 1 | **Avancé** | high gravity (F2) |
| **Berliner Weisse**, sour culture, OG 1.032 | **2**(override) | 0 | — | 0 | 0 | 0 | **Avancé** | wild/sour override |

The **Blonde SMaSH** stays **Facile** by design (calibration decided 2026-07-03): F3 is gated on
lager, so a pale ale is not penalised for being pale — ale-yeast forgiveness dominates, matching
the flagship « Blonde Facile (premier brassin) » positioning. The fault-tolerance axis still
does its job on the **pale lager** case (Bohemian Pilsner → Avancé, F3 lager combo).

## 6. Notes / open calibration

- Thresholds (OG bands, EBC/IBU cut-offs, complexity count) are **v1**; expect to tune against
  real recipes. The internal max-of-tiers keeps tuning local to each factor.
- Known source disagreements to respect (ADR-0024): malt-forward big beers can be "easy" despite
  high gravity; Brulosophy softens the lager-flavour penalty (the durable lager cost is
  equipment + patience, which is why F1-lager is a *floor of Intermédiaire*, not an automatic
  Avancé unless also fault-exposing).
