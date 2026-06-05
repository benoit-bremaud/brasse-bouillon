# ADR-0016 — Recipe-equivalence matching v2: weighted criteria, completeness ratio, and BJCP style families

**Status**  Proposed
**Date**    2026-06-05
**Owners**  @benoit-bremaud
**Relates** #699 (matcher), #1190 (match by characteristics), #1193 (official style-gate), #1198 (style family), epic #1175. Conception: [`../diagrams/recipes/06-sequence-recipe-matching.md`](../diagrams/recipes/06-sequence-recipe-matching.md).

> Supersedes the **scoring** behaviour of the matcher described implicitly in #699/#1190/#1193 (the API contract — `POST /recipes/match` by characteristics — is unchanged). This ADR fixes *how* the similarity is computed.

## Context

The scan fiche ranks community recipes against the scanned beer ("recettes équivalentes"). After the cutover (#1189) + matching-by-characteristics (#1190) + the official style-gate (#1193), a real-device test of **Leffe Blonde** still returned **Saison** and **NEIPA** as the top "equivalents", with the blonde/light recipes (`Bière Blonde à l'Ancienne`, `International Pale Lager`, `Kölsch`) ranked below.

Root causes:

1. **Style is matched by name, not by family.** `scoreStyle` does exact (100) or substring-containment (70), else 0. `"Blonde Ale"` does not substring-match `"Kölsch"` / `"International Pale Lager"`, so **every** recipe scored style = 0; with no style signal the ranking collapsed onto ABV proximity + community rating → a Saison won.
2. **No explicit confidence.** When the scanned beer is sparse (OpenFoodFacts rarely carries IBU/SRM), the match rested on 1–2 criteria but the UI presented it as if it were a full comparison.

We grounded the redesign in brewing science rather than opinion (research workflow, 2026-06-05; sources at the end): BJCP 2021, sensory/perceptual studies, beer recommender systems, and missing-data best practice (Gower distance / case-based reasoning).

## Decision

A weighted, **completeness-aware** similarity, with **two strictly-separate signals**.

### D1 — Criteria and weights (full-data weights)

| Criterion | Weight | Grounding |
|---|---:|---|
| **Style (by BJCP family)** | **40** | Dominant identity signal. BJCP: the written sensory profile *"defines the style"*; the numbers *"determine judging order, not whether an example should be disqualified."* Unanimous across all research angles. |
| **Colour (SRM/EBC)** | **22** | Strongest cheap numeric discriminator; the first pre-taste cue (crossmodal studies). BJCP promotes colour to a first-class style tag (pale/amber/dark). |
| **Bitterness (IBU)** | **18** | Strong post-taste driver (liking r≈−0.91) but BJCP frames it as a *balance* attribute, and ranges overlap inside a family → mid weight. |
| **ABV** | **14** | Real but secondary; BJCP elevates *strength* to a tag, but its apparent weight is partly confounded with body/colour. |
| **Ingredients (when known)** | **6** | Confirmatory only, never a gate. BJCP: identity is the *sensory result* of ingredients+process, not the ingredient list; data is mostly absent on commercial beers and hop/yeast names are fungible. |

Weights are the **full-data** weights. They are **not** re-tuned per beer — D3's renormalisation adapts them to whatever is actually known.

### D2 — Style similarity is **graded by BJCP family**, not name-equality

`styleSimilarity(beerStyle, recipeStyle) ∈ {1.0, 0.7, 0.4, 0}`:

- **1.0** — same canonical style.
- **0.7** — same **BJCP family** (Appendix A). e.g. *Blonde Ale ≈ Kölsch* (both **Pale Ale** family); *Munich Helles ≈ International Pale Lager* (both **Pale Lager**).
- **0.4** — different family but same **colour tier + strength tier** (e.g. a pale-standard ale vs a pale-standard lager).
- **0** — otherwise.

Both the beer's style and the (free-text) recipe style are normalised to a BJCP family + colour/strength tier (see Appendix). This replaces `scoreStyle`'s exact/substring logic; the old behaviour is the degenerate 1.0/0 case.

### D3 — Match strength = renormalised (Gower-style) weighted similarity

```
matchStrength = Σ over present-and-comparable criteria [ weight × localSimilarity ]
                ────────────────────────────────────────────────────────────────
                Σ over present-and-comparable criteria [ weight ]
```

A criterion absent on **either** side **drops out of both numerator and denominator** — it is neither scored 0 (a false penalty) nor imputed. This is the textbook Gower-distance / case-based-reasoning "disregard-and-renormalise" rule.

### D4 — Completeness ratio = the confidence signal (the user's "Punk IPA ≈ 100%")

```
completeness = Σ over comparable criteria [ weight ] / Σ over all criteria [ weight ]   ∈ [0..1]
```

This is the **denominator of D3 over the full weight (100)**. It measures how much of the full picture the comparison actually used. A match resting on `style + ABV` (≈ 0.54) is honestly weaker-evidence than one resting on all five (1.0). It is surfaced to the UI as the match's reliability — **distinct from D3's match strength**. (Completeness ≠ importance: a fully-documented official recipe is highly *complete* yet ingredients still weigh little for *similarity*.)

### D5 — Acceptance threshold → "no reliable equivalent"

A candidate is shown only when **both** `matchStrength ≥ S_min` **and** `completeness ≥ C_min` (initial defaults `S_min`, `C_min` as env-tunable constants; calibrate on real OpenFoodFacts coverage). Below the threshold the section shows an honest empty state — *"Pas encore de recette équivalente fiable pour cette bière"* + an invite to contribute — instead of a misleading closest match. This replaces "always show the closest with a low-confidence banner".

### D6 — Official-recipe promotion stays style-gated (from #1193)

Unchanged: the official shortcut applies only to a **style-compatible** official (style similarity > 0). It does not bypass D5.

## Out of scope (deferred, captured)

- **Imputation** of a colour/IBU band from the style family — **no** for the MVP (keeps completeness honest; consistent with "we won't mass-spec every beer"). Possible later as a *confidence-gated* enhancement (imputed values count at a reduced rate).
- **Ingredients by role** (yeast > hop/malt, compared by character not literal string) — MVP uses simple overlap; refine later.
- **A flavour/aroma (textual descriptors) axis** — two research angles call it the true second discriminant; **#1198 / backlog** (Beer2Vec-style). Out of the five-criterion MVP.
- **Colour 22 vs IBU 18** is the point where sources diverge most (BJCP elevates colour; consumer studies rate IBU higher). Kept colour ≥ IBU; revisit with real data.

## Consequences

- The 15 seeded encyclopedia `Style` rows (and free-text recipe styles) need a **BJCP family + colour-tier + strength-tier** mapping (Appendix). The encyclopedia `Style` model has `category` (fermentation) + `srm_min/max` + `abv_min/max`; add a `family` mapping (column or lookup) — to be modelled in the encyclopedia class diagram before coding.
- `RecipeMatchingService` (NestJS, where matching lives today, ADR-0005) changes its `computeSimilarity` to the D2/D3 form and returns `completeness` alongside `low_confidence`; `06-sequence-recipe-matching` is updated.
- The matcher becomes **data-coverage-aware**: when OFF gives only style + ABV, the ranking honestly uses those two and flags the completeness, instead of inventing precision.

## Appendix — BJCP family / tier map for the seeded styles

Source: BJCP 2021 Appendix A (Styles Sorted Using Style Family) + per-style colour/strength tags.

| Seeded style | BJCP family | Colour tier | Strength tier |
|---|---|---|---|
| Blonde Ale (`blonde_ale`) | Pale Ale | pale | standard |
| Saison (`saison`) | Pale Ale | pale | standard |
| India Pale Ale (`ipa`) | IPA | pale | standard |
| Pilsner (`pilsner`) | Pale Lager | pale | standard |
| Lager (`lager`) | Pale Lager | pale | standard |
| Hefeweizen (`hefeweizen`) | Wheat Beer | pale | standard |
| Wheat Beer (`wheat`) | Wheat Beer | pale | standard |
| Amber Ale (`amber_ale`) | Amber Ale | amber | standard |
| Belgian Dubbel (`dubbel`) | Belgian Ale (amber) | amber | standard |
| Belgian Tripel (`tripel`) | Strong Belgian Ale | pale | strong |
| Belgian Quadrupel (`quadrupel`) | Strong Belgian Ale | dark | strong |
| Barleywine (`barleywine`) | Strong Ale | amber/dark | strong |
| Porter (`porter`) | Porter | dark | standard |
| Stout (`stout`) | Stout | dark | standard |
| Sour Ale (`sour`) | Sour Ale | (varies) | standard |

Free-text recipe styles (e.g. `International Pale Lager`, `Kölsch`, `NEIPA`, `Bière Blonde à l'Ancienne`) are normalised into the same families via an alias table (BJCP names + common FR/EN synonyms + accent folding).

## Sources

- **BJCP 2021 — Introduction**: the sensory profile defines the style; vital stats are guidelines not absolutes — bjcp.org/beer-styles/introduction-to-the-2021-guidelines
- **BJCP FAQ — "Where did those numbers come from"**: OG/FG/IBU/SRM/ABV are guideline ranges, breakpoints sometimes artificial — bjcp.org/faq
- **BJCP 2021 Appendix A — Styles Sorted Using Style Family**: the canonical relatedness map (Pale Lager vs Pale Ale families) — styles.bjcp.org/bjcp-2021-beer/a/3-styles-sorted-using-style-family
- **BJCP per-style tags** (colour + strength as first-class tags, e.g. Blonde Ale 18A) — bjcp.org/style/2021/18/18A/blonde-ale
- **Crossmodal colour study** (colour as dominant pre-taste cue) — pmc.ncbi.nlm.nih.gov/articles/PMC5742240
- **Consumer study on commercial beers** (IBU r≈−0.91, colour r≈−0.95 with liking; alcohol non-significant) — pmc.ncbi.nlm.nih.gov/articles/PMC11167190
- **StatMatch `gower.dist`** — the missing-feature renormalisation formula (the completeness-ratio denominator) — rdrr.io/cran/StatMatch/man/gower.dist.html
- **Case-based reasoning local-global principle** — disregard-and-renormalise unknown descriptors — ar5iv.labs.arxiv.org/html/1905.08581
- **MNAR in recommendation catalogues** — low coverage is informative, not neutral — arxiv.org/pdf/2009.02623
- **BU:GU balance guidance** — never judge bitterness by IBU alone — beerconnoisseur.com/articles/beers-vital-stats-abv-ibu-srm-og
- **Beer2Vec / flavour-text similarity** — textual descriptors beat raw stats, cross style lines — arxiv.org/abs/2208.04223
