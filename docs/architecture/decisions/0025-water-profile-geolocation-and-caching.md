# ADR-0025 — Local water profile: postal-code geolocation, live proxy first, append-only cache second

**Status**  Proposed
**Date**  2026-07-06
**Owners**  @benoit-bremaud

---

## Context

A brewer needs the **tap-water profile where they live** to judge whether their water suits a
recipe (and, later, how to correct it). Today the recipe **Water tab** runs entirely on 8
hardcoded predefined-city presets (`features/tools/data/water-profiles.data.ts`: Paris, Munich,
Dortmund, Burton, Dublin, London, Edinburgh, Pilsen) and **never calls the backend `/water`
endpoint** — there is no HTTP call to it (`getWaterProfile`, `codeInsee`, and `hubeau` return
nothing in `packages/mobile-app/src`; the `/water` substring appears only inside unrelated import
paths like `water-profiles` / `water-mineral-salts`).

The backend already exposes the data: `GET /water?codeInsee=&year=` (JWT-guarded,
`packages/api/src/water/controllers/water.controller.ts`), fixed on `main` in #1352 (`6595786`)
after the Hub'Eau v1 contract drift. It returns **5 brewing ions** (Ca, Mg, Cl, SO4, HCO3) +
`networkName` + `sampleCount` + a `conformity` enum + `hardnessFrench`. It does **not** return
sodium (Na), a per-sample `date_prelevement`, or pH.

This ADR governs the **bridge** from "where I live" to that live profile, and how we treat the
Hub'Eau data locally. It is the first buildable increment of the broader
**water-profile epic** ([[project_water_profile_epic]]) — whose full vision (recommended vs
local profile, per-ion compatibility %, mineral-water compatibility %, corrective-salt
suggestions) stays deferred and out of scope here.

**Locked before this ADR** (requirements debrief, 2026-07-06):

- **Functional core first, fancy map later.** The founder's idea of an interactive
  France **drill-down map** (région → département → commune, progressive zoom + back) is a
  genuine but **separate UX epic**; slice-1 delivers "get the water where I live" without it.
- **"My water" is a user-level notion**, but slice-1 keeps the location **ephemeral**
  (re-entered each time); persisting it ("remember my water") is a later, consented slice.
- **Visible feature first, cache second.** The live `/water` proxy already works (deployed,
  live-verified across Lille/Strasbourg/Rennes/Bordeaux). Ship the user-facing bridge on it,
  then add a backend cache + history.

### Documented study (why we are not guessing)

A five-angle research pass (French geo data, GeoJSON/map rendering weight, RN/Expo map options,
Hub'Eau freshness/multi-network semantics, existing-conception state) grounded the options, and
every external fact below was **verified live** against the two public APIs.

- **`geo.api.gouv.fr`** (DINUM, INSEE data — "API Découpage administratif") is a **sovereign,
  keyless, open** French state API: 50 req/s/IP, Licence Ouverte. It covers
  région → département → commune **and** postal→commune resolution. Every commune object exposes
  its INSEE `code` — **exactly the key Hub'Eau uses** — plus a `codesPostaux` array.
- **Postal ↔ INSEE is many-to-many in both directions** (verified live): one postal code →
  several communes (`01400` → 10 communes), one commune → several postal codes (Lille INSEE
  `59350` → 5 postal codes). A picker **must** force a commune choice when >1 candidate before
  calling `/water`. INSEE code ≠ postal code; codes are **strings** (Corsica `2A`/`2B`, DROM
  3-digit) — never parsed as integers.
- **Arrondissements**: the data lives on the **parent ("chapeau") commune code** — Paris
  `75056` (635 819 records) and Lyon `69123` have data; arrondissement codes (`75101`, `69383`)
  return **0**. Resolve to the parent commune INSEE.
- **Hub'Eau** refreshes ~monthly with a ~6-week sampling-to-publication lag. The honest
  freshness signal is `max(date_prelevement)` — **absent from our current DTO** (year only).
  A commune's supply is often a **blend of networks** (`reseaux[]`); the per-network `debit` %
  is documented in swagger but **absent from live JSON**, and the "NN%" seen in `nom_quartier`
  is free text (sometimes a %, sometimes a district, sometimes `-`). The dominant network is
  genuinely an **approximation**. `conclusion_conformite_prelevement` repeats per parameter row
  (a dedupe-by-`code_prelevement` concern for the **slice-2** cache, not the live path), and
  Hub'Eau caps query depth at 20 000 records.
- **The existing live `/water` path** (what slice 1 consumes, unchanged): it resolves the
  dominant network (`communes_udi` → `code_reseau`), queries `resultats_dis` by that
  `code_reseau` + the 5 ion SANDRE codes (Ca `1374`, Mg `1372`, SO4 `1338`, Cl `1337`, HCO3
  `1327`) + a one-year window (`size=100`), then **averages** the matching rows (cap 50) — **no**
  `code_prelevement` dedupe today. It already has a **process-level in-memory TTL cache** (a `Map`
  on the singleton `WaterService`, shared across requests, 3600 s, 500 entries); slice-2's
  append-only DB cache is a **separate durable layer**, not the first cache.
- **A clickable commune-level map is a real build, not a widget.** ~35 000 commune polygons
  crash / single-digit-FPS on `react-native-maps <Polygon>`; the only fully Expo-Go-compatible,
  offline, tile-free path is `react-native-svg` drawing simplified GeoJSON (region+dept contours
  are sub-MB; the national commune layer is 18 MB simplified → per-department lazy fetch).
  MapLibre looks best but forces a dev build (leaves Expo Go). This is why the map is deferred.
- **The whole chain is FR/EU-sovereign** with no US dependency: Hub'Eau (OFB/BRGM, SANDRE
  codes, ARS data) + geo.api.gouv.fr (DINUM/INSEE) + IGN geo data (Licence Ouverte).

