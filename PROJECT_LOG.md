# Project Log — Brasse-Bouillon

Reverse-chronological record of all project activity (most recent entries first).
This is the operational logbook, not the release changelog (see [docs/changelog.md](docs/changelog.md)).

---

## 2026-04-27

### PR #?? opened — Mobile UI: beer info card with hero + lazy folds (Issue #698)

Branch `feat/mobile-scan-info-card-issue-698`. Third link of the
demo-hero scan chain (after #696 backend / #697 data layer): the
"Beer recognised" screen the user lands on after a successful
barcode scan, and the first thing the jury will see during the
2026-05-27 soutenance demo.

Scope:

- **EBC-driven hero** — `BeerHero` renders a coloured hero whose
  background is computed from the beer's `colorEbc` value (palette
  mirrors the Couleur calculator's reference table). Punk IPA shows
  amber-orange, Rochefort 10 deep brown, La Chouffe pale amber —
  same data drives both the visual identity and the "Couleur" word
  in the at-a-glance row.
- **At-a-glance card in WORDS not numbers** — per persona Léa la
  Curieuse: ABV exact (`5.4 %`) + strength word
  ("De session" / "Standard" / "Forte"…) + style / colour
  ("Ambrée") / bitterness ("Modérément amère") in plain French.
  Numbers stay available in the "Détails techniques" fold.
- **Lazy folds (GoF Lazy Initialization)** — `Collapsible` accepts
  a `renderContent: () => ReactNode` factory called only on first
  open. Today the fold content is already in memory (technical
  details + curated brewery story); tomorrow when a brewery-story
  endpoint or richer data ships, the same component swaps to a
  network-lazy `useQuery` without changing the consumer.
- **Demo-flow completeness** — to make the soutenance scan demo
  testable end-to-end on day 1 (oral blanc J-9), three demo
  equivalent recipes + three brewery stories are hardcoded in
  `mocks/demo-data.ts` for the canonical demo beers (Punk IPA,
  La Chouffe, Rochefort 10). Same shape as the future #699 API
  output — when the matching backend ships, the data source swaps
  without UI changes.
- **Wiring** — `ScanScreen.handleAnalyzeBarcode` now navigates
  directly to `/(app)/dashboard/scan/lookup/{barcode}` when a
  barcode is confirmed (5/5), bypassing the legacy
  `processScanAttempt` / label-match flow for that path. Bottle
  mode (no barcode) keeps the legacy flow.
- **Tests** — 32 new unit / integration tests across 5 suites
  (formatters 41 cases, color utility 11, Collapsible 6, BeerHero
  3, BeerInfoCardScreen 12). Covers happy / sad / edge per
  convention plus lazy-render assertions, error states,
  accessibility states.

Decisions:

- `BreweryStory` / `EquivalentRecipes` / `TechnicalDetails`
  rendered as components within the screen file rather than
  separate files. Keeps the screen self-contained until clear
  reuse emerges (none in sight today).
- `Collapsible` lives in `features/scan/presentation/components/`
  rather than `core/ui/`. Moved to `core/` later when a second
  feature needs it. Premature promotion is a frequent
  over-engineering trap.
- `getDemoEquivalentRecipes` and `getDemoBreweryStory` helpers
  ship from `mocks/demo-data.ts` rather than each feature's
  application layer. Per the existing `dataSource.useDemoData`
  convention — demo helpers live in mocks/, application layer
  stays clean.
- Unused legacy import `processScanAttempt` left in
  `ScanScreen.tsx` (used by bottle mode handlers) — not removed
  to keep the wiring change minimal per the user's decision on
  Q4 (Option A — minimum nav change).

Follow-ups (out of scope for this PR):

- Real recipe matching (#699) — replaces `getDemoEquivalentRecipes`
- Real brewery story endpoint — replaces `getDemoBreweryStory`
- Network-lazy folds (`renderContent` swaps to `useQuery`)
- Real beer photo on the hero (when backend ships `photoUrl`)

### PR #731 merged (`e2e04d7`) — Mobile data layer for `/scan/lookup` (Issue #697)

Mobile counterpart of backend PR #729. Closes the data path from the
scan UI down to the new `GET /scan/lookup/:ean` endpoint while keeping
the demo flow working offline. Branch
`feat/mobile-scan-lookup-data-layer-issue-697`. Ships 7 files / 746
insertions across the 3 Clean Architecture layers + tests.

Scope:

- **Domain** — `ScanCatalogItem`, `ScanLookupResult`, `ScanLookupSource`,
  `ScanCatalogItemOrigin` added to `scan.types.ts` (camelCase domain
  shape).
- **Data** — `scan-lookup.api.ts` calls the endpoint via the shared
  `http-client`, maps snake_case DTO -> camelCase, URL-encodes the EAN
  against path-traversal.
- **Application** — `lookupBeerByBarcode` use-case: normalises barcode
  (trim + strip non-digits), validates length against the backend
  contract (`^\d{8,14}$`), branches on `dataSource.useDemoData` to
  serve the on-device `demoScanCatalog` (Punk IPA, La Chouffe,
  Rochefort 10), maps `HttpError 404 -> ScanLookupBeerNotFoundError`
  and `503 -> ScanLookupServiceUnavailableError`, otherwise re-throws.
- **Tests** — 22 new unit tests (5 data layer + 17 use-case layer),
  full mobile suite at 443 passed / 52 suites.

Review cycle:

- 2 inline comments on the initial commit (`5934f06`):
  - **Codex P2** — validate barcode length before lookup. Implemented
    via `BARCODE_MIN_LENGTH = 8` / `BARCODE_MAX_LENGTH = 14` constants
    mirroring `ScanDomainService.validateBarcode`. 4 new boundary
    tests added. Avoids a useless network round-trip on malformed
    input.
  - **Copilot Should Have** — `buildDemoScanCatalogItem` defaulted
    `is*Estimated` flags to `true` and `notesSource` to a generic
    string even when explicit values were provided, diverging from
    the backend seed convention. Defaults now derive from value
    presence (`overrides.is*Estimated ?? overrides.<value> == null`),
    `notesSource` defaults to `null`, and La Chouffe + Rochefort 10
    entries got per-item `notesSource` strings tied to real upstream
    documentation.
- Both fixes shipped in `5cb4353`. End-of-review summary posted in
  French. User merged manually from GitHub UI.

Side fix bundled in this PR — the unanchored `data/` rule in
`.gitignore` (intended for the API SQLite folder) was silently
ignoring the mobile Clean Architecture `data/` layer folder, so any
new file under `packages/mobile-app/src/features/<feature>/data/`
would never be picked up by `git add`. Anchored to
`/packages/api/data/` — backend behaviour unchanged.

Decisions:

- `scan-lookup.api.ts` ships with the single backend method name
  (`lookupBeerByBarcode`) instead of the spec's `getBeerByBarcode` +
  `getRecipesForBeer` split. Reason: the backend (#696/#729) ships a
  single `GET /scan/lookup/:ean` endpoint; the recipe-matching half
  is the separate vertical owned by #699. Function name mirrors the
  backend method 1:1.
- New domain types appended to `scan.types.ts` rather than split into
  a dedicated `beer-data.types.ts` per spec — keeps a single domain
  file per feature (existing convention) and no reviewer pushed back.
- Error classes co-located with the use-case they're thrown from
  rather than extracted to `domain/errors.ts`. Same rationale.

Infra hiccup — first CI run on the PR died at runner-pickup
(`billable.UBUNTU.total_ms = 0`, no steps executed) across all
workflow files. Diagnosis: GitHub Actions monthly quota (3,000 min on
GitHub Pro) exhausted on 2026-04-27 with reset 4 days away,
unacceptable on the J-30 demo path. User added a $5 monthly Actions
budget on the personal account (with `Stop usage when budget is
reached` enabled — hard cap, no risk of overrun). Empty commit
`670862c` re-triggered the workflows, all 5 checks (changes,
mobile-app, security-audit, SonarCloud Scan, SonarCloud Code
Analysis) passed first try after the unblock. Migration of the repo
to the StudioB22 organization (which has a separate untouched 3,000
min quota) was considered but deferred to post-soutenance — too risky
during the demo sprint (SonarCloud reconfig, secrets, project
re-link).

Next link in the demo-hero scan chain: **#698** — mobile UI info
card. Wires the use-case shipped here into the scan flow's "Beer
recognised" presentation step. Followed by #699 (recipe match), #700
(matching UI), #601 (import to Mes Recettes).

---

## 2026-04-24

### PR #715 merged (`600b6e2`) — Onboarding & auth brainstorm

Consolidation of a 90-minute Q&A session with the product owner on the
Onboarding journey (Tier 1 demo-essential). Branch
`docs/onboarding-brainstorm-2026-04-24`. Ships as a 354-line doc
`docs/product/brainstorms/onboarding-2026-04-24.md` following the same
structure as the 3 previous brainstorms (scan, compte, recipe-schema
audit).

Key decisions frozen (20 total):

- **Three values of an account** — persist user-owned data + sync
  multi-device + participate in community (all three in scope, not
  just one).
- **Hybrid gating** — app is usable in guest mode; login wall appears
  only at realised-value actions (import, rate, publish).
- **Data locality principle** — local-first for the brewing assistant
  critical path (Mes Brassins + dependencies), cloud-first with HTTP
  cache for everything else. Derived from a 4-level criticality
  framework applied to 15 user journeys and 11 brewing phases.
- **Signup philosophy** — progressive mix: minimal email+password (or
  Google OAuth) + skippable onboarding (display name, avatar,
  experience level, preferred styles, unit system).
- **OAuth + password rule** — simplified v0.1: one account per email,
  providers stored as an array, manual add-provider from Settings, no
  auto-merge until v0.2 (requires solid email verification first).
- **Session** — 30-day refresh token via `expo-secure-store` with
  silent refresh.
- **Scan auth pattern β Hybrid** — validated by 8/8 MUST HAVEs,
  derived mechanically from the constraint matrix (α Full gated scores
  2/8, γ Fully open scores 7/8).

Review cycle — 1 round: Codex (1 P2 comment) + Copilot (4 comments).
All 5 valid, all fixed in `235c6a0`:

- Phase numbering reconciled (3 phases locked → UX becomes Phase 4,
  Stack Phase 5, Implementation Phase 6).
- 2 agent-memory file references dropped and inlined (they live
  outside the repo, readers could not resolve them).
- `#694` mis-mapping corrected to `#611` (the actual navigation-unify
  epic; `#694` is the merged B-70 About footer PR).

Impacts 11 existing backlog items and opens 3 new follow-ups for a
future session (guest session storage + migration, dual route
conventions for auth-protected vs anonymous endpoints, formal ADR on
the data locality principle).

- **Decisions**:
  - `hybrid data locality principle` — the brewing assistant must
    function 100% offline for 5-6 continuous hours (phases 2-6 of the
    brew day), every other journey is cloud-first. This is the
    architectural rule that shapes every upcoming technical choice.
  - `scan stays guest-friendly` — chosen mechanically via 8/8 MUST
    HAVEs, not by preference; the pattern satisfies the demo wow
    effect without compromising identity-required journeys.

### PR #714 merged (`96f2f5c`) — Project log entry for PR #712 + Epic #713

Small follow-up PR that adds the `PROJECT_LOG.md` entries for today's
merge of PR #712 (recipe schema audit) and for the new Epic #713
(unit conversion). Branch `chore/project-log-2026-04-24-pr712`.

Review cycle — 1 round: Copilot flagged that the log wording said
"13 nullable columns" while the audit actually declares the `source`
column as `VARCHAR(20) NOT NULL DEFAULT 'user_authored'`. Fixed in
`f22d1e7` by splitting the claim into "13 columns (12 nullable +
required `source`)" so the log entry stays factually aligned with the
audit document.

### PR #712 merged (`499f91c`) — Recipe schema audit (Epic #708 Phase 1)

Phase 1 of Epic #708 ships as docs-only — a 383-line gap analysis
between the current Brasse-Bouillon schema (Python encyclopedia + NestJS
api) and the fields a DIY DOG recipe requires. Reference material:
BrewDog DIY DOG 2019 v8 (4 recipes sampled: Punk IPA V1/V2, Santa Paws,
AB:09).

Key takeaways frozen in the audit:

- NestJS recipe domain is ~90% ready (7 Recipe entities already cover
  header / fermentables / hops / yeasts / water / additives / steps).
- 13 columns to add on `recipes` for this epic (12 nullable + required
  `source VARCHAR(20) NOT NULL DEFAULT 'user_authored'` with CHECK),
  1 on `recipe_hops` (`attribute`), 1 on `recipe_steps` (`duration_min`,
  surfaced as a real gap by Copilot).
- 4 quality columns (`avg_rating`, `brew_count`, `last_brewed_at`,
  `is_official`) explicitly kept out of scope — routed to Epic #693
  part 2/n.

Review cycle — 2 rounds: Codex P2 (1 comment, fixed in `78db7b8`) and
Copilot (7 valid comments, all fixed in `2684142`). Fixes verified
against the actual ORM entities (`addition_stage`, `addition_step`,
`type` are the real column names, not `use_timing` / `usage_stage` /
`form`). 6 open questions parked for Phase 2 brainstorm. No schema
change in the PR — audit only.

- **Decisions**:
  - `storage in metric, display in user-preferred units` — multi-valued
    fields use JSON-serialized TEXT so SQLite and PostgreSQL share the
    same schema without divergence.
  - `13-column scope frozen for this epic` — the 4 quality columns from
    Epic #693 part 2/n are listed for context only, held out of the
    numbered list so Phase 3 migration scope is unambiguous.

### Epic #713 created — App-wide metric ⇄ imperial unit conversion

Surfaced during PR #712 review (Copilot flagged a wrong kg→lb
conversion in a reference example). User reaction on 2026-04-24:
*"je l'avais complètement oublié ! Il faut prendre en compte et gérer
les conversions d'unité entre métrique et impérial !"*. Converted into
a dedicated epic covering 8 dimensions (weight, volume, small-volume,
temperature, color EBC↔SRM, density SG↔Plato, pressure, unitless
percentages), with a storage-in-metric / display-layer-toggle contract.

Milestone: v0.1.0-beta1. Dependencies: #644 / #645 (merged Compte &
Paramètres screen hosts the toggle), #660 (calculators-scoped existing
issue folded under #713 as sub-task), #708 Q3 (recipe schema unit
duality decision informed by this epic). Effort: ~3-4 days, best
sequenced after the Compte & Paramètres screen ships.

