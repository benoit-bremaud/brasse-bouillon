# Project Log — Brasse-Bouillon

Reverse-chronological record of all project activity (most recent entries first).
This is the operational logbook, not the release changelog (see [docs/changelog.md](docs/changelog.md)).

---

## 2026-04-30

### Ydays: business strategy deep-dive bundle pushed to PR #578

Branche `docs/soutenance-27-mai` — 6 commits ajoutés (`69ff2a9` → `f43a37d`)
qui complètent le bloc 5 (BM + Perspectives) du plan de soutenance avec
des analyses chiffrées, sourcées et slide-ready.

7 nouveaux fichiers dans `docs/ydays/outputs/` (~1 700 lignes) :

- `competitive-deep-dive.md` — audit 7 concurrents (UX, reviews, SWOT,
  matrices de positionnement, données financières, tendances marché FR
  2024-2030). 5 trouvailles critiques + 3 axes différenciants.
- `personas-monetization.md` — 5 personas avec WTP, LTV, retention.
  Marc-Switcher identifié comme cible prioritaire (LTV 384 € + effet
  evangelist ×5-10).
- `funnel-projection.md` — modélisation 50K téléchargements → 1 000
  payants sur 3 ans. Mix 75 % Premium / 25 % Pro. ARPU blendé 4,75 €/mo.
  3 scénarios alternatifs.
- `pricing-tiers-definition.md` — Free / Premium 2,99 €/mo / Pro 5,99 €/mo.
  4 leviers stratégiques (trial 30j, lifetime 99 € × 100, migration -50 %,
  discount annuel 30 %).
- `retention-levers.md` — 10 leviers analysés, top 5 retenus (onboarding,
  lock-in données, cycle brassage, communauté FR, IA personnalisation).
- `ai-strategy.md` — Mistral AI provider principal (FR souverain), Anthropic
  Claude backup. Use cases par persona, économie unitaire (Pro reste
  rentable), roadmap intégration Phase 4-6.