Repo constraints: ADR-0001 (build for today), ADR-0002 (centralized backend), ADR-0003 (consent
as single source of truth — gates the deferred user-location persistence), ADR-0004 (data
locality hybrid), ADR-0015 (ingestion staging — the analogue for the cache), ADR-0020 (heavy
math server-side).

## Decision

Deliver the local-water bridge in **two slices**, and defer the map and the epic's richer
pillars.

- **Slice 1 (mobile, on the existing live proxy)** — a **postal-code** entry on the recipe
  Water tab → resolve via **live `geo.api.gouv.fr`** → **force a commune pick** when the postal
  code maps to several communes → call the **existing `GET /water`** with the resolved 5-digit
  INSEE → render the live profile. Location stays **ephemeral**.
- **Slice 2 (backend, after slice 1)** — an **append-only cache** of Hub'Eau measurements in our
  own DB, refreshed by a **conditional sync** (cheap date-check → full fetch only when Hub'Eau is
  newer than ours), serving from the DB with a **fallback** when Hub'Eau is unreachable, and
  finally exposing the **freshness date**.

### Geo input model for slice-1 (weighted decision matrix)

EU-sovereign data source is a **pass/fail prerequisite** (all options below use
geo.api.gouv.fr / IGN — all pass), not a scored criterion. Weights reflect a novice-facing,
KISS-first, ship-visible-value goal.

| Criterion (weight) | **A. Postal-code entry** | B. Région→dépt→commune list | C. Clickable France map |
| --- | --- | --- | --- |
| Shortest path to the INSEE the backend needs (30%) | **5** | 3 | 2 |
| Matches how a novice thinks ("mon code postal") (25%) | **5** | 3 | 3 |
| Build cost / risk in Expo (managed) (25%) | **5** | 4 | 1 |
| Forces the many-to-many disambiguation cleanly (20%) | **5** | 4 | 3 |
| **Weighted score** | **5.00** | **3.45** | **2.20** |

**Chosen: A (postal-code entry).** It is the shortest route to a 5-digit INSEE, matches the
novice's mental model, carries the least Expo build risk, and makes the unavoidable
`01400 → 10 communes` disambiguation a first-class step. **B** (a browse path) is the natural
post-slice-1 enrichment; **C** (the map) is the deferred UX epic — it adds real cost (SVG path
simplification, per-department lazy GeoJSON, a gesture/onPress conflict, an unvalidated Expo
SDK-54 `Path.onPress` Android regression) for **zero extra business value** over a postal-code
box for "get the water where I live".

### Where INSEE resolution lives (weighted decision matrix)

| Criterion (weight) | **A. Live geo.api.gouv.fr** | B. New backend resolver | C. Bundled offline table |
| --- | --- | --- | --- |
| Slice-1 build cost (30%) | **5** | 2 | 3 |
| No added surface (endpoint/DTO/ADR) (25%) | **5** | 2 | 4 |
| Freshness vs INSEE COG yearly changes (20%) | **5** | 4 | 2 |
| Bundle weight (20%) | **5** | 5 | 3 |
| Offline capability (5%) | 2 | 3 | **5** |
| **Weighted score** | **4.85** | **3.05** | **3.15** |