### Personas review — 5 personas + drêches bonus planned

Morning session final brainstorm (fourth of four) — full personas
review triggered by the user's request to reconcile the existing
[docs/personas/user_personas.md](docs/personas/user_personas.md)
(3 personas: Nicolas / Claire / Marc) with the product decisions
taken earlier in the day (Scan brainstorm introduced a "curious
amateur" primary persona, Compte brainstorm used an unnamed
"Marie" brewer in examples, Google Forms survey surfaced a strong
ecology axis with zero feature ship).

Method: debrief by tensions, five tensions resolved one by one
with clickable Q&A:

- **Tension 1 (vocabulary)** — proper names (Léa, Nicolas, Claire,
  Zoé, Marc) stay in the personas file for storytelling; technical
  roles (Discovery / Novice / Amateur / Eco-responsible / Expert)
  are used in user stories, user scenarios, GitHub tickets, and
  code comments.
- **Tension 2 (Scan brainstorm's "curious amateur")** — promoted
  to a distinct 4th persona **Léa la Curieuse** (25-32, young urban
  active, discovered a beer socially, no brewing equipment). Becomes
  the primary persona for the 2026-05-27 defense (scan demo hero).
- **Tension 3 (gaps personas → features)** — aligned on the P0-P4
  priority already validated; each persona has at least one v0.1
  feature served (Léa: full scan; Nicolas: Académie Glossaire;
  Claire: labels + UI fluidity; Zoé: drêches bonus; Marc: CSV
  export bonus), everything else roadmapped v0.2+.
- **Tension 4 (admin persona)** — Admin dropped from the brewer
  personas (not a brewer). The two admin user scenarios (public
  recipe management, user management) were removed from
  [docs/user_scenarios/user_scenarios.md](docs/user_scenarios/user_scenarios.md)
  with a note redirecting to a future v0.2+ epic "Community
  moderation".
- **Tension 5 (ecology)** — created a 5th persona **Zoé la
  Brasseuse Éco-responsable** (28-40, ecology-adjacent profession,
  1-2 years of brewing) and committed to ship a minimal
  **drêches (spent grain) valorization** feature in v0.1 as a
  planned bonus (~0.5-1j: an end-of-batch card suggesting 3-5
  hand-written recipes to reuse the spent grain).
  [docs/requirements/user_needs.md](docs/requirements/user_needs.md)
  §4 rewritten as a table with explicit version status per item
  (drêches v0.1, carbon footprint v0.2+, local suppliers v0.2+).

Final personas: 5 (Léa primary + Nicolas + Claire + Zoé + Marc),
mapping table + reference rule added at the top of the personas
file. Version bumped to v2 with a versioning history block.

**Side effect**: the user adopted *"Build for today, design for
tomorrow"* (ADR-0001 title) as a structuring catchphrase for the
rest of the defense preparation — the phrase now ties the Scan
brainstorm, the Compte brainstorm, the three ADRs, and the personas
priority table into a single coherent narrative.

### Architecture session — three ADRs accepted ([PR #691](https://github.com/benoit-bremaud/brasse-bouillon/pull/691))

Morning session continuation (third of four brainstorms scheduled for
the day) — structured Q&A to formalize three architectural decisions
that already governed the code informally and needed a written
contract.

Branch `docs/adr-001-002-003`, merged as `148da08`. Review cycle:
two Codex **P1 (Must Have)** comments on ADR-0003 revealing real
logic bugs — (a) the read contract `scan.training OR ml.training`
preserved a stale opt-in over a newer global opt-out (GDPR
compliance failure), rewritten as "most recent decision across
both axes wins" with a single helper scanning the append-only log;
(b) v0.1 storage described as "AsyncStorage keyed by axis"
contradicted the append-only clause — rewritten as a single
`brasse.consent.log` key holding a JSON array of `ConsentDecision`
records. Seven Copilot comments on ADR-0002 (broken path reference,
garbled "anti-pattern exception" wording) and ADR-0003 (incomplete
canonical axis list missing `scan.training`, two `browseable`
typos) — three unique + four duplicates, all grouped with
cross-references. All nine addressed in commit `508bab2`.

All three land as accepted ADRs under a new folder
[`docs/architecture/decisions/`](docs/architecture/decisions/) with a
README explaining the template (Michael Nygard format) and the
mutability policy (append-only once accepted, supersession via a new
ADR).

- **ADR-0001 — Build for today, design for tomorrow.** Five-clause
  rule (minimal implementation, shapes anticipate evolution, `501 Not
  Implemented` stubs for deferred endpoints, components extensible by
  default, one ADR per structural choice), four forbidden anti-patterns
  (feature flags for non-existent features, phantom lifecycle hooks,
  premature abstraction without the rule of three, `TODO v2` without
  a trace), three tolerated exceptions (kill switches on demo-critical
  paths, abstractions imposed by Clean Architecture, dated transient
  TODO markers). Enforcement at PR-review time via the AI reviewers
  (Copilot, Codex) reading the ADR through `CLAUDE.md`.
- **ADR-0002 — Centralized NestJS backend.** Mobile talks only to
  our NestJS API; the backend proxies OpenFoodFacts today and
  Wikipedia / Untappd / RateBeer / brewery scrapers tomorrow.
  Response normalisation, server-side caching, and credentials
  management all live server-side. Aligned with ADR-0001 on the
  `source` discriminant and the `501` stubs.
- **ADR-0003 — Consent as a single source of truth.** One canonical
  append-only consent store on the mobile app, feature-namespaced
  axes (`scan.barcode`, `scan.photos`, `scan.metadata`, `ml.training`,
  `telemetry`, …), two writers in v0.1 (Scan onboarding, Settings
  privacy). Resolves the Scan / Settings consent overlap flagged in
  the two earlier brainstorms. GDPR-compliant by construction.

Root `CLAUDE.md` now carries a mandatory "Architecture Decision
Records" section linking the three ADRs, so every agent starting a
session reads them before reviewing code. Violations should be
flagged at PR-review time with an explicit ADR number + clause
citation.

### Log entry enrichment for PR #688 ([PR #689](https://github.com/benoit-bremaud/brasse-bouillon/pull/689))

Small follow-up PR to bring the `Compte` & settings entry (above) in
line with the per-merge logging convention: adds the PR #688 link,
the merge SHA `6a518b0`, the branch name, and the review-cycle
narrative (1 Codex P2 on a contradictory MVP estimate, 5 Copilot
comments on `docs/CONVENTIONS.md` compliance, all addressed in
commit `761f4d8`).

Branch `docs/project-log-pr-688`, merged as `56a861d`. Review
cycle: one Copilot comment flagging that even the meta-commentary
naming the flagged French terms (by quoting them verbatim) itself
violates `docs/CONVENTIONS.md` §1. Paraphrased as "a French quote
in a heading / a French data-privacy acronym / a French legal-notice
phrase" in commit `4e2d558`; the English referents (`GDPR`,
`packages/mobile-app/CHANGELOG.md`) stay as code spans.