- `financial-projections.md` — OPEX 3,5K € → 36K €/an sur 5 ans. CAPEX
  faible (~1-2,5K €). Net mensuel 1 700 € Y1 → 3 400 € Y3 (cible « vivre
  de l'app ») → 6 000 € Y5. Break-even mois 5-6. KPIs structurés en 4
  catégories.

Fichiers mis à jour :

- `docs/ydays/.vitepress/config.mjs` — nouvelle section sidebar « Stratégie
  business approfondie »
- `docs/ydays/changelog.md` — entrée `2026.04.30-1`
- `docs/ydays/outputs/business-model-canvas.md` — bloc 5 Revenus mis à jour
  (remplace l'hypothèse « prix exact à caler » par les paliers documentés)

**Décisions** :

- `Persona produit principal` — Nicolas N1 (premier kit, 1-2 brassins, tech-savvy)
  retenu comme persona produit principal. Marc-Switcher reste persona à
  plus haut ROI (acquisition prioritaire via import BeerXML + migration
  discount).
- `Pricing 3 paliers` — Free (5 recettes / 3 sessions / scan illimité),
  Premium 2,99 €/mo (Nicolas/Zoé/Claire débutante), Pro 5,99 €/mo (Marc/
  Claire confirmée). Discount annuel -30 % sur les deux paliers payants.
- `Provider AI` — Mistral AI retenu comme provider principal pour
  cohérence souveraineté EU + qualité FR native. Anthropic Claude conservé
  en backup pour cas complexes.
- `Provider hosting` — Scaleway en référence (FR souverain), décision
  finale différée à l'implémentation.
- `Cible revenu` — 3 400 €/mois net Année 3 dans le scénario médian
  validée comme cohérente avec l'objectif « vivre de l'app » sur 3-5 ans.
  Modèle robuste à -20 % (~2 100 €/mois net = survie OK avec freelance
  agence web d'appoint).

PR #578 reste en draft (soutenance 27 mai). Pas de merge prévu avant le
2026-05-06 (oral blanc).

## 2026-04-23

### Mobile-app: v0 screenshot audit frozen (204 files across 13 features)

Full visual audit of the mobile app captured and organised under
[docs/ydays/public/screenshots/v0/](docs/ydays/public/screenshots/v0/).
Two goals served:

1. **Short-term**: feed the Canva deck for the 2026-05-27 soutenance,
   notably slide S8 "UX Avant brassage".
2. **Long-term**: architectural inventory that drives the refactor
   backlog. The parallel plan file
   `~/.claude/plans/si-tu-te-souviens-sorted-lark.md` (outside repo)
   holds 69 backlog items (B-01 → B-69) and 9 dedicated brainstorms
   (Mes Brassins, Equipment, Ingredients, Labels, Scan, Compte &
   Paramètres, Shop, Calculateurs, Dashboard).

**Source**: 14 sequential capture batches exported from the user's
Android phone between 18:53 and 21:47 local time, using the `Connexion
démo` path (Marie / demo data). The backend is not wired to the
frontend (B-13 bis), so real login / signup / password reset all fail
with "Network request failed".

**Output**: 204 JPEGs kept out of 239 source files (35 duplicates /
re-captures skipped), organised into 13 top-level feature folders:

```
01-auth/       7 files   Login + signup + forgot password
02-dashboard/  4 files   Accueil + Voir plus sheet
03-batches/    8 files   Mes Brassins list + batch detail (b-demo-1/2/3)
04-recipes/    24 files  My Recipes + Session IPA Citra full tour + Witbier alt
05-shop/       7 files   Ma Boutique home + 6 categories
06-tools/      44 files  Calculators list + 8 calculator details
07-academy/    40 files  Académie list + 11 articles (1 stub + 10 full)
08-equipment/  1 file    L'Office (read-only stub)
09-ingredients/ 18 files Catalogue Malterie / Houblonnière / Fermentoir
10-labels/     24 files  Atelier d'étiquettes (home + selection + editor + detail)
11-scan/       21 files  Scanner — barcode + bottle + pending + consent  (DEMO PRIORITY ⭐)
12-account/    5 files   Profil (read-only)
13-explore-hub/ 1 file   Explore hub (candidate for removal — B-65)
```

See
[docs/ydays/public/screenshots/v0/README.md](docs/ydays/public/screenshots/v0/README.md)
for the full manifest (capture metadata, sub-folder layout, 12 key
findings at a glance, source-batch mapping, versioning & freeze
rules).

**Top findings flagged for action**:

- B-39 Scan recognition / match / community / import pipeline missing
  — **demo blocker** (the wow-effect for the jury is precisely what's
  not built yet)
- B-13 bis Auth backend not wired
- B-08 Mes Brassins detail rewrite (core feature, currently only a
  3-step hardcoded timeline)
- B-28 / B-29 Labels UI bugs (validation CTA and live preview clipped
  by tab bar)
- B-66 Mobile app has no semver / git tag / CHANGELOG — to baseline as
  `v0.1.0-alpha.1` before the soutenance
- B-69 "Période d'analyse" doesn't belong on the home (belongs in a
  dedicated Statistiques section)

**Freeze rule**: `v0/` is immutable. Future capture sessions land under
`v1/`, `v2/`, etc. Optional git tag `screenshots-v0` after this lands
on main (B-68).

Next steps queued: (T5) mobile-app versioning baseline, (T6) triage the
69 backlog items into GitHub Issues on the Brasse-Bouillon project,
(T7) user-profiles Q&A session in a separate plan file, (T8) refactor
plan consuming the 9 brainstorms.

---

## 2026-04-22

### Ydays: defense review site published to Cloudflare Pages

The `docs/ydays/` VitePress site is now live at
<https://brasse-bouillon-ydays.pages.dev> so the 8 project members can
read the defense craft ahead of the 2026-05-06 dress-run coaching slot
and leave feedback on Discord before slides/scripts get polished further.

Deployment method : **Wrangler Direct Upload** (CLI). The plan originally
targeted Cloudflare's dashboard Git-integration, but the unified
"Workers & Pages" UI now defaults new projects to the Workers flow
(`wrangler deploy`, no "Build output directory" field), which is wrong
for a static VitePress site. Pivoted to CLI from the local machine:
`npx wrangler pages project create brasse-bouillon-ydays
--production-branch=docs-soutenance-27-mai` then
`npx wrangler pages deploy .vitepress/dist
--project-name=brasse-bouillon-ydays --branch=docs-soutenance-27-mai`.
Cloudflare never sees the monorepo — only the 140 built files get
uploaded. `_headers` carries `X-Robots-Tag: noindex`, meta robots
`noindex, nofollow` is present in the rendered HTML, and all 6 key
pages return HTTP 200 (`/`, `/read-first`, `/feedback-guide`,
`/outputs/plan-presentation-27-mai`, `/outputs/pitch-anticipated-qa`,
`/outputs/soutenance-27-mai-status-checklist`).

Iteration cycle until the defense: re-run `npm run docs:build &&
wrangler pages deploy .vitepress/dist …` from `docs/ydays/` after each
content commit. Out of scope for this session but queued: a GitHub
Action that auto-deploys on push to `docs/soutenance-27-mai` once the
cadence justifies the `CLOUDFLARE_API_TOKEN` secret setup. Custom
domain and access protection explicitly deferred — the noindex + link-
only distribution is enough for this review stage.

Docs updated to reflect the new reality:
[docs/ydays/outputs/cloudflare-pages-deployment.md](docs/ydays/outputs/cloudflare-pages-deployment.md)
rewritten with exact CLI commands, why the dashboard path was
abandoned, and the production/deployment URL distinction ;
[docs/ydays/README.md](docs/ydays/README.md) surfaces the live URL at
the top of its "Site VitePress" section so team members can find it
without digging.

No PR — doc-only work continues directly on the
`docs/soutenance-27-mai` branch, same pattern as the recent Ydays doc
commits.

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