**Chosen: A (live geo.api.gouv.fr).** The user is already online to hit `/water`; the state API
is keyless, sovereign, always current, and adds zero bundle weight. **C** (a ~432 KB-gzipped
offline commune dump) is only justified once the offline drill-down map exists; **B** (a backend
resolver) is more surface for a lookup the free state API already does — revisit only if we later
want to cache/normalise it or feed the deferred salt engine.

### Data locality — live proxy now, cache later (weighted decision matrix)

| Criterion (weight) | A. Live proxy only | **B. Proxy now + append-only cache next** | C. Cache + history + analytics now |
| --- | --- | --- | --- |
| Time to visible user value (30%) | **5** | **5** (slice-1 unchanged) | 2 |
| Resilience if Hub'Eau is down (20%) | 1 | **5** | 5 |
| Enables freshness date + history (20%) | 1 | **5** | 5 |
| Slice size / KISS (15%) | **5** | 3 | 1 |
| Avoids speculative build (YAGNI) (15%) | **5** | 4 | 1 |
| **Weighted score** | **3.40** | **4.55** | **2.90** |

**Chosen: B.** Slice-1 ships on the live proxy (top score on time-to-value, unchanged); slice-2
adds the **append-only cache** (history accrues for free, keyed `code_reseau + parameter +
date_prelevement + code_prelevement`) with a **conditional sync** and a **DB fallback**. This is
RGPD-safe — the cached data is **public** ARS/Hub'Eau reference data, **not PII** (distinct from
the user's own location). **C** front-loads analytics screens the feature doesn't need yet
(YAGNI); the append-only schema keeps those analyses **possible later at no extra cost today**.

## Locked slice-1 parameters

- **Input** = a postal-code field on the recipe Water tab. On submit → `GET
  https://geo.api.gouv.fr/communes?codePostal=<cp>&fields=nom,code,codesPostaux` (live).
- **Disambiguation** = if the result has **>1 commune**, show a plain-language commune picker
  ("Plusieurs communes partagent ce code postal — laquelle ?") and resolve to one INSEE;
  resolve arrondissement inputs to their **parent commune** code.
- **Backend call** = the **existing** `GET /water?codeInsee=<insee>&year=<latest>` via a new
  mobile use-case + the shared `http-client` (**never** a direct `fetch`).
- **Output** = the live profile: **5 ions** (Ca/Mg/Cl/SO4/HCO3) + `hardnessFrench` (°fH) +
  `conformity` + **dominant network name with an honest "plusieurs réseaux desservent la
  commune" caveat** (expandable, depth-on-demand). **Never** render a fabricated per-network %.
- **Pedagogy** = **one** plain-language sentence (e.g. "Eau dure, riche en calcaire") — the app
  teaches; ppm alone don't speak to a novice.
- **Sodium (Na)** = **dropped and labelled** "non mesuré" (the backend returns 5 ions, not 6).
  Feeding a null/0 Na into compatibility or a future NaCl salt suggestion would be silently
  wrong.
- **Freshness** = honest **year + conformity** for now ("Analyses <année> — eau conforme, source
  ARS via Hub'Eau"); the exact **dated** freshness pastille arrives with slice-2 (when the DTO
  carries `max(date_prelevement)`). **Never** show a fetch-date as if it were the data currency.
- **Compatibility** = **reuse the existing global 0–100 score** (`recipe-details.utils`) fed by
  the live profile instead of a preset. Per-ion %, mineral-water %, and the salt engine stay in
  later epic slices. **Do not touch** the client-side salts helper
  (`helpers/water-mineral-salts.ts`) — it contradicts "water-math = backend".
- **Missing/partial data** = an explicit "donnée partielle / ion non mesuré" state, **distinct**
  from "non conforme" and from "conforme", so blanks never read as either.
- **Persistence** = **none** (ephemeral, like today). No new consent surface opened.

## Slice-2 design (cache + history)

- **Consistency with slice-1** = slice-2 keeps the existing **dominant-network** resolution
  (`communes_udi` → `code_reseau`) so the aggregation semantics are **unchanged**; the Hub'Eau
  calls below key on `code_reseau` (**not** `code_commune`, which would blend all networks and
  shift the average), and slice-2 additionally requests `code_prelevement` in the `fields` (the
  live path does not) to key the append-only rows.