Also introduces a new repeatable process rule on this project: an
**end-of-review summary comment** is now posted on every PR before
the user merges (CI state, reviews received, resolution commit SHAs,
explicit "ready to merge" line). Stored as a durable convention in
the agent's memory so all future PRs follow the pattern.

### `Compte` & settings brainstorm + MVP conservative cuts ([PR #688](https://github.com/benoit-bremaud/brasse-bouillon/pull/688))

Morning session continuation — 45-minute structured Q&A on the
merged `Compte` screen, which consolidates `Profil` and `Paramètres
globaux` into a single surface (backlog item **B-45**, decided on
2026-04-23). 7 axes scoped (A→G) and captured in a new reference
file [`docs/product/brainstorms/compte-parametres-2026-04-24.md`](docs/product/brainstorms/compte-parametres-2026-04-24.md).

Budget synthesis showed the full scope at 25-36 days against 24
working days available before the defense. Product owner chose the
**conservative cuts** strategy, saving ~7-8 days by deferring to
v0.2: app-wide Units toggle (kept as single-screen stub), browseable
consent log (collection only kept), full badge grid (Level N2 kept),
avatar upload (text-only initial kept), and real GDPR ZIP export
(stub message kept).

Key MVP scope for v0.1.0:

- **Axis A (identity)** — display name + bio editable, text-only
  initial avatar. Email / password change deferred.
