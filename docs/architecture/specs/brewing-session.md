# Brewing session — process reference

> **Feature**: epic #868 — guided live brewing session ("I brew with the
> Brasse-Bouillon assistant"); assistance epic #781 (step structure + timers +
> tips); data model #605; step state machine #608.
> **Sibling**: epic #866 — BeerXML/BeerJSON schema & mapping (format side).
> **Personas**: Léa (beginner, needs guidance) · Nicolas (repeatable process).

## Context

This is the **source of truth** for the brewing process the app guides a user
through. It exists because the brassins/brewing domain had no spec or UML. The
process below is grounded in the BeerXML 1.0 schema, the BeerJSON 1.0 model, the
standard all-grain brew-day procedure, and the BrewDog DIY Dog recipe format
(the 25 recipes seeded by #780). The UML diagrams in
`docs/architecture/diagrams/brewing-session/` are the visual index of this spec —
they do not restate it.

**Key insight (epic #868):** a recipe record *is* the process — its mash
schedule, hop schedule and fermentation stages encode the ordered operations.
The guided session **derives its steps from recipe data**, it does not hardcode
them.

## Canonical phases (9, recipe-derived)

Phases are derived from the recipe's steps; optional phases appear only when the
recipe has the matching data (e.g. dry hop only if the recipe has dry-hop
additions). Durations/temperatures are recipe values; the defaults below are
typical for an all-grain ale.

| # | Phase (FR) | Typ. temp | Typ. duration | Derived from (recipe data) | Optional |
|---|-----------|-----------|---------------|----------------------------|----------|
| 1 | **Empâtage** (Mash) | ~65–67 °C | 60 min | mash step(s) `type=infusion/temperature` | no |
| 2 | **Rinçage** (Sparge / mash-out) | ~75–77 °C | 10–30 min | mash-out + sparge (BeerJSON: sparge = mash step) | optional (BIAB skips) |
| 3 | **Ébullition** (Boil) | 100 °C | 60–90 min (`boil_time`) | boil step + hop schedule (60/30/15/5/flameout) | no |
| 4 | **Whirlpool / hop-stand** | ~80 °C | 10–20 min | aroma/whirlpool hop additions | optional (see D2) |
| 5 | **Refroidissement** (Cool/Chill) | → 18–22 °C | 20–60 min | cool step to pitch temp | no |
| 6 | **Levurage** (Pitch) | 18–22 °C | instant | yeast + pitch temp | no |
| 7 | **Fermentation primaire** | yeast temp (~18–20 °C ale) | 7–14 days (`primary_age`) | fermentation stage 1 | no |
| 8 | **Houblonnage à cru** (Dry hop) | ~14 °C | 3–5 days | hop additions `use=dry hop` | optional |
| 9 | **Garde + conditionnement** (Cold crash / Packaging) | < 4 °C crash; then carbonation | 1–2 h active + 2–3 wks bottle conditioning | packaging + `carbonation`/`age` | no |

Mapping to the current API `RecipeStepType` enum (MASH, BOIL, WHIRLPOOL,
FERMENTATION, PACKAGING — 5 values): **#781 extends it** toward the 9-phase
`BrewPhase` set used in the class diagram — `mash, sparge, boil, whirlpool, cool,
pitch, primary_fermentation, dry_hop, conditioning_packaging` (adds SPARGE, COOL,
PITCH; splits FERMENTATION into `primary_fermentation` + `dry_hop`; PACKAGING
becomes `conditioning_packaging`). This extension is a schema decision (D1) → to
be ratified in an ADR before build.

## Pedagogical tips (the "why", vulgarized FR)

Each phase carries one tip (BrewDog DIY Dog "Brewer's Tip" style), surfaced via
an ⓘ icon. Examples (validated against the research sources):

- **Empâtage 67 °C** — *« À cette température l'alpha-amylase convertit l'amidon
  en sucres fermentescibles ; plus chaud = corps + sucres non fermentescibles,
  plus froid = bière plus sèche. »*
- **Ébullition** — *« L'ébullition stérilise le moût, isomérise les acides alpha
  du houblon (création de l'amertume) et concentre les sucres. »*
- **Levurage** — *« Verser la levure à 18–22 °C ; au-delà elle stresse et produit
  des esters/phénols indésirables. »*
- **Houblonnage à cru** — *« Le dry hop infuse les huiles aromatiques sans
  amertume (pas d'isomérisation à froid). BrewDog : ~14 °C, 5 jours, profil le
  plus aromatique. »*

## Live tracking data (#605)

During a session the brewer records, per step:

- **Measurement** — typed reading: OG / FG / temperature / pH / SG-spot, with
  value + unit + timestamp + step link.
- **Observation** — free text + optional photos + mood score.
- **Alert** — overdue (planned vs actual time) or threshold (e.g. temp out of
  range), with severity, dismissible.

## Step lifecycle (#608)

`pending → in_progress → completed`, plus `paused` (resumable) and `skipped`
(with reason, for optional phases). Transitions persist real timestamps
(`actualStart`, `actualEnd` in the domain model; `actual_start` / `actual_end`
as TypeORM snake_case columns). Countdown timers run on the `in_progress` step
from its planned duration; the start timestamp is persisted so the timer
survives app close/reopen. Long phases (fermentation 7+ days) display in
days/hours, not seconds.

## Sources

- BeerXML 1.0 schema — <https://www.beerxml.com/beerxml.htm>
- BeerJSON 1.0 — <https://beerjson.github.io/beerjson/> · <https://github.com/beerjson/beerjson>
- All-grain brew day (AHA) — <https://homebrewersassociation.org/tutorials/all-grain-batch-sparge-homebrewing/all-grain-batch-sparge-homebrewing/>
- BrewDog DIY Dog / Punk IPA method + Brewer's Tip — <https://byo.com/recipes/brewdog-punk-ipa-clone/>

## Open decisions (ratify before build)

- **D1** — extend `RecipeStepType` to the 9-phase set (ADR needed; touches API + mobile + BeerXML mapping #866).
- **D2** — whirlpool: own phase or boil sub-step? (BeerJSON makes it explicit; #781 folds it into boil/cool.)
- **D3** — fermentation surfaced in production (today demo-only) — minimal manual log vs sensor data (cross-ref ux-refonte journey-3 gap).
