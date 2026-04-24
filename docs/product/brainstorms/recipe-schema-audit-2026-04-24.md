# Recipe schema audit — 2026-04-24

**Session** — Phase 1 of Epic [#708](https://github.com/benoit-bremaud/brasse-bouillon/issues/708) (DB schema audit + recipe ingestion brainstorm).
**Reference** — BrewDog DIY DOG 2019 v8 (see `docs/product/references/README.md`, local only). Sampled recipes: #1 Punk IPA 2007-2010, #2 Punk IPA 2010-current, #49 Santa Paws Christmas Scotch Ale, #50 AB:09 Cranachan Imperial Stout.
**Goal** — produce a gap analysis between the current Brasse-Bouillon schema (Python encyclopedia + NestJS api) and the fields a production recipe (DIY DOG style) requires, so the follow-up brainstorm (Phase 2 of #708) can make informed decisions.

---

## 1. DIY DOG recipe structure — reference

Every DIY DOG page is a **single recipe on one A4 sheet**. The structure is remarkably consistent across all 50+ sampled recipes.

### 1.1 Header

| Field | Example | Notes |
|---|---|---|
| Recipe number | `#1`, `#49`, `#50` | Sequential within the book — not necessarily a schema concern. |
| Beer name | `PUNK IPA`, `SANTA PAWS`, `AB:09` | |
| Version era / lifecycle tag | `2007 - 2010`, `2010 - CURRENT`, empty | Multiple versions of the same beer exist as **distinct** recipe records. See Open Questions (Q1) on versioning. |
| First brewed | `APRIL 2007`, `OCTOBER 2010`, `NOVEMBER 2010` | Month + year. Not edited after creation. |
| Tagline / style line | `POST MODERN CLASSIC. SPIKY. TROPICAL. HOPPY.`, `CHRISTMAS SCOTCH ALE.`, `CRANACHAN IMPERIAL STOUT.` | Free-text marketing copy. One sentence + flavour descriptors. |
| Header metrics | `ABV 6%`, `IBU 60`, `OG 1056` | Summary row — the three numbers a brewer scans first. |

### 1.2 "This beer is" — narrative block

Free-text 2-4 paragraphs. Origin story, flavour profile, brewing context. Distinct from the one-line tagline.

### 1.3 "Basics" — structured metrics table

| Field | Example value | Unit | Presence |
|---|---|---|---|
| Volume | `20L` / `5gal` | L + gal (dual) | Always |
| Boil volume | `25L` / `6.6gal` | L + gal (dual) | Always |
| ABV | `6%` | % | Always |
| Target FG | `1010` | specific gravity (unitless, ×1000) | Always |
| Target OG | `1056` | specific gravity (unitless, ×1000) | Always |
| EBC | `17` | EBC units | Always |
| SRM | `8.5` | SRM units | Always |
| pH | `4.4` | unitless | Always |
| Attenuation level | `82.14%` | % | Always |

### 1.4 "Method / timings" — process parameters

| Field | Example | Notes |
|---|---|---|
| Mash temp | `65°C / 150°F / 75mins` | Single temperature + duration. Some recipes have more than one step (not seen in samples but plausible). |
| Fermentation temp | `19°C / 66°F` | Single target temperature (range not given in samples). Duration not in the DIY DOG format — presumed "until attenuation target reached". |

### 1.5 "Ingredients" — three sub-tables

**Malt**: name + weight (kg + lb). Variable-length list (1 to 7+ items in sampled recipes). Example rows:
```
Extra Pale           5.3kg   11.7lb
Extra Pale           4.38kg  9.6lb
Caramalt             0.25kg  0.55lb
Carafa Special Malt Type 3   0.13kg   0.28lb
Weyermann Beech Smoked       0.63kg   1.39lb
```

**Hops**: variety + weight (g) + Add (timing stage) + Attribute (purpose). Variable-length. Example rows:
```
Ahtanum    17.5  Start    Bitter
Chinook    27.5  End      Flavour
Nelson Sauvin  20  Dry Hop  Aroma
```

The **Add** column takes values: `Start` (early boil), `Middle` (mid-boil), `End` (flameout / whirlpool), `Dry Hop` (post-fermentation).
The **Attribute** column takes values: `Bitter`, `Flavour`, `Aroma`.

**Yeast**: single-line product identifier. Example:
```
Wyeast 1056 - American Ale
Champagne
```

### 1.6 "Twist" — optional adjunct section

Present only on some recipes (decorative star icon). Free-format list of additions that don't fit the malt/hop/yeast taxonomy.

Santa Paws:
```
Honey    75g    FV
```

AB:09 Imperial Stout:
```
Lactose              125g
Scottish Heather Honey  125g
Raspberries          187.5g
```

Columns: name, amount (g), optional stage marker (e.g. `FV` = fermentation vessel). Some rows have a stage, some don't.

### 1.7 "Food pairing"

3-line list of food suggestions. Plain text.

### 1.8 "Packaging"

Photography of the bottle / can. Visual only — no structured data.

### 1.9 "Brewer's tip"

Single-paragraph free-text tip. Technical advice from the brewer.

---

## 2. Current state — Brasse-Bouillon schema

### 2.1 Python encyclopedia (`packages/beer-encyclopedia/db/models/`)

The encyclopedia models a **catalogue of beers + breweries + ingredients** for discovery. It was **not** designed to store full recipes.

| Table | Columns (selection) | Purpose |
|---|---|---|
| `beers` | name, slug, brewery_id, style_id, abv, ibu, srm, description, is_active, is_verified, **source, contributed_by, contributed_at, approved_at** (PR #706) | Beer identity + aesthetic metrics. No recipe data. |
| `breweries` | name + metadata | Brewery registry. |
| `styles` | style taxonomy | BJCP-style classification. |
| `ingredients` + `beer_ingredients` | name + type + `beer_ingredients` m2m | **Exists**, but at the "ingredient family" level (e.g. "Cascade hops" as a known ingredient) — not at the "12g in this specific recipe" level. |
| `tasting_profile` | aroma, flavour, body, bitterness, sweetness | Qualitative sensory axes per beer. |
| `media` | brewery / beer photography | |
| `sources` + `entity_sources` | polymorphic provenance tracking | JSONB raw data for each external import. |
| `correction` | community corrections queue | v0.2+ moderation pipeline. |

**Diagnosis** — the encyclopedia has the **beer catalogue** side but no **recipe** side. Adding recipes here would double up with the NestJS api schema (see §2.2) and would couple the discovery catalogue with the per-user brewing workspace. Out of scope for the encyclopedia.

### 2.2 NestJS api (`packages/api/src/recipe/entities/*.orm.entity.ts`)

The NestJS api models **per-user recipes and brewing batches**. It has a surprisingly rich recipe schema already.

| Entity | Key columns | Maps to DIY DOG section |
|---|---|---|
| `RecipeOrmEntity` | id, owner_id, name, description, visibility, version, root_recipe_id, parent_recipe_id, batch_size_l, boil_time_min, og_target, fg_target, abv_estimated, ibu_target, ebc_target, efficiency_target | Header + "This beer is" + "Basics" (partial) |
| `RecipeFermentableOrmEntity` | recipe_id, name, (type), weight_g, potential_gravity, color_ebc | "Ingredients → Malt" |
| `RecipeHopOrmEntity` | recipe_id, variety, type: `RecipeHopType`, weight_g, alpha_acid_percent, addition_stage: `RecipeHopAdditionStage`, addition_time_min | "Ingredients → Hops" |
| `RecipeYeastOrmEntity` | recipe_id, name, type: `RecipeYeastType`, amount_g, attenuation_percent, temperature_min_c, temperature_max_c | "Ingredients → Yeast" |
| `RecipeWaterOrmEntity` | recipe_id (PK), mash_volume_l, sparge_volume_l, mash_temperature_c, sparge_temperature_c, calcium_ppm, magnesium_ppm, sulfate_ppm, chloride_ppm, ph_target | "Method → Mash" + water chemistry (going beyond DIY DOG, which does not surface water chem) |
| `RecipeAdditiveOrmEntity` | recipe_id, name, type: `RecipeAdditiveType`, amount_g, addition_step: `RecipeStepType`, addition_time_min | "Twist" — exactly the right shape for honey, lactose, fruits, spices. |
| `RecipeStepOrmEntity` | recipe_id (PK), step_order (PK), type: `RecipeStepType`, label, description | Free-form procedural steps. Covers mash holds, boil notes, fermentation milestones. |

**Diagnosis** — the NestJS side is **90% ready** for recipe ingestion. Most DIY DOG fields already have a home. The gaps (§3 below) are targeted additions, not a re-architecture.

### 2.3 Separation of concerns — encyclopedia vs NestJS

- `packages/beer-encyclopedia/` — **authoritative beer catalogue** (breweries, beer identities, styles, tasting profiles, sources). What a beer *is*.
- `packages/api/` — **user-owned recipes and batches** (RecipeOrm + RecipeFermentable + RecipeHop + …). How a user *brews* a beer.

Recipes therefore live in `packages/api/`. The encyclopedia's `Beer` record points at the canonical identity; a recipe points at a `beer_id` (not yet wired — see gap #G1) to say "this recipe is my take on Punk IPA".

---

## 3. Gap analysis — DIY DOG fields → current schema

### Legend
- ✅ **present** — field maps 1-to-1 to an existing column.
- ➕ **missing** — needs a new column or entity.
- 🔧 **partial** — field exists but shape/naming needs adjustment.
- 🗑️ **out of scope** — intentionally not modeled.

### 3.1 Header

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Beer name | ✅ | `recipes.name` (+ `beers.name` on the encyclopedia side) | none |
| Recipe number | 🗑️ | — | Book-specific ordering, not a schema concern. |
| Version era label (`2007 - 2010`) | 🔧 | `recipes.version` (integer) + a new **display label** column | Add `recipes.version_label` (string, nullable) for free-form human readable era. Keeps `version` numeric for sort/compare. |
| First brewed | ➕ | new column | Add `recipes.first_brewed_at` (nullable DATE). |
| Tagline / style line | ➕ | new column | Add `recipes.tagline` (nullable VARCHAR 200). |
| Flavour descriptors (`SPIKY. TROPICAL. HOPPY.`) | ➕ | new column | Add `recipes.flavour_descriptors` (nullable VARCHAR array on PG, TEXT comma-joined on SQLite). Optional, small. |
| ABV (%) | ✅ | `recipes.abv_estimated` | none |
| IBU | ✅ | `recipes.ibu_target` | none |
| OG | ✅ | `recipes.og_target` | none |

### 3.2 Narrative

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| "This beer is" (2-4 paragraphs) | ✅ | `recipes.description` (TEXT) | none (already nullable TEXT) |

### 3.3 "Basics" metrics

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Volume (L) | ✅ | `recipes.batch_size_l` | none |
| Boil volume (L) | 🔧 | `recipes.batch_size_l` only exists today; boil volume is separate | Add `recipes.boil_size_l` (nullable REAL). Distinct from `batch_size_l`. |
| ABV | ✅ | `recipes.abv_estimated` | none |
| Target FG | ✅ | `recipes.fg_target` | none |
| Target OG | ✅ | `recipes.og_target` | none |
| EBC | ✅ | `recipes.ebc_target` | none |
| SRM | 🔧 | not stored — EBC is, SRM isn't | Either compute at query time (SRM ≈ EBC × 0.508) or add `recipes.srm_target` (REAL, nullable). **Decision needed (brainstorm Phase 2).** |
| pH | ➕ | — | Add `recipes.ph_target_wort` (nullable REAL). Different from `recipe_water.ph_target` (that one is water chemistry pre-mash). |
| Attenuation level (%) | ➕ | — | Add `recipes.attenuation_target_percent` (nullable REAL). Distinct from `recipe_yeast.attenuation_percent` which is the yeast strain's generic attenuation. |

### 3.4 Method / timings

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Mash temp + duration (single step) | 🔧 | `recipe_water.mash_temperature_c` covers the temperature, but `recipe_steps` has no structured duration field today (only `type`, `label`, `description`) | Add `recipe_steps.duration_min` (nullable INTEGER) so mash / boil / fermentation durations are queryable. Multi-step mashes then become multiple timed `recipe_step` rows. |
| Fermentation temp | 🔧 | `recipe_yeast.temperature_min_c` / `max_c` cover the yeast's viable range — not the **target** the brewer should hold | Add `recipes.fermentation_target_c` (nullable REAL) for the brewer's chosen temperature within the yeast's range. |
| Boil time | ✅ | `recipes.boil_time_min` | none |

### 3.5 Ingredients — Malt

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Name | ✅ | `recipe_fermentable.name` | none |
| Weight (kg) | ✅ | `recipe_fermentable.weight_g` (convert kg × 1000 at ingest) | none |
| Weight (lb) | 🗑️ | — | Display-time conversion; not stored. |
| Potential gravity | ✅ | `recipe_fermentable.potential_gravity` | nullable; fine if DIY DOG doesn't expose it. |
| Color (EBC) | ✅ | `recipe_fermentable.color_ebc` | nullable |

### 3.6 Ingredients — Hops

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Variety | ✅ | `recipe_hop.variety` | none |
| Weight (g) | ✅ | `recipe_hop.weight_g` | none |
| Add (`Start`/`Middle`/`End`/`Dry Hop`) | ✅ | `recipe_hop.addition_stage` (`RecipeHopAdditionStage`) + `recipe_hop.addition_time_min` | The current schema already represents these values: `Start` / `Middle` / `End` map to `addition_stage = boil` with different `addition_time_min` values, and `Dry Hop` maps to `addition_stage = dry_hop`. Extra stages `whirlpool` and `first_wort` are broader than DIY DOG — not a gap. No schema change needed unless a source uses a hop-use value that cannot be expressed as stage + time. |
| Attribute (`Bitter`/`Flavour`/`Aroma`) | ➕ | — | Add `recipe_hop.attribute` (nullable VARCHAR with CHECK: `bitter` / `flavour` / `aroma`). Documentary — the algorithm infers bitterness / flavour from addition time already, but preserving the authoring intent is useful for UX and for the matching algo (§ADR-0001: shapes anticipate evolution). |
| Alpha acid % | ✅ | `recipe_hop.alpha_acid_percent` | nullable; DIY DOG doesn't expose it but the ingestion can look it up from the `ingredient` catalog where possible. |
| Addition time (min) | ✅ | `recipe_hop.addition_time_min` | Store explicit minutes for boil additions (`Start` = full boil duration, `Middle` = intermediate, `End` ≈ 0). For `Dry Hop`, `addition_time_min` is typically null — the stage itself is carried by `addition_stage`. |

### 3.7 Ingredients — Yeast

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Name (e.g. `Wyeast 1056 - American Ale`) | ✅ | `recipe_yeast.name` | none |
| Product code (e.g. `1056`) | 🔧 | not separated from `name` | Nice-to-have: add `recipe_yeast.product_code` (VARCHAR 50, nullable) for structured lookup. DIY DOG doesn't need it; enrichment from external catalog (Wyeast/Fermentis/etc.) might. **Defer unless a consumer asks.** |
| Form (dry / liquid) | ✅ | `recipe_yeast.form` (already present) | none |
| Attenuation % | ✅ | `recipe_yeast.attenuation_percent` | nullable |
| Temperature range | ✅ | `recipe_yeast.temperature_min_c` / `max_c` | none |

### 3.8 Twist (adjuncts)

The DIY DOG "Twist" maps **directly** to `RecipeAdditiveOrmEntity`:

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Name (`Honey`, `Lactose`, `Raspberries`) | ✅ | `recipe_additive.name` | none |
| Amount (g) | ✅ | `recipe_additive.amount_g` | none |
| Stage (`FV` = Fermentation Vessel) | 🔧 | `recipe_additive.addition_step` (`RecipeStepType`) | Confirm `RecipeStepType` can represent DIY DOG adjunct timing (`fermentation` / FV, `boil`, `secondary`, `bottling` / packaging). If gaps, extend or define a mapping. **Verify in Phase 2.** |
| Kind (fruit / spice / sugar / other) | 🔧 | `recipe_additive.type` (`RecipeAdditiveType`) | Confirm `RecipeAdditiveType` covers DIY DOG adjunct categories (fruit, sugar, dairy / lactose, honey, spice, herb). If gaps, extend or define a mapping in Phase 2. |

### 3.9 Food pairing

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Pairing suggestions (3 lines, plain text) | ➕ | — | Add `recipes.food_pairings` (TEXT, nullable — store as newline-separated OR a JSON array per PG vs SQLite). Optional. |

### 3.10 Brewer's tip

| DIY DOG field | Status | Target | Required change |
|---|---|---|---|
| Single paragraph technical tip | ➕ | — | Add `recipes.brewer_tip` (TEXT, nullable). |

### 3.11 Provenance (Brasse-Bouillon own concept, not in DIY DOG)

| Field | Status | Target | Required change |
|---|---|---|---|
| Source discriminant | ➕ | — | Already added to `beers` in PR #706. Extend the same enum pattern to `recipes`: `source: 'diydog_import' | 'user_authored' | 'community' | 'seed'` (tentative). Needed by the matching algorithm (§Scan brainstorm) and by ADR-0001. **Decision needed on exact enum values.** |
| Link to the beer catalogue | ➕ | — | Add `recipes.beer_id` (nullable UUID, no FK if encyclopedia runs as a separate DB in some topologies — same pattern as `beer.contributed_by`). Populated when the recipe is "a take on beer X". Null for user-authored recipes without a target beer. |
| Matching algorithm quality fields | ➕ | — | From Epic #693 part 2/n (separate PR). `avg_rating`, `brew_count`, `last_brewed_at`, `is_official`. |

---

## 4. Consolidated gap — what needs to change

**On `recipes`** — 13 new columns in scope for this epic (mostly nullable scalars, 1 nullable UUID link). Stored as cross-DB-safe shapes (JSON-serialized TEXT for multi-valued fields so the same schema runs on SQLite + PostgreSQL without divergence):

1. `version_label` VARCHAR(50) nullable — human readable era ("2007 - 2010")
2. `first_brewed_at` DATE nullable
3. `tagline` VARCHAR(200) nullable
4. `flavour_descriptors` TEXT nullable (JSON array serialized as TEXT)
5. `boil_size_l` REAL nullable
6. `srm_target` REAL nullable — **OR** computed from `ebc_target` at query time (brainstorm decision)
7. `ph_target_wort` REAL nullable
8. `attenuation_target_percent` REAL nullable
9. `fermentation_target_c` REAL nullable
10. `food_pairings` TEXT nullable (JSON array serialized as TEXT)
11. `brewer_tip` TEXT nullable
12. `beer_id` UUID nullable (loose link to encyclopedia, no FK)
13. `source` VARCHAR(20) NOT NULL DEFAULT 'user_authored' + CHECK (extends Epic #693 pattern)

**On `recipe_steps`** — 1 new column:

1. `duration_min` INTEGER nullable — surfaces mash / boil / fermentation duration so it's queryable (currently `recipe_steps` only has `type`, `label`, `description`).

**On `recipe_hops`** — 1 new column:

1. `attribute` VARCHAR(20) nullable + CHECK (`bitter` / `flavour` / `aroma`)

**Not in scope for this epic (context only)** — 4 quality columns on `recipes` (`avg_rating`, `brew_count`, `last_brewed_at`, `is_official`) are tracked in Epic #693 part 2/n. Listed here so the Phase 2 brainstorm can sequence migrations, but excluded from Phase 3 scope.

**Enum verification** — `RecipeHopAdditionStage` already covers DIY DOG hop-use values (§3.6). `RecipeStepType` and `RecipeAdditiveType` need a Phase 2 check against DIY DOG adjunct taxonomy (fermentation / boil / secondary / bottling; fruit / sugar / dairy / honey / spice / herb) — extend only if gaps surface.

**On `recipe_yeasts.product_code`** — optional (deferred).

---

## 5. Open questions for the brainstorm (Phase 2)

The following are **not schema gaps** — they are **design choices** that the brainstorm must settle before migrations land.

### Q1 — Versioning

DIY DOG has multiple versions of Punk IPA (#1 V1 2007-2010, #2 V2 2010-current). They are **two distinct recipe records**. Our current `recipes.root_recipe_id` + `parent_recipe_id` hierarchy supports this. Decision needed:

- Is a **new version** a new `recipe` row with `root_recipe_id` pointing at the original? (current shape)
- Or is it tracked inside a single recipe row with a `version_history` JSON array?

Recommendation: stay with the current shape — new version = new row, chain via `root_recipe_id`. The `version_label` column above gives the human-friendly era tag.

### Q2 — SRM vs EBC

Do we store both, or derive SRM from EBC at query time?

- DIY DOG surfaces both → expected by brewers.
- Storing both is cheap (one REAL column) but risks drift if someone edits one without the other.
- Computing at query time (`srm = ebc × 0.508`) is cheap but hides the "source of truth" question.

Recommendation: store both; add a validator that warns (not errors) when they drift by > 10%.

### Q3 — Unit duality (L / gal, kg / lb, °C / °F)

DIY DOG surfaces every metric in both metric and imperial. Our schema stores **metric only**. Decision needed:

- Compute imperial at render time (cheap, consistent, clients can choose per-user unit preference).
- Store both (doubles storage + drift risk).

Recommendation: metric storage + render-time conversion. The `Compte` screen Axis C (units toggle) drives the rendered unit.

### Q4 — Provenance enum values on `recipes.source`

Proposed initial set:

- `diydog_import` — directly ingested from the BrewDog DIY DOG book.
- `brewery_official` — official recipe from a brewery (non-BrewDog), imported from a public source.
- `seed` — manually seeded by Brasse-Bouillon for the demo / catalogue.
- `user_authored` — a user typed the recipe in the app.
- `community` — published by a community user in v0.2+.
- `scan_import` — created via the Scan feature import flow.

Brainstorm will trim / rename. Current `beers.source` uses `openfoodfacts | internal | community` — must decide if we reuse that triplet for consistency or expand per the richer recipe origin story.

### Q5 — Where does the "Packaging" visual live?

DIY DOG surfaces a bottle photo per recipe. Our `media` table handles brewery / beer photos. Two options:

- Extend `media` to accept `recipe_id` (requires migration).
- Store a single `recipes.cover_image_url` (simpler, sufficient for one image per recipe).

Recommendation: `cover_image_url` VARCHAR(512) on `recipes`. One image = one URL. `media` stays for the richer beer-level gallery.

### Q6 — Encyclopedia `beer_id` linking

When a user imports a DIY DOG recipe, we know it's "Punk IPA 2010 - current". Should the recipe point at a beer row in the encyclopedia (`recipes.beer_id`)?

- Yes → enables the matching algo to score community recipes against the official one.
- Price → the encyclopedia must have a `Beer` row for every DIY DOG beer before recipes can reference it.

Recommendation: yes, add the loose UUID link. The ingestion pipeline (separate epic) creates / resolves the Beer row as a prerequisite.

---

## 6. Effort estimate

Assuming the Phase 2 brainstorm confirms the proposals above with minor adjustments:

| Work item | Effort | PR scope |
|---|---|---|
| Add 11 nullable columns + 1 enum + 1 CHECK on `recipes` | 1 day | Single TypeORM migration + entity update + unit tests. |
| Add `attribute` to `recipe_hops` | 0.25 day | Single migration + entity + tests. |
| Verify / extend `recipe_hops.use_timing` + `recipe_additive.usage_stage` enum values | 0.25 day | Possibly no migration if enums match; else one small migration. |
| Document the ingestion contract (how a DIY DOG page maps onto the API endpoints) | 0.5 day | `docs/api/recipe-ingestion.md` + OpenAPI tweaks. |
| Ingestion script skeleton (PDF → structured JSON → POST /recipes) | 2-3 days | Separate epic, tracked under Epic #708 Phase 3. |
| Seed a single recipe (Punk IPA 2010-current) end-to-end | 0.5 day | Validates the full pipeline before scaling to 50+. |

**Total for Phase 3 (post-brainstorm)** — ~4-5 focused dev days.

---

## 7. Recommended next step

Open a dedicated brainstorm session (Phase 2 of Epic #708) with the 6 open questions above as the agenda. Same format as today's morning brainstorms: Q&A, decisions validated one by one, output a `docs/product/brainstorms/recipe-schema-2026-MM-DD.md`.

Once the decisions are locked, the migrations ship as one or two small PRs (avoid the giant-PR pitfall we saw on other epics), and then the ingestion pipeline can start.

This audit does **not** commit to any schema change by itself — it freezes the gap map so the brainstorm can tranche decisions efficiently.