- **Axis B (brewer)** — stats card + level (Apprenti / Brasseur /
  Maître Brasseur). Badges grid deferred.
- **Axis C (preferences)** — theme full (system / light / dark) +
  units stub on one representative screen + notifications and
  privacy stubs with switches persisted locally.
- **Axis D (GDPR)** — delete account real with 30-day grace period,
  export stub message, consent collection silently plumbed to the
  same consent store used by Scan.
- **Axis E (social)** — none in MVP.
- **Axis F (about)** — full panel: version + commit + build date +
  OTA channel info. Ships alongside B-70 (version display) planned
  for this afternoon.
- **Axis G (demo)** — reserved for defense rehearsal.

Decomposed into 7 codable chunks (~7-8 focused dev days) to execute
in parallel with Scan Tranche 2. Principle confirmed: *"Build for
today, design for tomorrow"* (pending ADR-001).

Branch `docs/compte-parametres-brainstorm-2026-04-24`, merged as
`6a518b0`. Review cycle: one Codex **P2** (contradictory MVP
estimate — Section 2 read `~18 days` while Section 10 chunks
totalled `~7-8 days`; reconciled to Section 10 as the authoritative
number) and five Copilot comments on `docs/CONVENTIONS.md`
compliance (a French quote in a heading, a French data-privacy
acronym used instead of `GDPR`, a French legal-notice phrase, the
PROJECT_LOG heading in French, and a root-level `CHANGELOG.md`
reference that should point at `packages/mobile-app/CHANGELOG.md`
per §3). All six comments addressed in `761f4d8`.

### Scan brainstorm + product decisions framing ([PR #686](https://github.com/benoit-bremaud/brasse-bouillon/pull/686))

Morning session structured as a 60-minute Q&A with the product owner
to lock in the product decisions for the Scan feature — the **demo
hero** of the 2026-05-27 defense. 18 decisions taken and validated,
documented in a new reference file
[`docs/product/brainstorms/scan-2026-04-24.md`](docs/product/brainstorms/scan-2026-04-24.md).

Key decisions:

- **Primary persona** — curious amateur who wants to learn to brew
  (not the experienced brewer persona); drives all UX choices.
- **Product metaphor** — pharmacy: official brewery recipe as the
  brand-name medicine, community recipes as generics. Structures
  vocabulary, visuals, and embedded pedagogy.
- **UX structure** — Hero photo + essentials + recipes visible
  without scroll + technical details and brewery story in
  lazy-loaded folds. Sections with fewer than 3 filled fields
  auto-hide.
- **Matching algorithm** — multi-criteria score:
  `Similarity × 70% + Quality × 30%` where Similarity combines
  Style/ABV/Bitterness/Color weighted 50/25/15/10 (with weight
  renormalization when a criterion is missing), and Quality combines
  AvgRating/BrewCount_confidence/Recency weighted 60/30/10. Official
  recipes have Similarity = 100% by definition.
- **Little-known beers strategy** — hybrid vision: read-only display
  + discreet `mailto:` for correction suggestions. No community
  backend in MVP, but the data model is prepared for V2 (source,
  contributedBy, contributedAt fields; stub endpoints returning
  `501 Not Implemented`).
- **Architecture API** — centralized NestJS backend, mobile talks to
  a single API, backend proxies OpenFoodFacts and future sources
  (Wikipedia, Untappd). API keys stay server-side.
- **Demo fallback strategy** — 6 demo beers hard-coded in the app
  (offline-ready), 1-hour memory cache for any other beer scanned
  live.
- **Demo script** — 90-second scripted flow (amateur → scan →
  discovery → match → import), enriched with a "jury beer" variant
  that covers 4 adaptive scenarios (known / unknown / unreadable
  barcode / not-a-beer).
- **Project principle validated** — *"Build for today, design for
  tomorrow"*. To be formalized as **ADR-001** in the upcoming
  Architecture session.

Copilot review on #686 caught two real issues: the document was
originally written in French (violates `docs/CONVENTIONS.md` §1
requiring English) and had a naming drift (`Brassins_log` vs
`Confiance_brassins` for the same metric). Both fixed in commit
`562aecc`. Two other Copilot comments (about literal `|-` list
prefixes and `||` table starts) were false positives — the markdown
uses standard GitHub-flavored table syntax (`|---|---|`).

### Repository cleanup

Post-session repo hygiene after last night's 8-PR release-please
activation:

- Reverted an accidental `app.json` drift introduced by
  `eas update --branch preview` (a top-level `expo.runtimeVersion`
  that we had fixed in #683 and that the OTA command re-wrote
  locally).
- Deleted 4 local branches whose work is already on `main`:
  `feat/beer-encyclopedia-crud-api`, `docs/sync-post-552`,
  `docs/audit-chantier-1`, `feat/api-fly-deploy`, plus the stale
  `release-please--branches--main--components--website`.
- Dropped 6 ephemeral stashes tied to merged or deleted branches.
  Kept 11 stashes relevant to the active `docs/soutenance-27-mai`
  craft PR #578 and to the unmerged
  `fix/mobile-app-monorepo-expo-workflow` branch (which remains to
  be audited in a future session).

Working tree clean, 4 local branches remain (main,
`docs/soutenance-27-mai`, 2 unmerged to audit, and the
release-please group branch managed by the bot).

### Follow-up items identified

- **DB schema epic** — the matching algorithm decided in the
  brainstorm requires significant database work (beer enrichment
  schema in `beer-encyclopedia`, recipe rating + brew log in
  `packages/api`, cross-package API contracts, seed data for the 6
  demo beers + equivalent recipes). To be tracked as a GitHub epic
  blocking the Scan Tranche 2 backend chunk.
- **ADR-001** — draft *"Build for today, design for tomorrow"* as a
  project-wide convention during the Architecture session.
- **Jury request** — formal mention to the pre-defense coach asking
  whether the jury can bring empty bottles to test the Scan live.