- **Storage** = an **append-only** table of measurements, unique key
  `(code_reseau, code_parametre, date_prelevement, code_prelevement)`; never overwrite → history
  accumulates. The commune → dominant-network link is resolved at read time (as today).
- **Conditional sync** = on a lookup, a **cheap** call
  `resultats_dis?code_reseau=X&size=1&sort=desc&fields=date_prelevement` gives Hub'Eau's
  `max(date_prelevement)`; if it is newer than our stored max, run a **full fetch +
  upsert-ignore** (network + year + ion codes; dedupe by `code_prelevement`).
- **Serve + fallback** = read the profile from our DB; if Hub'Eau is unreachable during a sync,
  **serve the last known** data (resilience) and surface its date.
- **DTO evolution** = slice-2 **additively** extends the `/water` DTO with the freshness date
  (`max(date_prelevement)`); the endpoint contract, the 5 ions/hardness/conformity/network, and
  the mobile call site are otherwise **unchanged** — the mobile only upgrades its year-granular
  freshness line to a dated pastille.
- **Borrowed from ADR-0015, minus the gate** = the append-only shape reuses ADR-0015's staging
  *mechanism* (immutable, keyed, history-accreting) but **not** its human-gate (D4):
  Hub'Eau/ARS is authoritative **public reference** data, served directly with **no** promotion
  step — the trust boundary ADR-0015 protects does not exist here.
- **RGPD** = the cache holds **public** commune water data — **not PII**. The user's own
  location persistence remains out of scope (ADR-0003 territory).

## Deferred (explicitly out of scope here)

- The **clickable France drill-down map** (its own UML-first UX epic).
- **Analytics** on water-quality evolution by commune/département (the append-only schema keeps
  them possible; the screens/queries are YAGNI now).
- **"Remember my water"** = persisting the user's location (coarse PII → ADR-0003 consent + a
  retention decision) — its own consented slice.
- Epic pillars: **per-ion %**, **mineral-water compatibility %**, **corrective salts** (backend
  engine), and **sodium** ingestion (SANDRE `1367`).

## Consequences

- **Positive**: a real "get the water where I live" feature ships fast on code that already runs;
  a sovereign, keyless geo resolver; a clean two-slice path; the cache buys resilience,
  freshness, and free history without front-loading analytics.
- **Compliance (ADR-0004)**: the water lookup is a **cloud-first** journey — it is **not** in the
  active-brew critical path and carries **no offline guarantee**; slice-2's cache is an
  HTTP-style resilience layer, **not** a local-first sync engine. This is the explicit
  locality-world classification ADR-0004 § Compliance requires.
- **Negative / accepted**: two live external dependencies at input time (geo.api.gouv.fr + the
  Hub'Eau-backed `/water`) in slice-1 (mitigated by slice-2's cache/fallback); the dominant
  network stays an approximation (surfaced honestly); slice-1 shows year-granular freshness until
  slice-2 lands the dated signal.
- **Open (settle in build)**: the picker's **destination** (recipe Water tab vs the "Calculateur
  Eau" tool vs the prep-readiness water check — recommend the recipe Water tab first, one
  reusable entry point later) and the exact input widget (a single "nom-ou-code-postal" search
  field vs a postal-only field).

## Roadmap

1. **Slice 1** — mobile postal→disambiguation→INSEE→`/water` bridge + honest render. UML:
   `01-use-case`, `02-sequence-slice1-lookup`, `04-component`, `05-data-flow`.
2. **Slice 2** — backend append-only cache + conditional sync + DB fallback + `date_prelevement`
   in the DTO. UML: `03-sequence-slice2-cache-sync`.
3. **Later epic** — drill-down map (UX epic), reuse-persistence (consented), per-ion %,
   mineral-water %, corrective salts, Na, analytics.

## References

- Epic + debrief decisions: [[project_water_profile_epic]].
- Hub'Eau fix that unblocked this: #1352 (`6595786`), [[project_water_quality_hubeau_refresh]].
- `geo.api.gouv.fr` — API Découpage administratif (DINUM/INSEE), Licence Ouverte.
- Hub'Eau `qualite_eau_potable` v1 (OFB/BRGM, SANDRE, ARS data).
- Related ADRs: 0001, 0002, 0003, 0004, 0015, 0020.