### Release-please pipeline activation + first releases ([PR #667](https://github.com/benoit-bremaud/brasse-bouillon/pull/667), [#668](https://github.com/benoit-bremaud/brasse-bouillon/pull/668), [#669](https://github.com/benoit-bremaud/brasse-bouillon/pull/669), [#670](https://github.com/benoit-bremaud/brasse-bouillon/pull/670), [#671](https://github.com/benoit-bremaud/brasse-bouillon/pull/671), [#672](https://github.com/benoit-bremaud/brasse-bouillon/pull/672), [#675](https://github.com/benoit-bremaud/brasse-bouillon/pull/675), [#676](https://github.com/benoit-bremaud/brasse-bouillon/pull/676))

End-to-end activation of the release-please automation, with 4 packages
going through their first automated release cycle. Sequence of PRs:

- #667 — set up `release-please-config.json`, manifest, workflow, and
  the `refs/tags/v*` tag-protection ruleset.
- #668 — fix #623 Ingredients home counter + fix CI coverage reporter
  (`--coverageReporters=lcov,text` split into two flags).
- #669 — first release-please-generated PR: `encyclopedia-v0.2.1` cut.
- #670 — `website-v0.1.1` cut (manifest merge conflict resolved
  manually because release-please did not auto-rebase).
- #672 — auto-apply metadata workflow on release PRs + Prettier
  ignore for CHANGELOG/app.json (unblocks mobile-app CI on release
  PRs).
- #671 — app libs release PR merged; **release-please aborted** with
  "There are untagged, merged release PRs outstanding" because the
  default group PR title template (`chore${scope}: release ${component}`)
  omits `${version}`, so release-please could not parse the merged PR
  title. Tags `mobile-app-v0.1.1-alpha1` and `api-v0.1.1-alpha1` had
  to be created manually via `gh release create` at commit `3240639`,
  and PR #671 label flipped `autorelease: pending` →
  `autorelease: tagged`.
- #675 — add `workflow_dispatch` to release-please.yml so operators
  can retry manually via `gh workflow run "Release Please"` if the
  state machine gets stuck.
- #676 — fix the group PR title template
  (`chore${scope}: release app libraries ${version}`) so future
  app-group releases produce parseable titles and do not need manual
  tagging.

Also opened 2 tracking follow-ups from Copilot review:
- #673 — align `packages/beer-encyclopedia/package.json` version with
  `pyproject.toml` (drift every release).
- #674 — delete vestigial per-package `packages/*/package-lock.json`
  files (npm workspaces uses only the root lockfile; these are
  pre-monorepo leftovers).

Tags produced today (all immutable via `refs/tags/v*` ruleset):
`encyclopedia-v0.2.1`, `website-v0.1.1`, `mobile-app-v0.1.1-alpha1`,
`api-v0.1.1-alpha1`.

## 2026-04-22

### Root README refactor for dev onboarding ([PR #572](https://github.com/benoit-bremaud/brasse-bouillon/pull/572))

Rewrote the root `README.md` so it works as a clear entry point for a
new contributor. Structure reorganised around the journey (What is it →
Monorepo at a glance → Prerequisites → Quick Start → Running each
package → Scripts → Testing → CI → Docs → Team), drift between the
repo state and the README closed:

- Corrected the "70% coverage gate" wording — the CI only emits
  `::warning::` today, so it is documented as a target with a CI
  warning, not a blocking gate.
- Corrected the `discord-notifications.yml` description — it routes
  issue/PR lifecycle events by `scope:*` label, it does not post build
  events.
- Removed the `docs/ydays/` footnote (that directory only lives on the
  soutenance branch, not on `main`).
- Documentation table extended with 8 entries that existed in `docs/`
  but were not linked (CONVENTIONS, roadmap, DoD, DoR, sprint,
  scrum-roles, migrations-sequelize, meeting-types).
- Node range clarified (`>=20 <21`), Make sonar targets fully
  qualified, Quick Start mock-data path now includes a launch command.

Line count 389 → 361; all 21 internal links verified against the
filesystem. Review comments from Copilot + chatgpt-codex-connector
were all addressed inline (5 Must/Should fixes in commit `8db8a65`,
1 follow-up clarification in `b1255be`).

### SonarCloud CI analysis wired on every PR ([PR #573](https://github.com/benoit-bremaud/brasse-bouillon/pull/573))

Enabled server-side Quality Gate enforcement on every PR and every
push to `main`. Previously the repo had Sonar config (properties file
+ `tools/ci/sonar-scan.sh` + Makefile targets) but **zero** Sonar jobs
in GitHub Actions — analysis was local-only via a Dockerized SonarQube
Community Edition, so it only ran when a developer chose to.

What this PR changed:

- New [`.github/workflows/sonarcloud.yml`](.github/workflows/sonarcloud.yml)
  — installs `packages/mobile-app` + `packages/api`, runs each Jest
  suite with coverage, then invokes
  `SonarSource/sonarqube-scan-action@v6.0.0` (SHA-pinned). Checkout
  uses `fetch-depth: 0` so Sonar can compute blame annotations. Job
  skips on fork PRs (secrets aren't shared with forks) and triggers
  only on PRs targeting `main`.
- [`sonar-project.properties`](sonar-project.properties) — migrated
  from the local project key `brasse-bouillon` to the SonarCloud
  format `benoit-bremaud_brasse-bouillon`, added
  `sonar.organization=benoit-bremaud`, removed the hardcoded
  `sonar.host.url=http://localhost:9000`. Local Docker analysis via
  `make sonar-scan` still works — `tools/ci/sonar-scan.sh` already
  defaults `SONAR_HOST_URL` to localhost when unset.
- README CI/CD section updated to describe the new workflow.

Pragmatic choice: SonarCloud (managed) instead of SonarQube
self-hosted on Klouders. The Klouders provisioning was still pending
and the soutenance deadline was approaching — managed service was
~30 min of setup vs. a day's work for a hardened self-host. The
migration path to Klouders later is trivial (same scanner, override
URL and token in the workflow). Noted in a PR comment for
`@clemoune-tech`, `@Moooniie`, `@astronas`.

First Quality Gate run on this PR passed: 0 new issues, 0 security
hotspots, 0.0% coverage on new code (expected — the PR only touches
YAML/properties). SHA-pinning the three Actions addressed a
`githubactions:S7637` hotspot flagged by Sonar on the first scan.

Tech debt opened as follow-up issues:
- Pin all actions in `ci.yml` + `discord-notifications.yml` by SHA
  (same hotspot will fire there once Sonar scans those files).
- Reuse `ci.yml`'s uploaded `lcov.info` artifacts in
  `sonarcloud.yml` to avoid running Jest twice per PR.

---

## 2026-04-20

### Mobile-app: first installable APK via EAS (preview profile)

First standalone Android APK shipped to the user's phone — ends the
two-day Expo Go saga on YNOV / mobile-hotspot Wi-Fi. Credentials set up
on `@beniot/brasse-bouillon-mobile-app` (project id
`a527c490-36e1-49f2-a91b-5866a2823b5f`), EAS keystore auto-generated,
three APK iterations on 2026-04-19 → 2026-04-20:

1. **v1** — first APK, screens empty because `EXPO_PUBLIC_USE_DEMO_DATA`
   is in a gitignored `.env` and therefore not shipped to EAS.
2. **v2** — EAS env variable `EXPO_PUBLIC_USE_DEMO_DATA=true` registered
   on the `preview` environment + `expo-updates` installed and configured
   (`eas update:configure`). Demo mode works; OTA channel `preview`
   wired. Archive down to 4.9 MB after discovering the `.easignore`
   `tools/` bug.
3. **v3** — launcher icon set to `brasse-bouillon-logo-primary-512.png`
   (brasseur character) on yellow `#F5D547` adaptive-icon background.
   Validated on device.

Build workflow formalised in
[packages/mobile-app/docs/EAS_BUILD.md](packages/mobile-app/docs/EAS_BUILD.md):
direct `npx eas-cli build --profile preview --platform android` from
`packages/mobile-app/` (Option A, preferred), with an isolated-workspace
fallback for debugging `.easignore` rules (Option B). Both paths use
`NODE_OPTIONS='--dns-result-order=ipv4first'` to avoid IPv6-only DNS
flaps on `storage.googleapis.com`.
The extracted-workspace workaround existed during investigation because
EAS tars from the monorepo root (277 MB `.git`, 5.6 GB
`packages/beer-encyclopedia/`, etc.) and our initial `.easignore` had a
bare `tools/` pattern that silently excluded `src/features/tools/` and
broke the first build. That specific bare-pattern bug is what
[issue #555](https://github.com/benoit-bremaud/brasse-bouillon/issues/555)
tracks, and this PR closes it by anchoring every repo-root pattern to
`/pattern/`. With the anchored `.easignore` in place, the upload is now
~5-15 MB from the real monorepo and the `/tmp` extraction is only a
documented fallback.

Also folded into this PR:

- `packages/mobile-app/package.json` — realign three drift-ing deps to
  the SDK 54 expected set (`expo-camera@~17.0.10` down from the stray
  `^55.0.9`, `@react-native-async-storage/async-storage@2.2.0` down from
  `^3.0.1`, `@react-native-community/slider@5.0.1` down from `^5.1.2`)
  plus add `expo-updates@~29.0.16`. `expo doctor` was rejecting the
  build until this was done.
- `packages/mobile-app/.easignore` — new canonical version with every
  repo-root directory anchored to `/pattern/`, inline comment explaining
  the gotcha, pointer to #555.
- `packages/mobile-app/eas.json` — development / preview / production
  profiles, `appVersionSource: "remote"`, `cli.version >= 18.7.0`.
- Package renamed `brasse-bouillon-frontend` → `@brasse-bouillon/mobile-app`
  to align with the monorepo `@brasse-bouillon/*` naming.

Next step (tracked separately): connect the app to the live NestJS
backend (`packages/api`) once an endpoint host is stable — local
cloudflared first, deployed Railway/Fly host for the 2026-05-27
defense.

## 2026-04-19

### Soutenance prep: integrate official Ynov format + pivot web-studio

Ynov coach email 2026-04-19 confirmed the defense format — **30 minutes
pitch + 10 minutes Q&A = 40 minutes total**, room 0.301, Pitch
Entrepreneurial category, Moodle submission required after the oral.
Three evaluation grids attached to the email, to be archived under
`docs/ydays/references/` (new folder introduced this session to hold
school-side documents, separate from team-produced `outputs/` and
internal-journal `debrief/`).

Session deliverables on branch `docs/soutenance-27-mai`:

- [docs/ydays/outputs/plan-presentation-27-mai.md](docs/ydays/outputs/plan-presentation-27-mai.md)
  rebalanced to fill 30 minutes (blocs 1-6 = 4/6/8/5/6/1 min), header
  aligned to 30+10 format, revision entry appended.
- [docs/ydays/README.md](docs/ydays/README.md) gained a "Format
  officiel" section (format, room, mock oral 2026-05-06) and the new
  `references/` entry in the tree.
- [docs/ydays/outputs/risk-analysis.md](docs/ydays/outputs/risk-analysis.md)
  risk C3 updated (30 min scope), new risk L6 (Ynov changes the format
  on the day), mock oral 2026-05-06 added to the rehearsal calendar.
- [docs/ydays/debrief/2026-04-16_session-decisions.md](docs/ydays/debrief/2026-04-16_session-decisions.md)
  factual-gap table marks gap #1 resolved and gap #5 pivoted, adds
  gaps #11 (archive the three Ynov grids) and #12 (reserve the
  mock-oral slot on 2026-05-06).
- [docs/ydays/references/README.md](docs/ydays/references/README.md)
  new index describing the expected content of the references folder
  and usage rules (no modification of received documents).
- [docs/ydays/debrief/2026-04-19_session-decisions.md](docs/ydays/debrief/2026-04-19_session-decisions.md)
  records decisions D19-1…D19-5 (Ynov format, web-studio pivot,
  references folder, propagation, mock-oral scheduling).

Pivot on gap #5 (Marketing recruitment): dropped in favour of a
personal vision to open a web-studio agency to support Brasse-Bouillon
and future projects. Brainstorming session to come — assistant will
prepare structured questions after exploring the existing `web-studio`
repo.

## 2026-04-16

### Soutenance prep: persist Phase 0 + T1 into `docs/ydays/`

Consigned the full preparation material for the Ydays defense of
2026-05-27 under `docs/ydays/` on branch `docs/soutenance-27-mai`.
Deliverables:

- [docs/ydays/README.md](docs/ydays/README.md) — operational index for
  the defense folder, frozen decisions summary, grading-grid mapping
  (#522-#528).
- [docs/ydays/outputs/audit-features-mvp.md](docs/ydays/outputs/audit-features-mvp.md)
  — factual audit of the 11 MVP features (8 stable, 2 partial,
  1 R&D) produced by an Explore agent; 5-minute recommended demo
  path (Auth → Recipes read-only → Barcode scanner → ABV calculator
  → Batch timeline); pre-production checklist J-7/J-3/J-1.
- [docs/ydays/outputs/smart-objectives-par-pole.md](docs/ydays/outputs/smart-objectives-par-pole.md)
  — 36 SMART objectives (6 retrospective + 6 prospective × 3 pôles
  Dev/Création/Marketing), each sourced to a traceable repo file;
  six unverifiable claims flagged `[trou factuel]` for user
  validation before J-7.
- [docs/ydays/outputs/plan-presentation-27-mai.md](docs/ydays/outputs/plan-presentation-27-mai.md)
  — 30-minute presentation plan structured around decision A0
  (hybrid user-journey + 1-2 min expert interventions per bloc) and
  decision A1 (barcode scanner as live demo USP, beer-label-ai kept
  as R&D slide only); six blocs with timings, narrative voice, cited
  SMART and targeted grading-grid criterion.
- [docs/ydays/debrief/2026-04-15_session-decisions.md](docs/ydays/debrief/2026-04-15_session-decisions.md)
  — partially reconstituted debrief (original session content was
  not persisted; D1-D4 and R1-R6 reconstituted from what is frozen
  today).
- [docs/ydays/debrief/2026-04-16_session-decisions.md](docs/ydays/debrief/2026-04-16_session-decisions.md)
  — records A0/A1 decisions, the repo-sourced SMART derivation
  method, the operational persistence rule, ten tabulated factual
  gaps with impact/priority, and the ordered remaining tasks
  (T2 BMC → T3 hook → T4 personas check → T6 demo script
  → T12 rehearsals → T14 Moodle submission).

Operational rule established in the session: **persist every piece
of rich session material to disk at the time it's produced** — drafts,
decisions, analyses, SMART, canvases, scripts. No more long-term
storage in conversation memory alone. Target folder: `docs/ydays/`.
Commit cadence: one commit per deliverable on the dedicated branch.

## 2026-04-13

### API refactor: router-based architecture with FastAPI lifespan (#545)

Step 4 of the beer-encyclopedia epic (#541). Restructured the FastAPI app
from inline endpoints into a router-based architecture without changing
any externally-visible behavior.

Layout (`packages/beer-encyclopedia/api/`):

- `main.py` — app factory + minimal lifespan that disposes the engine on
  shutdown (engine itself is lazy-init via `get_db()` for fast cold starts
  and easy test injection)
- `dependencies.py` — re-exports `get_db` so route handlers stay decoupled
  from `db.engine` directly
- `routers/scan.py` — hosts `/health` and `/scan` (moved verbatim from
  the original `api/main.py`)
- `schemas/scan.py` — re-exports `ScanResponse` & friends from
  `ml/schemas.py`; the indirection is in place so a future API/ML schema
  divergence touches only this module

Backward compatibility preserved: `/health` and `/scan` keep the same
paths, parameters, status codes, and response model. `uvicorn api.main:app`
remains the entrypoint.

5 new tests in `tests/test_api/test_scan.py` covering the HTTP contract
(health 200, missing file 422, non-image 400, missing content-type 400,
routes mounted at root). Total: 39/39 passing, ruff clean.

## 2026-04-12

### Data models: 10-table encyclopedia schema + pg_trgm search + style seed (#544)

Step 3 of the beer-encyclopedia epic (#541). Designed and implemented the full
encyclopedia data model on top of the PostgreSQL infrastructure added in #543.

**10 ORM models** (`db/models/`): `Style`, `Brewery`, `Beer`, `Ingredient` +
`BeerIngredient` junction, `TastingProfile` (1-to-1 with Beer), `Media`
(polymorphic on beer_id/brewery_id), `Source` + `EntitySource` for
provenance tracking with JSONB raw_data (JSON fallback on SQLite),
`CommunityCorrection` for moderation queue.

**Hand-written initial migration** (`migrations/versions/001_initial_schema.py`):
all 10 tables with FK cascades (`ON DELETE CASCADE` for dependent rows,
`ON DELETE SET NULL` for `beers.brewery_id`/`style_id` so historical records
survive), CHECK constraints (ABV ranges on styles, 1–5 scales on tasting
profiles, media parent required), B-tree indexes on common filter paths
(city/country/brewery_type/FKs/abv/moderation-queue), and PostgreSQL-only
steps guarded by `_is_postgres()`: `CREATE EXTENSION pg_trgm` + GIN
trigram indexes on `breweries.name` and `beers.name` for fuzzy search.

**Style seeder** (`scripts/seed_styles.py`): idempotent upsert of 15 styles
(the 8 slugs recognized by `ml/extract.py` + 7 mainstream additions:
porter, pilsner, hefeweizen, dubbel, quadrupel, barleywine, blonde ale).

**14 new tests** covering relationships, cascades, unique constraints,
check constraints, and seeder idempotence. Total: 30/30 passing on SQLite
in-memory. Ruff clean. Migration upgrade + downgrade validated on SQLite.

### Infrastructure: PostgreSQL + async SQLAlchemy + Alembic + Docker Compose (#543)

Step 2 of the beer-encyclopedia epic (#541). Added the persistence infrastructure the upcoming data models will rely on: async SQLAlchemy 2.0 engine + session factory (`db/engine.py`), ORM `Base` with `UUIDMixin` and `TimestampMixin` (`db/models/base.py`), async-aware Alembic scaffolding (`alembic.ini`, `migrations/env.py`, `migrations/script.py.mako`), and local Docker Compose stack with PostgreSQL 16 + pgAdmin (`docker-compose.yml`, `.env.example`).

Switched dependency management to `pyproject.toml` as the single source of truth with `[ml]` and `[dev]` optional groups; deleted the legacy `ml/requirements.txt` and updated the CI step to `pip install -e ".[ml,dev]"`. Added 6 behavior tests for the engine/session/get_db dependency (total: 16 tests passing, ruff clean).

### Epic: transform beer-label-ai into beer-encyclopedia

Kicked off a major initiative to evolve `packages/beer-label-ai` into `packages/beer-encyclopedia` — a comprehensive beer encyclopedia aiming to catalog all beers in the world. The existing ML scan pipeline becomes a sub-module feeding the encyclopedia; new capabilities include PostgreSQL persistence, multi-source data ingestion (Open Brewery DB first), community corrections, CRUD + fuzzy search API, and multi-channel consumption (mobile app + future web UI).

Created epic #541 and 6 sub-issues tracking the 6-step incremental plan: #542 rename, #543 DB infrastructure (PostgreSQL + SQLAlchemy + Alembic + Docker), #544 data models (10 tables with pg_trgm search + provenance tracking), #545 API router refactor, #546 CRUD + search endpoints, #547 Open Brewery DB importer. All issues added to the Brasse-Bouillon GitHub project. New `scope:beer-encyclopedia` label created.

### Refactor: rename beer-label-ai → beer-encyclopedia

Opened PR #548 (closes #542) — purely mechanical rename via `git mv` preserving git history. Updated 11 cross-repo references: root `package.json` workspace entry, `CLAUDE.md` (structure + per-package links), `.github/workflows/ci.yml` (job name + path filter + artifact name), `.github/copilot-instructions.md`, `sonar-project.properties`, plus package-level `package.json` (bumped to v0.2.0, name `@brasse-bouillon/beer-encyclopedia`), `CLAUDE.md`, and `ruff.toml`. `package-lock.json` regenerated. Existing tests (10/10) pass.

---

## 2026-04-01

### Backlog: create soutenance sub-issues mapped to evaluation grid

Created 7 sub-issues under #393 (soutenance deliverables), each mapped to a criterion of the Pitch Entrepreneurial evaluation grid: #522 (elevator pitch, 15pts), #523 (SMART objectives, 15pts), #524 (business model + innovation, 30pts), #525 (live demo, 30pts), #526 (perspective: legal/HR/go-to-market/budget, 20pts), #527 (slide deck, 15pts), #528 (rehearsal, 15pts). All assigned to Sprint 6.

### Backlog: restructure design issues and plan Sprint 4-6

Closed 17 obsolete CG design issues (#231-#262). Created 7 new design issues with clear scope, dependencies, and assignees: #515 (audit charter — Liam+Fabio), #516 (audit UI components — Liam+Fabio), #517 (audit assets — Liam+Fabio), #518 (audit wireframes + create missing screens — Sara+Thaïs), #519 (UI Kit Figma — Sprint 5), #520 (high-fidelity mockups 11 screens — Sprint 5), #521 (security audit — Fabien). Dependency chain established: #515 → #516/#517/#518 → #519 → #520 → dev mobile.

### Backlog: plan Sprint 5 and Sprint 6

Sprint 5 (Apr 15 – May 5): labelled 13 issues — 8 MUST-HAVE recipe CRUD user stories (#410-#417, #420), batch creation (#433), DevOps (#337, #338, #396), design delivery (#519, #520). Sprint 6 (May 6-27): batch measurements (#434), soutenance deliverables (#393 + 7 sub-issues), oral intermédiaire update (#392).

### Decision: SonarQube deployment on Klouders VM

Decided to deploy SonarQube on Klouders VM instead of local or SonarCloud. Invited Thibaut GIANOLA (@astronas, Klouders admin) as collaborator. Updated #396 with decision rationale and implementation plan.

### Infrastructure: restructure Discord server

Created #annonces channel (read-only). Merged 5 SCRUM channels into #daily-standup + #ceremonies. Archived #merch, #intervention, #autre-appli-de-brassage. #github channel archived — fallback notifications temporarily routed to #général. Configured BB Bot webhook on #ceremonies.

### Backlog: close resolved issues and audit milestones

Closed 10 issues already resolved but left open: #318 (Node 20 compat), #319 (issue triage), #320 (root package.json), #321 (.gitignore), #327 (frontend subtree import), #328 (backend subtree import), #330 (Scrum framework), #333 (meeting notes template), #359 (archive repos), #497 (team mapping). Closed #383 (performance baseline — too late, migration done). Established team member mapping with GitHub + Discord username cross-reference.

### Docs: create PROJECT_LOG.md and Copilot review instructions (PR #514)

Created `PROJECT_LOG.md` operational logbook with backfilled history from PRs #395–#503. Added `.github/copilot-instructions.md` with project-specific review rules (no `any`, named exports, Python type hints, security checks). Referenced project log in root CLAUDE.md. Closes #513.

### Infrastructure: enable Copilot automated code review

Activated Copilot code review ruleset on the default branch with automated reviews on push. Closed #339 as resolved.

### Backlog: consolidate CI issues and assign team members

Consolidated SonarQube issues (#357, #358 into #396). Updated issue bodies for #337, #338, #396 to reflect package renames. Reassigned all CI issues to appropriate team members based on scope labels. Closed #339 (resolved), #357, #358 (duplicates). Updated #338 scope from GitHub Pages deployment to removal (migrated to Klouders VM).

### Backlog: create i18n translation issues for all French documentation

Created 9 issues (#504–#512) to systematically translate all remaining French content to English across the repository: sequence diagrams, vision, personas, requirements, user scenarios, design docs, project management, meeting notes, and mobile app UI strings. All assigned to milestone "Documentation Refactoring" except #512 (DX & Cleanup).

## 2026-03-31

### CI/CD: add coverage gates, ruff lint, and security audit (PR #503)

Added 70% coverage warning gate to mobile-app and api CI jobs. Added full beer-label-ai CI job with ruff linting, compile sanity check, pytest with lcov coverage report, and coverage artifact upload. Added npm audit security check job. Applied ruff auto-fixes (pyupgrade) to all beer-label-ai Python files. Closes #496.

## 2026-03-30

### Refactor: rename packages to match Discord channels (PR #502)

Renamed `packages/frontend` → `packages/mobile-app` and `packages/backend` → `packages/api`. Updated all references across CI, SonarQube config, root scripts, CLAUDE.md, CONTRIBUTING.md, and package.json workspaces. Closes #501.

### Fix: reduce Discord notification spam (PR #500)

Reduced Discord notification triggers from ~10 per action to max 3 per PR lifecycle. Removed `review_requested`, `labeled`, and comment events. Kept only `issues:opened`, `pull_request:opened`, and `pull_request:closed` (merged only). Closes #498.

### Infrastructure: import beer-label-ai into monorepo (PR #495)

Imported beer-label-ai standalone repo via `git subtree add` into `packages/beer-label-ai`. Added to npm workspaces. Created CLAUDE.md for the package. Cleaned up `_archive/` (removed 20MB act binary). All 4 standalone repos now archived on GitHub with deprecation notices.

### Fix: sync website package with standalone repo (PR #494)

Fixed `packages/website/` to match standalone repo HEAD. Fixed SyntaxError in `weekly_digest.py` (line 610: `]` → `)`). Closes #491.

### Docs: add sprint templates and design audit (PR #493)

Added sprint definition, velocity tracking templates, and design audit documentation for Scrum workflow.

## 2026-03-27

### Docs: rewrite CONVENTIONS.md for monorepo (PR #492)

Rewrote project conventions to reflect the monorepo structure. Covers naming, branching, commit messages, PR workflow, and code quality standards.

## 2026-03-26

### Infrastructure: add Discord notifications and issue templates (PR #490)

Created GitHub-to-Discord notification workflow. Added issue templates adapted for monorepo package structure.

### Infrastructure: update GitHub issue templates (PR #477)

Updated issue templates (bug report, feature request, task) to work with the monorepo multi-package structure.

## 2026-03-25

### Docs: create unified Product Backlog (PR #476)

Created single Product Backlog document with 63 User Stories organized by epic, with personas and priority classification.

### Docs: create root CLAUDE.md and rewrite README/CONTRIBUTING (PRs #401, #402)

Established cross-cutting development conventions for the monorepo in CLAUDE.md. Rewrote README.md and CONTRIBUTING.md for the new monorepo structure.

### CI/CD: create unified CI workflow (PR #398)

Created path-filtered GitHub Actions CI pipeline. Each package only runs its checks when its files change. Mobile-app: lint + typecheck + format + tests. API: lint + build + tests. Website: Python quality gate. Beer-label-ai: compile + tests.

### Infrastructure: add SonarQube configuration (PR #397)

Added `sonar-project.properties` and Makefile target for local SonarQube analysis. Configured sources, tests, coverage paths, and exclusions for TypeScript packages.

### Fix: validate packages and fix lint errors (PR #399)

Fixed ESLint and TypeScript errors across packages to ensure CI passes on the newly consolidated monorepo.

## 2026-03-24

### Infrastructure: bootstrap monorepo (PR #395)

Consolidated 4 standalone repos into one monorepo using `git subtree`. Set up npm workspaces. Imported: brasse-bouillon-frontend, brasse-bouillon-backend, brasse-bouillon-website. Established root `package.json` with workspace scripts.

### Decision: monorepo consolidation strategy

Decided to consolidate all 5 standalone repos (frontend, backend, website, beer-label-ai, main) into a single monorepo using `git subtree` (preserving history). Motivation: reduce dual maintenance risk, simplify CI, unify conventions.

## 2026-02-11

### Feature: add JWT tests for backend (PR #316)

Added automated tests for JWT authentication on protected API routes.

## 2025-07-18

### Feature: add wireframe PNGs for MVP screens (PR #315)

Added low-fidelity wireframe images for all MVP screens to support UI development.

## 2025-07-02 – 2025-07-11

### Docs: complete design charter (PRs #301–#313)

Series of PRs completing the visual design system: logo assets, typography (Inter), color system with accessibility audit, UI component styles (tooltips, buttons, inputs, alerts), grid/spacing/radii system, form input documentation, moodboard, and screen identification for wireframes.
