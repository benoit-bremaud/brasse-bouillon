# Project Log — Brasse-Bouillon

Reverse-chronological record of all project activity (most recent entries first).
This is the operational logbook, not the release changelog (see [docs/changelog.md](docs/changelog.md)).

---

## 2026-05-18

### PR #1004 merged (`f398fa3`) — docs(ydays): add livrables-equipe coordination folder for 27 May soutenance

- Branch `docs/ydays-livrables-equipe`, 2 commits (`a0b6c10`, `7d75bd1`). Adds `docs/ydays/livrables-equipe/` with 4 atomic-deliverable subfolders (A1 screenshots app, A2 screenshots GitHub+Discord, A3 RGPD bullets, A4 charte) + `STATUS.md` tracking grid (6 team atoms A1–A6, 7 Benoît tasks B1–B7, 3 critical decisions C1–C3). Spoonfed coordination: Benoît absorbs 90 % of the deck production, each team member contributes one ≤30 min atomic input. FR-language content (soutenance demo script exception per memory rule).
- Round-1 review fix in `7d75bd1`: 7 inline comments addressed (5 Copilot + 2 Codex). (1) STATUS A5/A6 deadline `sam 24 mai` → `dim 24 mai` (Codex P1 calendar correction). (2) STATUS B2 deadline `sam 22 mai` → `ven 22 mai` (Codex P1 calendar correction). (3) README dead local-path bullet `~/.claude/plans/...` removed (Copilot P1). (4) README "6 atomes" wording reworded to clarify 4 file deliverables + 2 Discord-only confirmations (Copilot P2). (5) A3 README format restricted to Markdown only (was "markdown ou Word", Copilot P2). (6) A4 README logo split into `logo-bb.png` (required) + `logo-bb.svg` (optional source) + `logo-bb-dark.png` (optional variant) (Copilot P2). (7) STATUS single-editor convention documented (Benoît centralises updates) to prevent Git merge conflicts on parallel edits (Copilot P3).

---

## 2026-05-08

### PR #981 merged (`d9511c9`) — docs(specs): scan feature development roadmap

- Branch `docs/scan-roadmap`, 2 commits (`494d304`, `2e88330`). Companion to `scan-consolidation.md`. Sequences the scan backlog into 6 phases (0 quick wins → 1 data foundations → 2 enrichment pipeline → 3 mobile capture → 4 OCR + AI vision → 5 polish + community → 6 post-MVP) with explicit dependencies, sub-issue mappings, effort estimates, and exit criteria per phase. Adds the soutenance strategy (Plan A live demo / Plan B degraded / Plan C demo override), end-to-end verification gates, and a risk register.
- Round-1 review fix in `2e88330`: 6 inline comments addressed (1 Codex P2 + 5 Copilot Should Have). (1) §12 Phase 1 SSE gate aggressive vs scope (Codex + Copilot duplicates) — gate aligned with Phase 1's actual deliverables (`upload.received` + `stitching.completed`), other 5 events come online with later phases. (2) §2 vs §12 rehearsal count mismatch — both now read "minimum 2 full rehearsals" matching #642 AC. (3) §8 fixture count contradiction — now "the 6 fixture panoramas, at least 5 of 6 times". (4) French agreement Plan A "Live demo idéal" → "idéale". (5) French agreement Plan B "Demo dégradé" → "dégradée".

### Algorithm redefinition session (decisions D1–D7)

User-journey-first revisit of the panoramic capture algorithm before sending an agent to implement `scan-algorithms.md`. Persona retained: **Léa la curieuse au bar** (single optimisation target — phone in one hand, bottle in the other, 30 s attention, bar context distraction). The 7 decisions below are recorded here and applied to `scan-algorithms.md` in a follow-up PR.

- `D1 — Point d'entrée` — **Barcode-first** + auto-switch silencieux on lookup miss. Status quo, aligned with `scan-consolidation.md` §2 canonical decree.
- `D2 — Pre-capture indicators` — **Soft-gate visuel only**. Distance + blur indicators stay visible to coach, but the **Commencer** CTA is always enabled. Léa taps when she wants. Frame-quality filtering (Laplacian variance + central-region hash) runs at burst-capture time and rejects unusable frames silently. Rationale: the target persona has no patience for a 1-second alignment gate.
- `D3 — Rotation metaphor` — **Permissive**. The coaching string says *"tourne doucement"* without specifying whether to turn the bottle or the phone. The gyro-derived progress gauge measures the angular delta either way.
- `D4 — Live OCR during capture` — **Drop**. `tesseract.js` removed from the burst flow. The gyro gauge filling 0° → 360° plus the adaptive coaching strings are sufficient feedback that capture is working. Removes a real risk of freezing the JS thread on Android mid-range. Preserved as a debug-mode flag for field testing only.
- `D5 — Pre-upload preview` — **None in the MVP**. Capture transitions directly from *"Capture terminée ✅"* to the analysis screen. Quality gate is server-side: if `cv2.Stitcher_create` returns an error, the response surfaces *"On n'a pas pu reconstituer l'étiquette"* with a retry CTA. To be revisited only if OCR success rate is poor post-launch.
- `D6 — "Continuer ailleurs" button` — **Mandatory MVP**, surfaces at T+10 s of analysis screen. Upgrade from "optional" in the original spec. Driven by the persona constraint (Léa abandons after ~15 s of perceived blocking wait). Couples with #939 in-app notifications — the suggestion arrives via the bell when ready.
- `D7 — Offline upload queue` — **Yes in the MVP** via `AsyncStorage`. New Phase 2.5 in the spec: if the network is unavailable when the burst completes, frames are persisted locally (3 captures FIFO, 7-day TTL) and retried on next app launch or network state change. Bar-context connectivity flakiness justifies the ~1-day effort. Implementation lands with #946 unless scope splits out.

All seven decisions follow the contextualised recommendation made by the planning agent. They are non-reopenable without revising this log entry.

### PR #979 merged (`f41ac26`) — docs(specs): scan feature consolidation snapshot

- Branch `docs/scan-consolidation`, 4 commits (`324cc12`, `87c90c3`, `4e406b7`, `5caea4c`). Companion to [scan-algorithms.md](docs/architecture/specs/scan-algorithms.md). Single visible artefact mapping the scan feature backlog: 4 active epics ([#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) panoramic, [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) enrichment, [#803](https://github.com/benoit-bremaud/brasse-bouillon/issues/803) community, [#878](https://github.com/benoit-bremaud/brasse-bouillon/issues/878) freemium), 17 sub-issues sequenced under #751 / #934, the canonical decree (auto-switch when barcode lookup misses), the structuring constraints (ADR-0005 backend split + Expo Managed pure + persistence imperative + craft-beer audience), target architecture, critical files, and the open decisions blocking dev-plan finalisation.
- Backlog triage performed in the same session and recorded under §4.5 of the new doc: closed #858 (superseded by #945–#947), closed #639 (ACs absorbed into #945), commented #803 (alignment with the spec), commented #945 (ACs from #639 added).
- **Decisions** captured during the session and recorded on the relevant issues:
  - `Stitching backend tech` — in-process Python (`cv2.Stitcher_PANORAMA`). `opencv-python` is already a transitive dep of YOLO + EasyOCR in beer-encyclopedia, no new infrastructure. Sub-process and Node FFI rejected. Recorded on #948.
  - `Streaming SSE Phase 4.5` — implement alongside #948, do not defer. Driven by the craft-beer audience constraint: panoramic is the primary recognition path, not a fallback. A 15-second blank spinner is unacceptable UX for the target user. Recorded on #948.
  - `Craft-beer audience as structuring constraint` — added to §3 of the consolidation document. Mainstream beers resolve via OFF barcode in ~200 ms; craft / micro-brewery beers are almost never indexed in OFF, so the auto-switch to panoramic capture fires *as the nominal flow*, not as a fallback. Drives priority for capture quality (#945–#947) and the enrichment pipeline (#934).
- Round-1 review fix in `5caea4c`: 2 Copilot Should-Have comments addressed. (1) §1 self-contradicting "agent-agnostic" claim by naming specific tools — replaced with `any contributor (human or automated)`, also enforces the project's no-AI-attribution policy. (2) §5 target architecture diagram showed two owners of `scan_catalog_items` — diagram now Python single-owner; new §5.1 covers the transitional state until #980 closes with a cutover-not-sync rule.

### Operational

- Filed [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) — `tech(scan): ADR-0005 reconciliation — migrate #934 data model + endpoints to Python beer-encyclopedia`. Tracking issue promised in `scan-algorithms.md` §8 line 286. Carries the migration matrix for #934 sub-issues #935 → #942 (which migrate to Python, which stay NestJS, which split). Comment posted on #934 referencing it.
- Project board linkage: 9 sub-issues #944 → #952 added to the Brasse-Bouillon GitHub project (`PVT_kwHOB8rwIc4AuVew`). The bulk-add that was harness-blocked on 2026-05-07 succeeded today.

---

## 2026-05-07

### PR #958 merged (`093b2f8`) — feat(api): track scan count per catalog item

- Closes [#929](https://github.com/benoit-bremaud/brasse-bouillon/issues/929). Two new columns on `scan_catalog_items`: `scan_count` (`integer NOT NULL DEFAULT 0`) and `last_scanned_at` (`datetime`, nullable). Migration [`1794000000000-AddScanCountToCatalogItems`](packages/api/src/database/migrations/1794000000000-AddScanCountToCatalogItems.ts). Counter is bumped atomically (`UPDATE … SET scan_count = scan_count + 1`) on every successful path of `ScanService.lookupByBarcode` (cache hit fresh + 3× cache hit stale + cache miss fetched), routed through a new `respondWithLookup` helper that centralises the increment.
- Round-1 review fix in `0e20698` + `7a95f0c`: Codex P1 + 1 Copilot comment flagged that the unconditional `await incrementScanCount` turned a metric-write failure into a 500 on the user-facing lookup. Wrapped the increment in a `try/catch` inside `respondWithLookup`, logged the failure through a new NestJS `Logger` (same pattern as `OpenFoodFactsClient`), and swallowed the error — counter is now best-effort. `incrementScanCount` itself stays raw so future audit/transactional callers can opt back into propagation. 1 Copilot Should-Have on the test helper resolved by defaulting `scan_count: 0` and `last_scanned_at: null` in `createCatalogItem`. New regression test asserts that a `SQLITE_BUSY` rejection on the `UPDATE` keeps a successful `cache_hit_fresh` lookup alive.
- **Decisions**:
  - `Counter is per-SKU, regrouping deferred` — Punk IPA in 33cl / 50cl / 75cl keeps separate counters today. Promoting to a `beer_identities` table (commercial-identity entity grouping multiple barcodes under the same recipe) is deferred until the day we build the stats screen — rationale documented inline in the entity column comments and the migration header. Trade-off chosen against (a) introducing the table now (more correct, more migration churn) and (b) using a `recipe_group_key` text column (worst of both worlds).
  - `Best-effort metric over hard dependency` — counter writes never fail a user-facing lookup; logging only. Caller-site decision so future audit code can pick a different policy by calling `incrementScanCount` outside the wrapper.
- **Out of scope (deferred)**: no `GET /scan/popular` endpoint, no mobile-side display of the counter, no index on `scan_count` (volumes too low; will be added alongside the future `ORDER BY scan_count DESC`).

### PR #943 merged (`40347f0`) — docs(specs): scan algorithms spec (barcode + panoramic label)

- New file: [`docs/architecture/specs/scan-algorithms.md`](docs/architecture/specs/scan-algorithms.md). Single source of truth for the scan feature in two flavours: barcode + panoramic label.
- 11 sections: vocabulary glossary (FR/EN, used verbatim everywhere), decision tree (auto-switch when no barcode data, prompt when partial below threshold, no panoramic when complete), 9-phase panoramic algorithm (pre-capture → burst → loop closure → live OCR → backend stitching → server OCR → Claude vision → web-search verification + suggestion creation → review), data model impact (`panoramic_capture` entity), canonical UX copy, tech-stack constraints (Expo Managed pure), risks + open implementation choices, implementation roadmap.
- Round-1 review fix in `f774d3d`: added BB + OFF acronyms to the glossary; **realigned the spec with [ADR-0005](docs/architecture/decisions/0005-backend-split-encyclopedia-vs-product.md)** (panoramic backend services + catalog/suggestion entities live in Python beer-encyclopedia, NestJS keeps notifications + auth + maintainer-action proxies); reworded `barcode` nullability to clarify it's a required schema property of the new Python table (legacy NestJS table stays NOT NULL during transition); justified `jsonb` now that the entity lives in Postgres. Disagreed with 4 markdown-formatting comments where Copilot hallucinated `||` separators that weren't there.
- 9 sub-issues filed under #751 the same day (#944–#952) covering tech-spike, mobile capture chain, Python backend services, and decision-tree wiring.
- A follow-up PR will amend the spec with: (a) conditional OCR-ensemble (5-channel software derivation when single-pass confidence is low), (b) streaming progression UX between backend phases.

### Decisions

- **Backend ownership per ADR-0005 made explicit in the spec banner**: any new catalog / ML / enrichment work goes into Python beer-encyclopedia. The NestJS `scan/` module is on a deprecation roadmap. Mobile is allowed to talk to both backends. Epic #934 was filed before this realignment landed; its NestJS-centric data model needs a follow-up to migrate to Python.
- **Capture stays full-color, derivations happen post-capture**: monochrome / per-channel OCR variants are derived software-side from a single full-color panorama, never captured separately. Avoids unnecessary photo bursts.
- **Conditional OCR ensemble over systematic ensemble**: single grayscale pass first, escalate to 5-channel ensemble only when confidence on critical fields is below 0.7. Cost stays at ~$0.006/scan in the common case.
- **Hybrid stitching (live preview on-device + final on backend)**: the on-device preview cannot run OpenCV, so it uses gyro-derived progress and perceptual-hash loop-closure detection. The authoritative panorama is stitched server-side with `cv2.Stitcher_create(cv2.Stitcher_PANORAMA)` in Python (`opencv-python` is already a transitive dep of YOLO + EasyOCR).

### PR #933 merged (`33ba517`) — chore(env): KISS+YAGNI cleanup of env files + Tailscale fix

- Cleanup pass on env files across the monorepo + a `main.ts` change to bind the API to `0.0.0.0` so Expo Go on a phone can reach it via Tailscale or LAN. Branch `fix/env-tailscale-coverage`.
- Round-1 review fix in `ead8c17`: removed the stale `Development - Staging` Swagger server (staging dropped from `APP_ENV`), renamed `Development - Local` → `Development`, added a small "Also reachable on" log section under the startup banner that lists every non-loopback IPv4 (LAN / Tailscale) so phones know which URL to hit. Also separated `buildTypeOrmOptions` into runtime vs CLI (`{ forCli?: boolean }`) so `npm run migration:generate` / `migration:revert` no longer auto-apply pending migrations before running the requested command.
- Follow-up PR for the project log entry of this work was bundled into the current entry rather than filed separately.

### Operational

- 9 sub-issues filed under epic [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) (panoramic capture): #944 → #952. Sub-issues sequenced per spec §9 with explicit dependencies. **Project board linkage was deferred** — `gh project item-add` and `gh api graphql addProjectV2ItemById` were blocked at the harness level during the bulk-add; the items can be added via the GitHub Projects UI (single multi-select operation).
- **API first production deploy** on Fly.io — app `brasse-bouillon-api` (account `bbd.concept@gmail.com`), region `cdg`, machine `shared-cpu-1x:512MB`, volume `bb_data` 1 GB attached at `/app/data` for SQLite persistence. `JWT_SECRET` rotated at deploy time. Live URL <https://brasse-bouillon-api.fly.dev/> returns `{"success":true,"data":"Hello World!"}`. Mobile app (Expo Go via Tailscale-bridged Metro) verified end-to-end against the production API: signup + login flow OK. Database starts fresh — no migration from the local Tailscale instance; demo data seeding deferred. See [packages/api/docs/fly-deploy.md](packages/api/docs/fly-deploy.md) for the proven-working setup procedure (the `fly deploy` invocation must run from the monorepo root with `--config packages/api/fly.toml --dockerfile packages/api/Dockerfile` because the Dockerfile's build context is the repo root). Branch `chore/deploy-api-fly-io` ships only the doc fixes and this log entry.
- **Massive cleanup pass**: 7 stale remote branches deleted, ~1.16 GB disk reclaimed (build artifacts + `node_modules` + archived backend `node_modules`), 65 GitHub issues closed in three triage rounds (legacy marketing pre-launch batch, Discord MCP setup that was paused, monorepo-migration chores, repo-transfer items, English-translation backlog, pre-monorepo architecture-rewrite tickets, the legacy E01–E10 epic structure superseded by the `epic:*` label family, plus the 19 first-cycle US-XXYY user stories tracked granularly before the consolidated `docs/product-backlog/product-backlog.md`). 5 stale issues kept on purpose (real planning items: #378 design hub, #379 testing strategy, #381 a11y audit, #400 separate-VM deploy, #530 conventions audit).
- **CODEOWNERS solo-dev policy** (PR #956): `.github/CODEOWNERS` reduced to a single `* @benoit-bremaud` rule. New PRs no longer auto-tag the legacy frontend / backend / infra teammates as required reviewers.
- **Scan backlog triage**: closed [#858](https://github.com/benoit-bremaud/brasse-bouillon/issues/858) as superseded by #945 / #946 / #947; closed [#639](https://github.com/benoit-bremaud/brasse-bouillon/issues/639) after absorbing its ACs into #945 (33 / 44 / 75 cl silhouette validation + optional darker out-of-frame mask); commented [#803](https://github.com/benoit-bremaud/brasse-bouillon/issues/803) to make the community-contribution flow's dependency on #948 / #951 / #947 explicit. New consolidation snapshot at [docs/architecture/specs/scan-consolidation.md](docs/architecture/specs/scan-consolidation.md) — single visible artefact mapping the 4 active scan epics, their sub-issues, the cross-cutting issues, the canonical decree, and the 5 open decisions blocking dev-plan finalisation.

---

## 2026-05-06

### PR #928 merged (`8591405`) — chore(api): add full Docker setup for server deployment

- Branch `chore/docker-api-full-v2` (replaces aborted `chore/docker-api-full` — closed without merge after a squash-merge divergence drove the diff over Copilot's 300-file review limit).
- **Server-deployable Docker stack**: `packages/api/docker-compose.yml` (named `api-data` SQLite volume, `restart: unless-stopped`, parameterized `${API_IMAGE_TAG:-latest}` for prod pinning), `packages/api/.env.docker.example` (production-oriented template).
- **Dockerfile rewrite for monorepo-root context**: resolves the canonical `package-lock.json` at the repo root (per-workspace lockfiles blocked by `.gitignore` since incident #674). `packages/api/Dockerfile.dockerignore` (BuildKit-resolved alongside the Dockerfile) replaces the old `packages/api/.dockerignore` and excludes the unrelated workspaces and docs from the build context.
- **CI workflow** `.github/workflows/docker-build.yml`: split into `build` (PR + push, `contents: read` only) + `publish` (push to `main` only, `packages: write`, depends on `build`). Tags `:latest` + `:sha-<short-sha>` pushed to `ghcr.io/benoit-bremaud/brasse-bouillon-api`.
- **Makefile**: `docker-build` (delegates to `docker compose build` so the local image tag matches `docker-up`), `docker-up`, `docker-down`, `docker-logs` + new `Docker — API` block in `make help`.
- 4 review fix commits: `f9ba106` (Codex P1: build context fix), `90db2d7` (Codex P2: decouple host/container port), `eacab87` (Makefile help sectioned + Docker targets in `.PHONY`), `d4da220` (Copilot Should Have ×4: docker-build via compose, split CI permissions, parameterized image tag, `API_IMAGE_TAG` documented in `.env.docker.example`).
- All 4 inline Copilot/Codex comments answered inline. CI green on the publish run. PR #927 (the divergent v1 attempt) closed without merge.

### Decisions

- **Docker build context = monorepo root**: forced by the canonical `package-lock.json` living at the repo root. Per-workspace lockfiles are intentionally blocked since incident #674. Trade-off: larger build context, mitigated by `Dockerfile.dockerignore` excluding `packages/{mobile-app,website,beer-encyclopedia}`, `docs/`, `_archive/`, `.git/`, `.claude/`.
- **Compose `build:` + `image:` kept together**: standard dual-mode Compose pattern (local rebuild via `docker compose build`, server pull via `docker compose pull`). Disagreed with Copilot's suggestion to split into base + override files — extra ceremony for marginal benefit on a single-service project. Server reproducibility is enforced at the deploy-command level (`pull` never touches `build:`).
- **Least-privilege CI**: two-job split with workflow-level `contents: read` only. `packages: write` is granted exclusively to the `publish` job, gated by `if: github.event_name == 'push'`. PR builds can no longer hold a write-capable token even if a step were compromised.
- **Image tag parameterized via `${API_IMAGE_TAG:-latest}`**: default stays `latest` for simplicity; production deployments pin `API_IMAGE_TAG=sha-<short-sha>` for immutable rollouts. Addresses Copilot's concern about the mutable `:latest` tag without removing the convenient default.

### Operational changes (no PR)

- **Discord notifications paused**: workflow `Discord Notifications` (`.github/workflows/discord-notifications.yml`) disabled via `gh workflow disable` (status: `disabled_manually`). Webhook secrets left in place; file untouched. Re-enable only on explicit user instruction.
- **PR reviewer rule clarified — AI-only**: from now on, every PR requests reviews from `copilot-pull-request-reviewer` and `chatgpt-codex-connector` exclusively. No human collaborators in the reviewers list. Supersedes the 2026-04-28 reversal that briefly allowed scope/area-based human reviewers. Humans still appear in the informational French FYI comment, never as reviewers.

### PR #926 merged (`f5faeb6`) — chore(makefile): add dev-all, dev-stop, db-*, migrate-* targets and rewrite help

- Branch `chore/makefile-dev-targets`. Solo Makefile change — no application code modified.
- **New targets**: `dev-beer-enc` (FastAPI uvicorn server, port 8000, with venv preflight guard), `dev-all` (full stack: `setup` → `db-up` → `migrate-api` + `migrate-beer-enc` → 3 servers in parallel via `trap 'kill 0' INT TERM`), `dev-stop` (kill processes on ports 3000/8000/8081 + stop beer-encyclopedia Docker containers).
- **New `@Database` block**: `db-up` (Docker Compose `--wait` with error-aware fallback and 60 s polling timeout), `db-down`, `db-logs`.
- **New `@Migrations` block**: `migrate-api` / `migrate-api-revert` (TypeORM npm script), `migrate-beer-enc` / `migrate-beer-enc-revert` (Alembic venv).
- **`setup` extended**: bootstraps `packages/beer-encyclopedia/.env` from `.env.example` with randomly generated Postgres + PgAdmin passwords (`openssl → python3 secrets → uuidgen → CHANGE_ME` chain). Idempotent.
- **`help` rewritten**: `printf`-based grouped output replacing the sorted `awk` parser — Quick start / Daily dev / Database / Migrations / Quality gates sections.
- 2 review fix commits: `2b16cc4` (db-up error-aware fallback, Codex P2) and `b4d7654` (5× Copilot Should Have: LAN IP in dev-beer-enc log, venv guard in dev-all, dev-stop description narrowed, migrate-beer-enc error message actionable, fallback credentials chain).
- CI green (Makefile-only → app jobs skipped). All 7 reviewer comments addressed inline before merge.

### Issues filed — idea captures (2026-05-05 session)

- [#924](https://github.com/benoit-bremaud/brasse-bouillon/issues/924) — Library tab: curated book references about brewing & beer (`type:feature + scope:frontend + area:mobile + priority:low`).
- [#923](https://github.com/benoit-bremaud/brasse-bouillon/issues/923) — Recipe brewing-difficulty badge for novice guidance (`type:feature + scope:frontend + area:mobile + priority:low`). Both linked to Brasse-Bouillon project (no milestone, deferred to grooming).

---

## 2026-05-05

### PR #917 merged (`7f59508`) — feat(recipes): refactor Mes Recettes into 2-section hub (Mes recettes + Découvrir)

- Closes part of Epic [#740](https://github.com/benoit-bremaud/brasse-bouillon/issues/740) Round 2 (Mes Recettes Hub). Branch `feat/recipes-hub`.
- Scope: legacy flat list replaced by a 2-section hub — **Mes recettes** (perso + scan-imported, with `[Scanner ta 1ère bière]` empty-state CTA wired to `/(app)/dashboard/scan`, Pattern A landing) + **Découvrir** (top 5 of `listPublicRecipes`, capped via `previewLimit`, "Voir tout" pill linking to the existing `CatalogScreen`). Stats / Brouillons / Favoris / Tutoriels deferred to v0.2 per the issue's tier table.
- New components: `sections/MyRecipesSection.tsx` (header + empty-state CTA) and `sections/DiscoverSection.tsx` (header + "Voir tout" pill + preview cards). Orchestrator hosts a single virtualized `FlatList` with section header + footer pattern (P2 review feedback: previous draft used `ScrollView + .map()` which regressed virtualization).
- French i18n pass: `RecipeCard` default visibility badges switched to French ("Publique" / "Privée" / "Non listée"); `CatalogScreen` override updated to `"Publique"`; "curées" mistranslation in DiscoverSection subtitle replaced with "sélectionnées".
- 2 review rounds — **14 inline review comments addressed** total. Round 1 (`4c6de06`): virtualization restoration + `isFirstLoading` narrowed to `&&` of both queries empty + `import type { Recipe }` + French badges + i18n + brittle `getByText` tests recabled on `getByLabelText("Ouvrir la recette …")`. Round 2 (`23d8f1e`): empty-state guarded behind `isLoading` (no flash during initial fetch), `pickQueryError` per-query suppression (no cross-mask), double `paddingHorizontal` removed from sections (parent FlatList owns the gutter), stale `RecipeCard` visibility-badge comment refreshed, incidental `RecipeCard.Props` marked `Readonly<>` (Sonar S6759).
- 750/750 tests green, ci:check green. Single approving review by `benoit-bremaud`, squash-merge to main.

### PR #916 merged (`0bd743f`) — feat(recipes): redesign detail screen with 4-tab layout + EBC hero + sticky CTA

- Closes part of Epic [#740](https://github.com/benoit-bremaud/brasse-bouillon/issues/740) Round 4 (Recipe Detail Screen Refonte v0.1). Branch `feat/recipe-detail-redesign-demo`.
- Scope: legacy 1.3 kLoC monolithic `RecipeDetailsScreen` split into a tabbed orchestrator. **Initial design**: 4 horizontal tabs (Vue d'ensemble / Brassage / Compatibilité / Notes & Reviews) + `RecipeDetailTabBar`. **v2 redesign mid-PR** (commit `1e9b889`, after design Q&A with PO): switched to a **5-tab vertical side rail** (Vue / Ingrédients / Eau / Brassage / Notes) via `RecipeDetailSideRail`, with `IngredientsTab` and `WaterTab` extracted from the previous Brassage tab. Sticky `[Lancer un brassin]` CTA pinned across every tab except Notes (where the action is semantically irrelevant). EBC-driven hero shared with the scan flow's `BeerHero` (rather than a duplicated `RecipeHero` — SonarCloud duplication gate cleared).
- Data fetching migrated from `useState + useEffect` to TanStack Query (`useQuery` + `useMutation`). Mutation `onSuccess` invalidates the `['batches']` cache so the navigated-to batches list refetches with the freshly created batch. `handleRetry` calls `startBatchMutation.reset()` before refetching the recipe query, so a failed batch-start no longer keeps the error banner up.
- 15 inline review comments addressed (2 P2 + 13 quality-of-life) — Must Have: explicit not-found state when `recipeId` is empty, mutation reset on retry, batches cache invalidation, water preset `rootRecipeId` fallback for imported recipes, `RecipeHero` deletion (BeerHero canonical). Should Have: `BeerHero` made flexible (optional brewery/style with hide-when-empty rendering), location preference no longer a tautology (falls back to `DEFAULT_BALANCED_WATER_PROFILE`), BrewingTab slimmed to ~190 lines, ScrollView `flex: 1`, hero/test improvements. Disagree (politely): dynamic styles are legitimate (EBC-driven hero color, safe-area `paddingBottom`).
- 744 → 750 tests green, ci:check green. Squash-merge to main.

### Post-merge cleanup — local hygiene

- `git pull origin main` (7 commits behind), local branches `feat/recipe-detail-redesign-demo` / `feat/recipes-hub` / `feat/seed-brewdog-diy-dog-official` deleted, remote refs pruned (`origin/feat/recipe-detail-redesign-demo`, `origin/feat/recipes-hub`, `origin/feat/seed-brewdog-diy-dog-official`).

### Decisions

- **Recipe Detail mid-PR redesign — 5-tab vertical side rail over 4-tab horizontal**: switched after a focused design Q&A with the PO. Vertical rail scales better when more tabs (Compatibility cross-checks, Tasting target date, future v0.2 features) need to land, ingredients warrant a dedicated tab to support the future Alchimiste flow ([#895](https://github.com/benoit-bremaud/brasse-bouillon/issues/895)), and water deserves its own tab since the cross-check is the most-discussed compatibility criterion. Force-pushed within the same PR rather than as a follow-up because the v1 4-tab work was barely 24h old and the v2 was strictly additive on the same architecture.
- **Hub Mes Recettes — single virtualized `FlatList` over `SectionList` or `ScrollView + .map()`**: chosen during PR #917 round 1 in response to a P2 review comment. `SectionList` would have worked but the hub has only 2 sections of which one is bounded (Découvrir capped at 5), so a `FlatList` with `ListHeaderComponent` (Mes recettes title + empty state) and `ListFooterComponent` (Découvrir) keeps native row recycling for the unbounded "Mes recettes" data without nested scrolling complexity.
- **`RecipeCard` default visibility badges French by default**, English override only for explicit deliberate-marker contexts: `CatalogScreen` keeps `badgeLabel="Publique"` as a defensive guarantee in case the API leaks a non-public row. Pattern aligns with the project-wide "UI stays French" convention.
- **`RecipeHero` deleted in favour of canonical `BeerHero`**: avoids the maintenance cost of keeping two near-identical hero primitives in sync (review feedback on PR #916). `BeerHero` was made flexible (optional `brewery` / `style` props, hide-when-empty rendering) to absorb the recipe use case without duplication. Resolved the SonarCloud New Code Duplication gate that was failing on the previous head.

---

## 2026-05-04

### PR #908 merged (`ef0494f`) — feat(catalog/distributor): add distributors + 5 M:N junctions per catalogue

- Closes Issue #901 (boutique foundation). Branch `feat/catalog-distributors-and-junctions`.
- Scope: `distributors` table (12 entries FR/BE/GB/US/DE) + 5 junction tables (`hop_distributors`, `fermentable_distributors`, `yeast_distributors`, `misc_template_distributors`, `equipment_template_distributors`) + 5 `GET /catalog/{hops|fermentables|yeasts|misc-templates|equipment-templates}/:id/distributors` endpoints + migration 1793 + seed + runner.
- Sets the codebase **M:N precedent**: composite PK `(catalogue_id, distributor_id)`, `ON DELETE CASCADE` both sides, reverse-lookup index on `distributor_id`, CHECK constraints (country GLOB `[A-Z][A-Z]`, currency GLOB `[A-Z][A-Z][A-Z]`, URLs `https://%`).
- Shared `CatalogDistributorLinkDto` + `mapJunctionRowToDto` helper to avoid 5× DTO duplication. UUID range `9...` reserved for distributors (next slot after producers `8`).
- 10 Copilot review comments addressed in `ca2c31b` — 4 missing `getDistributors()` service-spec happy/sad/edge (H/S/E) blocks, 5 missing `:id/distributors` controller-spec blocks, 1 unused `DistributorEntry` interface dropped. Each comment got an inline reply linking to the fix commit.
- 653/655 tests green (+22 new). Junction seed rows (Citra → Brewferm/Hopt/MaltMiller, etc.) deferred to a follow-up tiny PR or bundled with #780 (BrewDog DIY Dog seed).

### PR #906 merged (`1e195ab`) — refactor(mobile/ingredients): consume `GET /catalog/*` endpoints

- Closes Issue #887. First mobile-side consumer of the 9 catalogue endpoints shipped 2026-05-03 (PRs #888 → #902). Replaces the legacy recipe-crawl fallback (`ingredients.api.ts` — N+1 queries on `/recipes/*/{hops,fermentables,yeasts}` with hardcoded `betaAcid: 0` and synthetic `hop-citra` IDs) by per-category api modules calling `/catalog/{hops|fermentables|yeasts|misc-templates}` with real UUIDs.
- 5 api modules touched: `hops.api.ts` rewritten, `malts.api.ts` rewritten (mobile keeps "malt" terminology, API table is `fermentables`), `yeasts.api.ts` rewritten (post #905 cleanup — no more `laboratory`, `product_id` → `product_code`), new `misc.api.ts` (currently unwired pending picker UX in issue #624), `ingredients.api.ts` deleted.
- `application/ingredients.use-cases.ts` rewritten to delegate the polymorphic surface (`listIngredientsByCategory`, `getIngredientDetails`, `listIngredientCategoriesSummary`) to the per-category use-cases (`listMalts` / `listHops` / `listYeasts` + `getMaltDetails` / `getHopDetails` / `getYeastDetails`). Demo-mode dispatch (`dataSource.useDemoData` → `demoIngredients`/`demoMalts`) preserved untouched. 3 type-adapter functions (`maltToIngredient`/`hopToIngredient`/`yeastToIngredient`) convert per-category Product shapes (with `specGroups`) to the `Ingredient` union.
- Cold load: 3 requests (one per category) instead of `1 + 3N` recipe crawls. Real UUIDs propagate end-to-end.
- 6 commits on the branch over ~3 hours of iterative review cycles. **10 reviewer comments addressed inline** (1 Codex P1 caught twice — accent-on-label parsing breakage + recipe-crawl regression — and 8 Copilot — DTO drift, synthetic ID propagation, premature deprecation, dead-code mention, missing docblock, code smell). Sonar coverage gate cleared in 3 successive pushes (39.5% → 72.2% → ≥80%) by adding 4 api spec files + parametric adapter coverage tests (+53 tests total — 682 → 735).
- **Mobile post-Phase 3 follow-up sequence** continues: distributors #901 (boutique foundation), Recipe → catalogue FK refactor, mobile Académie BJCP #892, mobile picker UX #624 (which will wire `IngredientCategory.misc` and consume the `misc.api.ts` shipped here).

---

## 2026-05-03

### Catalogue refactor — Phases 1-3 + producers + cleanup shipped in one day (#708 / #869)

- 8 immutable reference catalogues merged to `main` between 02:00 and 18:16 UTC (PR #888 → #899), all on `packages/api`. Each PR follows the same 12-file pattern: entity + DTO + service + controller + module + migration + seed + 3 specs (service/controller/seed) + runner script + wiring updates to `catalog.module.ts` and `typeorm.config.ts`. The 9th PR #902 (producers + 5 catalogue FKs) lands at 19:55 UTC and closes the cross-catalogue producer dimension. The 10th PR #905 (yeast cleanup, 20:56 UTC) closes the dette deferred from #902's mode-prudent first cut. PR #906 ships at 01:41 UTC on 2026-05-04 — first mobile consumer of the new endpoints (see entry above).
- **Decisions** locked across the series:
  - `*CatalogModule` suffix (e.g. `WaterCatalogModule`, `EquipmentCatalogModule`, `ProducerCatalogModule`) to avoid class-name collisions with existing user-owned modules — convention adopted on PR #894 after Copilot caught the `EquipmentModule` collision risk, extended to `*CatalogService` / `*CatalogController` after Copilot caught the same drift on PR #902.
  - `assertCommonCatalogueSeederBehaviours` shared test helper at `src/database/seeds/seed-test-utils.ts` — covers the 4 standard scenarios (happy / sad / mixed / override-list) so each catalogue spec only carries its own invariants. Added on PR #891 to clear SonarCloud's new-code duplication gate.
  - Deterministic UUID range per catalogue: hops `0`, fermentables `1`, yeasts `2`, styles `3`, mash `4`, waters `5`, equipment `6`, misc `7`, producers `8`.
  - Notes columns kept French (UI-facing per `feedback_ui_french_only`); `use_for` / category metadata stays English (BeerXML provenance).
  - **Producer ≠ Distributor** (PR #902): producers carry the brand owner (1 product = 1 producer, FK 1:1 on catalogues). The boutique flow (1 product = N distributors) is reserved for issue #901 (M:N junctions) and will be refined when the boutique work starts.
- **Scope post Phase 3**: umbrella issues #708 / #869 closed automatically by PR #899. Open follow-ups now tracked separately — yeast cleanup tiny PR (drop `laboratory` + rename `product_id` → `product_code` after picker UX validation, deferred from PR #902's mode-prudent scope), distributors #901, Recipe-entity FK refactor, mobile ingredient picker refactor #887.

### PR #905 merged (`2aec87b`) — refactor(catalog/yeast): drop legacy `laboratory` + rename `product_id` to `product_code`

- Closes Issue #904. Tiny cleanup PR that closes the dette technique deliberately deferred from PR #902's mode-prudent first cut. Now that `producer_id` FK has shipped and the picker UX can rely on it, the legacy yeast columns can be retired.
- Migration 1792 (data + schema): backfills `producer_id` on existing yeast rows by SQL lookup against `producers.name` (verbatim match — names in PR #902 seed were chosen for this exact lookup). Then `DROP COLUMN laboratory` + `RENAME COLUMN product_id TO product_code`. SQLite 3.35+ DROP COLUMN, better-sqlite3 bundles 3.42+.
- Two defensive layers added after Codex P1 catch: (1) `INSERT OR IGNORE` the 5 essential laboratory producers (Wyeast Labs / White Labs / Fermentis / Lallemand / Imperial Yeast) at the top of the migration so the join never returns NULL on an upgraded DB where the producers seed hasn't been (re-)run; (2) `SELECT COUNT(*) AS "n" FROM "yeasts" WHERE "laboratory" IS NOT NULL AND "producer_id" IS NULL` orphan-detection assertion BEFORE the drop — fail-fast if any orphan remains. Same `INSERT OR IGNORE` pattern mirrored in the yeast seed loader (Copilot catch, separate concern from the migration).
- Yeast entity drops `@Index(['laboratory'])` + `laboratory` column + renames `product_id` → `product_code`. Yeast DTO drops `laboratory` field + renames `product_id` → `product_code`. 20 seeded yeasts get their `producer_id` populated via the migration backfill (Wyeast Labs UUID for the 1056 / 1084 / 1332 / 2565 / 3068 / 3711 / 3787 / 1318 entries, etc.).
- 3 commits: initial drop+rename + Codex P1 fix (self-seed migration) + Copilot fix (seed self-bootstraps via `repository.query()`, helper `buildRepoMock` extended with `query` jest.fn).
- 605/607 tests still green (no regression), lint + build clean.

### PR #902 merged (`977610c`) — feat(catalog/producer): producers reference table + producer_id FK on 5 catalogues

- First post-Phase 3 follow-up. Closes design debt documented in every Phase 1-3 catalogue entity ("deferred to normalize-producers PR after Phase 3"). Closes issue #900.
- Adds `producers` table (16 → 17 entries: 5 laboratories Wyeast Labs / White Labs / Fermentis / Lallemand / Imperial Yeast, 5 maltsters Briess / Weyermann / Best Malz / Castle / Crisp, 3 hop suppliers Yakima Chief / BarthHaas / Hopsteiner, 3 equipment manufacturers Grainfather / Klarstein / Anvil, + Brouwland as `other` added during review). Adds nullable `producer_id` FK on hops, fermentables, yeasts, misc_templates, equipment_templates (ON DELETE SET NULL). New endpoints `GET /catalog/producers` and `GET /catalog/producers/:id`.
- **Mode-prudent first cut chosen mid-planning**: `producer_id` added on yeast ALONGSIDE the existing `laboratory` varchar + `product_id` varchar (PR #890 columns), NOT in replacement. Yeast carries 3 producer-related fields temporarily — cleanup tiny PR ships separately once picker UX is validated against the new FK. Trade-off: minimal diff (5 catalogue files touched with 1 nullable column each), zero risk on existing seeded data, faster to ship.
- 19 files initial + 18 files in fix commit, 605/607 tests green (+21 producer, no regression). 3 commits: `f74220a` initial / `9df4541` Codex P1 fix (down() drop_column ordering for FK dangle) / `2d42349` Copilot 15-comment fix (DTO exposure ×5 + @Index ×5 + *Catalog* naming ×2 + Other type ×1 + spec assertion ×1 + docblock ×1).
- Spawned issue [#901](https://github.com/benoit-bremaud/brasse-bouillon/issues/901) (distributors + M:N junctions, boutique foundation) — placeholder spec to refine when boutique work starts. Naming distinction `producer` (brand owner) vs `distributor` (reseller) explicitly captured in the issue body to anchor the future implementation.

### PR #899 merged (`37f993f`) — feat(catalog/misc): miscellaneous ingredients reference catalogue (closes Phase 3)

- Phase 3 PR #8 — last catalogue of the original 8-PR series. Covers BeerXML 1.0 `<MISC>` records: spices, finings, water agents, herbs, flavor adjuncts.
- 10 entries: 5 BeerXML canonical (Apricot Extract, Calcium Chloride, Ginger Root, Irish Moss, Orange Peel Bitter) + 5 Brasse-Bouillon modern essentials (Coriandre, Lactose, Whirlfloc, Servomyces, Gypse). Coverage: all 6 BeerXML TYPE values + 3 primary USE phases (mash / boil / bottling).
- Same naming pattern as `equipment_templates` (`misc_templates` not `miscs`) to leave room for a future `recipe_misc` junction table without collision when Recipe entities are refactored.
- Schema: `type` (enum CHECK spice/fining/water_agent/herb/flavor/other), `use_at` (enum CHECK mash/boil/primary/secondary/bottling — renamed from BeerXML `USE` because `use` is a SQL reserved keyword), `amount` + `amount_is_weight` boolean (raw BeerXML AMOUNT verbatim, kg or L), `time_min`, `use_for` (English category), `notes` (French).
- 14 files, +1098 LoC, 584/586 tests green (+20 misc). 3 commits including PROJECT_LOG.md backfill for the prior 7 PRs of the series. 4 Copilot comments addressed in `0553a7c` (entity + migration enum constraints + 2 internal-name leaks in user-facing notes).

### PR #898 merged (`8934ade`) — feat(catalog/equipment): equipment templates reference catalogue

- Phase 3 PR #7 of the catalogue series. 9 entries spanning the full beginner-to-pro spectrum: 1 Brasse-Bouillon original kitchen starter (Casserole 5L extract — added late in the cycle after the user validated the "I just want to try once" persona), 2 BeerXML canonical, 6 modern popular setups (BIAB 20/30L, Grainfather G30, Klarstein Brauheld Pro, Anvil Foundry, 3-Vessel HERMS).
- 4 Copilot inline comments addressed in `2b42d02` (3 stale "8 entries" doc references bumped to "9" after the kitchen starter was added; 1 service docstring rewritten — old version claimed "multiple revisions may share a name", but the schema enforces UNIQUE(name)).
- 14 files, +1096 LoC.

### PR #894 merged (`5fe171b`) — feat(catalog/water): brewing water profiles reference catalogue

- Phase 3 PR #6. 10 reference water profiles (3 BeerXML canonical: Pilsen / Burton-on-Trent / Munich, plus 7 city profiles for famous brewing waters). 6 mineral columns (Ca, Mg, Na, SO4, Cl, HCO3) per BeerXML 1.0 `<WATER>` field mapping.
- Class renamed `WaterModule` → `WaterCatalogModule` after Copilot caught the collision with the existing user-owned water module — set the `*CatalogModule` precedent the rest of the series follows.

### PR #893 merged (`cf3b1c9`) — feat(catalog/mash): mash profiles + steps reference catalogue (1:N)

- Phase 2 PR #5 — closes Phase 2. Two-table catalogue with `mash_profiles` (parent) and `mash_steps` (child, FK with `ON DELETE CASCADE`). Steps ordered by `step_number`, types restricted to BeerXML enum (Infusion / Temperature / Decoction).
- Most complex catalogue of the series due to the 1:N cascade — pattern reusable for any future parent/child catalogue.

### PR #891 merged (`b9b034f`) — feat(catalog/style): BJCP styles reference catalogue (opens Phase 2)

- Phase 2 PR #4. Composite UNIQUE(name, style_guide) so the same style name can coexist across the BJCP 2015 and BJCP 2021 guide editions.
- **SonarCloud duplication failure** caught post-merge: fixed via `sonar.cpd.exclusions` in root `sonar-project.properties` covering catalogue boilerplate (services / controllers / modules / DTOs / entities / seeds / runners). The shared `assertCommonCatalogueSeederBehaviours` helper was extracted at the same time.
- Spawned Issue #892 (mobile Académie / Guide BJCP — separate epic).

### PR #890 merged (`e9e8d5c`) — feat(catalog/yeast): yeasts reference catalogue (closes Phase 1)

- Phase 1 PR #3. BeerXML `<YEAST>` mapping: form (liquid/dry/slant/culture), type (ale/lager/wheat/wine/champagne), attenuation, flocculation. 12 entries spanning the major Wyeast / White Labs / Fermentis lines.

### PR #889 merged (`f137030`) — feat(catalog/fermentable): fermentables reference catalogue

- Phase 1 PR #2. BeerXML `<FERMENTABLE>` mapping incl. `color_ebc` (project-normalised to EBC per `feedback_normalized_colors`), `yield_percent`, type (grain/sugar/extract/dry_extract/adjunct).

### PR #888 merged (`6c70eb3`) — feat(catalog/hop): hops reference catalogue (opens Phase 1)

- Phase 1 PR #1 — first of the 8-PR series, set the file-layout pattern every subsequent catalogue mirrors. BeerXML `<HOP>` mapping incl. alpha_acid_percent, beta_acid_percent, type (bittering/aroma/dual), form (pellet/plug/leaf), use phase, year of harvest.

### PR #871 merged (`fc3ee5a`) — feat(mobile-app): wire Python beer-encyclopedia as fallback for /scan/lookup 404 + ADR-0005 backend split

- ADR-0005 (encyclopedia ⇆ product split) + ADR-0002 marked partially superseded.
- Mobile fallback: NestJS 404 OR 503 → `POST /beers/import-by-ean` on `env.encyclopediaUrl`.
- `http-client` learns `baseUrl` override; `env.ts` exposes `encyclopediaUrlIsConfigured` (Codex P1 fail-fast guard).
- Pre-merge review fixes in `a0bf1bc` (8 inline comments: 1 Codex P1 + 7 Copilot — interface vs type, ADR Postgres → SQLite ×2, source heuristic, rawPayload conditional, fetchedAt null, missing tests).
- Sonar coverage gate cleared in two passes (`f904177` + `8c8241f`): `beers-import.api.ts` + `http-client.ts` now 100%.
- +35 net new tests (647 → 682 green).
- Validated end-to-end on a physical device against 10 EANs (3 Goudale, 2 BACHO, Pelforth, original Goudale Ambrée, La Rousse Mont-Blanc, La Cros Cagnes-sur-Mer, À La Fut IPA).
- Spawned issues: #874 (mobile UX — orphan CTA on not-found), #875 (api — `AllExceptionsFilter` strips structured fields, regresses #800), #876 + #877 (encyclopedia — non-beer acceptance + empty `product_name`), #878 (epic — scan rate-limit + freemium tiering).

---

## 2026-05-02

### PR #847 merged (`5ad8b92`) — feat(beer-encyclopedia): Open Food Facts importer + POST /beers/import-by-ean

- New `importers/` package (`base.ExternalBeerSnapshot` + `openfoodfacts.OpenFoodFactsClient` + `persistence.upsert_beer_from_snapshot`), `Beer.ean_code` column + migration 004, `scripts/seed_sources.py`, ADR-0003.
- Pre-merge review fixes in `f4834b2` (10 inline review comments addressed).
- +38 tests (95 → 135 green).

### PR #848 merged (`7b14aa6`) — fix(beer-encyclopedia): DB-first lookup in POST /beers/import-by-ean

- Skip OFF when `Beer.ean_code` is in DB (warm path 14 ms vs 176 ms cold).
- Updated 200/201/404/503 OpenAPI descriptions in `2024221` (1 review comment).
- +2 tests (137 → 139 green).

### PR #860 merged (`1e4594d`) — chore(beer-encyclopedia): add scan-photos local folder for manual /scan testing

- gitignored photo dump under `packages/beer-encyclopedia/scan-photos/` + `README.md` + `findings.md`.
- EN translation fix in `15a5cce` (1 review comment).
- Surfaced the OCR bug fixed by #861.

### PR #861 merged (`ce78e6f`) — fix(beer-encyclopedia): use paragraph=False in EasyOCR readtext to surface dispersed label text

- `paragraph=True` returned `[]` on 9/9 real beer photos; `paragraph=False` parsed 10–13 fragments each.
- New `packages/beer-encyclopedia/tests/test_ml/test_ocr.py` (4 regression tests, both invariants pinned) + docstring clarifications in `221c9be` (3 review comments).
- 143/143 green.

### Backlog capture — 11 issues opened during the live demo + post-merge brainstorms

- OFF resilience: #850 (`/health/external` ping), #851 (in-memory TTL cache), #852 (HTTP 429 backoff).
- Strategy epics: #849 (AI-research importer + double validation), #853 (DB autonomy strategy parent).
- DB autonomy sub-issues: #854 (bulk OFF dump ingest), #855 (native catalog + search), #856 (EntitySource refresh policy ADR-0004), #857 (book ingestion pipeline).
- Mobile + ML: #858 (label-photo capture quality), #859 (CLIP + pgvector visual recognition fallback).

### Decision — Credit-economy currency named **Couronnes** (#862, child of #739)

- Visual-identity layer for the existing credit economy: monetary unit locked as **Couronnes** (brewing-pro term *capsule couronne* / *crown cap*). Origin: weekend brainstorm post-*Fallout*; reskinned with FR brewing vocabulary for unique brand identity (intentionally distant from Fallout's *caps*).
- Issue [#862](https://github.com/benoit-bremaud/brasse-bouillon/issues/862) tracks scope tiered v0.2 (logo SVG, "Mes Couronnes" balance widget, ledger UI, system copy) / v0.3 (gain/spend animations, decapsulation sound, marketing copy) / soutenance v0.1 teasing (1 vision slide + 1 natural demo mention).
- Round 3.6 cross-reference comment posted in epic [#739](https://github.com/benoit-bremaud/brasse-bouillon/issues/739#issuecomment-4364523284); mechanics from Round 3.5 (4 earning activities, 4 redemption tiers, anti-abuse, schema) unchanged.

---

## 2026-05-01

### PR #841 merged (`b39a1dc`) — feat(beer-encyclopedia): add French legal denomination reference

- Branch `feat/legal-reference-fr`. PR1 of a 3-step encyclopedia data-enrichment plan (PR2 = Open Food Facts EAN connector, PR3 = community-scan contribution loop). 9 files, +1082 LoC, 32 new tests (96/96 green).
- New `legal_denominations` reference table seeded with the 10 canonical denominations from decree 92-307 modified by 2016-1531; seeded by `scripts/seed_legal_denominations.py` (idempotent upsert calqued on `seed_styles.py`).
- Four nullable regulatory columns added on `beers`: `legal_denomination` (CHECK against the 10 codes, no FK), `country_of_origin` (ISO 3166-1 alpha-2, ORM auto-uppercase), `allergens` (JSONB on PG, JSON elsewhere), `alcohol_group` (SMALLINT in {1,3,4,5} per Code de la santé publique Art. L-3321-1, group 2 historically merged into 3). Migration 003 uses `batch_alter_table` for SQLite/PG compat.
- Guided an 8-round interactive, file-by-file pre-merge review with the user: surfaced 9 substantive corrections before commit (rename `label_fr`→`label`, drop `requires_pure_malt`, reorder the 10 codes in decree structure, enrich class docstring, add `isalpha()` to country validator, sync 4 sad-path tests, tighten 1169/2011 wording, fix `biere_a_ingredient` regulatory text "moût initial" not "produit fini").
- **Decisions**:
  - `Reference table over enum / FK / generic regulations table` — dedicated `legal_denominations` rejected three alternatives. Pure SQL enum cannot carry the per-row metadata (description, legal_reference, min_aging_days, max_alcohol_pct). FK rejected to keep the reference re-seedable. Generic `regulations` table rejected as premature generalisation. See ADR-0002 §Rejected alternatives.
  - `French snake_case codes` (`biere_de_garde`, `panache`, …) — preserved verbatim from the decree because no English equivalent carries the same legal meaning. Trade-off documented (opaque to non-FR API consumers); UI mobile is FR-only so the impact is contained.
  - `Defer scrapers (LastDodo, etc.) and YOLO dataset` — out of PR1 scope; legal/scraping audit + manual annotation effort make them v0.3 work, not blocking the encyclopedia data layer.

### PR #842 merged (`7113e82`) — fix(beer-encyclopedia): reject non-ASCII letters in country_of_origin validator

- Branch `fix/beer-encyclopedia-country-of-origin-ascii-only`. Same-day follow-up of #841 addressing the Copilot review comment that was missed pre-merge.
- `str.isalpha()` returns True for Latin-extended letters (`Å`, `Ñ`, …) so `country_of_origin="ÅB"` would have passed both ORM check (length=2, isalpha=True) and DB CHECK (length-only) and persisted invalid data. Added an `isascii()` guard alongside `isalpha()` plus a regression test (`test_beer_rejects_non_ascii_letter_country_code` covering `ÅB` and `ÑO`). Updated docstring + error message to surface the ASCII requirement. 96→97 green, lint clean.
- Process gap captured: the post-push Copilot review fetch was skipped before merging #841 (workflow checklist step 1 of memory `feedback_pr_workflow_checklist`). Reinforces the rule that `gh api .../reviews` must be checked even when the user signals merge — the user's "PR mergée !" doesn't replace the technical gate.

---

## 2026-04-30

### PR #819 merged (`3231af9`) — feat(scan): burst quick wins polish — progressive feedback, retry color, consent FR, import confirmation

- Closes 4 issues at once: #638 (`f453902` progressive 0/5 → 5/5 dots), #641 (`4c2419b` retry button color aligned with brand primary), #640 (`1a46a8f` consent snapshot rendered as readable French), #766 (`a483b39` pre-flight confirmation modal before community recipe import).
- Grouped burst branch with 4 focused commits, 15 new tests across `BarcodeVerificationProgress`, `ScanScreen`, `PendingScansScreen`, `BeerInfoCardScreen`. CI green, 598 mobile tests passing.
- Mid-review fix: PR body and FYI comment originally drafted in French — translated to English and a new memory `feedback_github_artifacts_english_only.md` added so the convention (chat = FR, GitHub artifacts = EN) is no longer ambiguous.

### PR #817 merged (`c508b07`) — chore(website): remove GA4 tracking + cookie consent banner (Chantier E.1)

- Branch `chore/website-remove-ga4-rgpd-banner`. First sub-task of the website refresh plan (Chantier E — tooling & non-conformities). Aligns with the strategy decision to ship the marketing site without analytics until post-store launch traffic justifies revisiting it.
- 3 commits squashed: `e0b130d` removed GA4 + cookie banner from `index.html` / `index-en.html`; `d108517` removed cookie banner CSS rules from `site.css` (preserved `.consent` / `.consent-note` for Formspree opt-in checkboxes); `4d4fa32` refreshed privacy/cookies/terms pages (FR + EN) to state explicitly "no tracking cookies, no third-party audience measurement tool".
- Net diff: 9 files changed, 64 insertions, 290 deletions.
- CI all green, SonarCloud Quality Gate passed (0 new issues, 0 hotspots, 0 % duplication). No human review required (chore PR, draft → ready conversion validated by author after Cloudflare Pages preview check). Copilot review skipped (quota off until 2026-05-01).
- **Decisions**:
  - `Analytics provider` — none for now. Replaces previous GA4 setup. Will revisit after store launch with privacy-friendly options (Plausible likely candidate). Rationale: pre-store traffic too low to justify analytics overhead, and removing the consent banner is an immediate UX win.
  - `Policy pages` — kept `cookies.html` / `cookies-en.html` (rewritten to explain the no-tracking stance) rather than deleting them; preserves SEO inbound links and clarifies the brand position.

### PR #815 merged (`0a5af5d`) — feat(seed): pre-seed Punk IPA brassin demo + 7 brewing-day steps (#782)

- Closes #782. Migration adds 7 nullable columns to `batches`; idempotent seed loader inserts batch row + 7 BatchStep rows. Output of the 8-axis Brassins data model Q&A scoping session 2026-04-30; deferred richness captured in 7 backlog epics: #808 #809 #810 #811 #812 #813 #814.
- Codex P1 fix (commit `879a703`): widened batch window 14d → 21d so all step offsets fit inside [started_at, completed_at] + regression-guard test.
- SonarCloud duplication chase: 4 refactor commits (`e0e4302` `85cd539` `4e00a2f` `a291b86`) — extracted `seed-test-utils.ts` (RepoMock helpers), `seed-utils.ts` (`idempotentUpsertById<T>` generic), runSeed local helper, COLUMNS-array iteration in migration. 4.3% → 0.0% duplication on new code.

### PR #806 merged (`11931fc`) — chore(mocks): sync mobile demoScanCatalog with API seed (4→9 beers, #804)

- Closes #804. Ports the 5 missing entries (Karmeliet Tripel, Westmalle Tripel, Duvel, Heineken, Cervoise Lancelot) to `demoScanCatalog`. Field values mirror the API seed verbatim. Heineken correctly tagged `fermentationType: 'lager'`.
- Self-audit during merge prep flagged that **3 EAN-13 barcodes (Karmeliet, Westmalle, Duvel) fail the standard mod-10 checksum AND are not in OpenFoodFacts** — captured as #807 (demo-blocker, milestone alpha3) for physical bottle verification before the soutenance blanche on 2026-05-06.
- Test guard added on Karmeliet in `DemoOverrideMenu.test.tsx` as a regression guard against future drift.

---

## 2026-04-29

### PR #805 merged (`f9215f5`) — feat(scan): hidden long-press demo override menu — soutenance safety net (#642)

- Sprint B chunk for #642. New `DemoOverrideMenu` modal accessible via 1.5s long-press on the help button in the scan screen header. Lists seeded beers, tap forces the result on the chosen beer (navigates to BeerInfoCardScreen). Hidden gesture, no env-var gating.
- Codex P1 fix (commit `e5d5745`): React Native fires `onPress` on release after `onLongPress` triggers, opening the guide modal behind the override sheet. Fixed with a `useRef` flag that consumes the trailing onPress. Caught before merge — would have been catastrophic on stage.
- SonarCloud Quality Gate fix (same commit): 4 integration tests added on ScanScreen long-press behaviour to push coverage above the 80% threshold.
- Companion follow-up #804 captured: mobile `demoScanCatalog` (4 beers) drifted from API seed (9 beers) since PR #791. Override menu surfaces 4 entries until #804 lands.

### PR #802 merged (`86c36b9`) — docs(soutenance): demo script 90s + 4 jury variants + screencast spec + jury email (#702)

- Sprint B chunk #7 of Scan Tranche 2. New `docs/product/soutenance/demo-script-2026-05-27.md` covers the writable portion of #702: 90s script (5 phases, FR speaker lines), 4 jury-beer adaptive variants (A/B/C/D) aligned with shipped PRs #799/#800/#801, screencast backup spec, jury request email draft (FR, deadline 2026-05-17), rehearsal log scaffolding.
- Codex P2 fix (commit `cda1466`): J-X countdown labels were inconsistent with the project-wide "J-X from defense" semantics. Fixed + added explicit convention note in the header. Bonus: markdownlint inline-HTML warning on `<productName>` placeholder corrected in the same pass.
- Remaining on #702: the actual screencast MP4 recording (week of 2026-05-20, J-7 from defense, post-rc1 feature freeze).

### PR #801 merged (`f50e599`) — feat(scan): photo fallback CTA on invalid barcode — placeholder for v0.2 photo capture (#797)

- Sub-PR 3/3 of [Epic] #794 (closes the umbrella). Mobile-only: `PhotoFallbackCTA` rendered on `invalid` variant + `Alert.alert` referencing v0.2 / epic #751. Self-reviewed (no Codex review available before merge — see PR #801 thread).
- Sprint A scan jury edge cases B+D+C complete: scan flow now demo-ready on happy + sad + edge paths.

### PR #800 merged (`8cacaf0`) — feat(scan): not-a-beer detection — filter OFF by category + dedicated UI (#798)

- Sub-PR 2/3 of [Epic] #794. Backend `NotABeerException` (UnprocessableEntityException 422) + scan service split (`!found` 404 vs `!isBeer` 422) + mobile UI: "Tu as scanné « X » — ce n'est pas une bière" + back-CTA.
- Codex P1 fix (commit `8058902`): the global `HttpExceptionFilter` was stripping custom exception fields, so the mobile 422 → typed-error mapping never matched in production. Filter now spreads non-reserved fields from object exception responses; reserved keys (statusCode/error/timestamp/path) cannot be spoofed. New `http-exception.filter.spec.ts` (6 tests).

### PR #799 merged (`a984cf6`) — feat(scan): graceful UX for unknown beer — surface barcode + mailto CTAs (#796)

- Sub-PR 1/3 of [Epic] #794 (scan jury edge cases B/D/C). Order locked B → D → C in scoping session 2026-04-29.
- Companion issues created same session: epic #794 + #796 (B) + #797 (C) + #798 (D) + backlog idea #795 (multi-product range — wine/cider, v0.2+).

### PR #793 merged (`7266559`) — feat(scan): mobile matching view — official section + equivalents + low_confidence (#700)

- Closes #700.
- Fix commits on top of feature: `0cdcaab` (CI test timing flake on `BeerInfoCardScreen` matching section — `getByText` → `await findByText`), `d8f4bd8` (Codex P2: surface `low_confidence` warning outside the `equivalentRecipes.length > 0` conditional + edge-case test for official-only result), `6eeddf9` (Prettier).

### PR #792 merged (`ab99d1f`) — feat(scan): full matching algorithm — bitterness + color + brew_count + recency + low_confidence (#699)

- Extends PR #773 MVP to the full 7-component formula (similarity = style/ABV/bitterness/color, quality = avg_rating/brew_count/recency, weight renormalization on missing components).
- Codex P1 fix: `low_confidence` uses honest similarity score (without the `is_official` shortcut) so the warning surfaces even when an official recipe tops the list with low real similarity.

### PR #791 merged (`cf8f688`) — feat(scan): complete demo seed to 9 beers — Heineken + Cervoise Lancelot (Topic B)

- Codex P1 fix: Cervoise Lancelot EAN-13 check digit corrected (`3760215750048` → `3760215750042`, mod-10 algorithm).

### PR #790 merged (`c64805f`) — feat(auth): Sprint A polish — simplified signup (#764) + Google cosmetic button (#765) + bigger mascot

- Closes #764, closes #765.
- Codex P2 fix: username fallback truncation — switched to `randomBytes(4).toString('hex')` 8-hex suffix that never gets sliced.

### PR #788 merged (`08c4411`) — docs(product): consolidate v0.1 roadmap from J-29 sprint scoping + personas v3

- See the rich "PR #788 opened" entry under 2026-04-28 below for the full scoping narrative + decisions block.
- Companion sub-issues opened the same day: #774, #775, #776, #777, #778, #779, #780, #781, #782, #783, #784, #785, #786, #787.

---

## 2026-04-28

### PR #773 merged (`5c572de`) — feat(scan): score-based recipe matching MVP — style + ABV + avg_rating (#699)

- Minimal viable algorithm — style 50% + ABV 25% similarity, avg_rating 60% quality, `is_official` shortcut. Superseded the next day by PR #792 (full 7-component formula).

### PR #770 merged (`13c1553`) — chore(log): record PR #768 in PROJECT_LOG.md.

### PR #769 merged (`e83fb78`) — chore(main): release-please app libraries train.

### PR #788 opened — docs(product): consolidate v0.1 roadmap from J-29 sprint scoping session + personas v3

Branch `docs/sprint-scoping-2026-04-28`. Captures the outcome of a
multi-hour structured Q&A scoping session held on the J-29 marker
day before the soutenance finale. Nine topics were debated
sequentially with atomic Yes/No/Plus de détails/Débattons questions
and grounded recommendations referencing the 2026-04-24 brainstorms
(scan, onboarding, compte-parametres, recipe-schema-audit) and the
v2 personas document. ~50 atomic decisions arbitrated.

Scope of the PR:

- New canonical roadmap document
  `docs/product/roadmap-v0.1-consolidated.md` — single source of
  truth for v0.1 scope across 9 topic groups (Auth, Scan flow,
  Brassins, Drêches, Liste de courses, Export & Inventory, Recipe
  Catalog, Académie, Vocabulary, Channels & share, Polish & Nav)
  + sprint-by-sprint sequencing (Sprints A→F across J-29 → J-1)
  + deferred v0.2 features list + cross-cutting meta-decisions
  (vocabulary hybrid, normalized SRM/EBC colors, BrewDog DIY Dog
  inspiration) + identified risks (effort tension at 109h vs
  100-120h available, demo mode vs backend, soutenance blanche
  J-21 readiness).
- `docs/personas/user_personas.md` updated to v3 to align — most
  notably **Brassins promoted v0.2 → v0.1 demo** per Topic #1
  decision (Brassins included in 90s → 120s demo script, onglet
  visible). All 5 personas now have a concrete v0.1 incarnation
  via newly-scoped features.

Companion sub-issues created from the same session (referenced
from the roadmap):

- **#774** [Epic] Inventory management (v0.2 + tease in pitch)
- **#775** Beer mug loader animation (v0.2+ branding)
- **#776** Drêches valorization 6th section "Aller plus loin"
- **#777** Smart shopping list (checklist + share + drêches tease)
- **#778** Export BeerXML 1.0 (industry standard for persona Marc)
- **#779** Recipe Catalog mini (sub-screen Mon Carnet)
- **#780** Seed 25 BrewDog DIY Dog recipes curated
- **#781** Brewing assistance enrichie (9 phases + countdown timers
  + tips pédagogiques)
- **#782** Pre-seed Punk IPA brassin demo (BrewDog DIY Dog values)
- **#783** Académie glossary tooltip + auto-link inline
- **#784** Hybrid display (qualitative + numeric vocabulary)
- **#785** vocab-mapping.md canonical doc
- **#786** Native share recipe + brewing hashtags
- **#787** [Epic] Brewing calculators audit (v0.2)

Existing issues commented with refined scope: #595, #600, #605,
#606, #607 (deferred v0.2), #608, #613, #616, #629, #644, #646,
#766.

Decisions:

- `Sprint scoping methodology — atomic Q&A with grounded
  recommendations` — hardened on this session via memory updates
  (`feedback_question_format_french` v2 with explicit recommendation
  rule and granularity range, `feedback_recadrage_clarity`,
  `feedback_brewing_pro_vocab`, `feedback_normalized_colors`).
- `Brassins promoted to v0.1 demo` — overrides personas v2 doc
  which had it at v0.2. Rationale: B-08 audit (2026-04-23) flagged
  Brassins as CRITICAL one day before personas v2 was written;
  the personas doc inherited a stale triage. The 90s demo script is
  extended to 120s to include the Brassins beat with the pre-seeded
  Punk IPA brassin (#782) showcasing the BrewDog-style 9-phase
  brewing assistance (#781).
- `Inventory management deferred v0.2 + teased in pitch` — the
  feature is rich (~10-15h) and would push the v0.1 effort above
  the 120h ceiling. Capturing the epic now (#774) preserves the
  idea and provides material for the soutenance "Perspective" slide
  (20pts in the Jeune Pousse grading rubric).
- `Recipe Catalog mini as a sub-screen of Mon Carnet, not a top-level
  tab` — keeps the bottom nav lean (already under refonte via #613)
  and aligns with the narrative "Mon Carnet vide → je l'enrichis
  via le catalogue".
- `BrewDog DIY Dog as primary curated catalog source` — its
  open-source status, recognized brewing standards (BJCP-aligned
  styles, complete grain bills, hop schedules, fermentation
  profiles) and editorial richness (Brewer's Tip per recipe) make
  it the natural pillar of the v0.1 Recipe Catalog. AHA, BJCP
  guidelines, Brewer's Friend deferred v0.2 to keep the parsing
  effort bounded.
- `Hybrid vocabulary display everywhere` — "Amertume marquée · 40
  IBU" / "Couleur ambrée · EBC 18" / "ABV 5.6% (modéré)" — no
  toggle, no onboarding step. Cohabite Léa (mots familiers en
  premier) and Marc (chiffres immédiatement visibles) without user
  arbitrage. Doc canonique #785 lock the qualitative ↔ numerical
  ranges.

External communication:

- FYI notification on PR #788 mentioning @Smith06S, @Thais9723,
  @Fabien-Ori, @vitalikevin (in English per
  `feedback_pr_notification_comment` rule hardened earlier today).

Awaiting CI + Codex + user merge.

### PR #768 merged (`f2890cc`) — feat(scan): seed 10 curated public recipes + dual-id helper for community import (Issue #701)

Branch `feat/curated-public-recipes-issue-701`. Closes the
backend-mode community-import sad path: the mobile
`BeerInfoCardScreen` "Recettes équivalentes" rows now resolve
against real `PUBLIC` rows when `EXPO_PUBLIC_USE_DEMO_DATA=false`,
instead of returning 404 from `POST /recipes/import-from-community/:id`.

Scope (monorepo, both packages):

- **API** `packages/api/src/database/seeds/system-user.seed.ts` —
  new sentinel non-loginable account (`SYSTEM_USER_ID =
  00000000-0000-4000-8000-000000000000`, email `system@brasse-bouillon.local`,
  username `system`, `is_active=false`, role `admin`). Owns all
  curated public content — required because `recipes.owner_id`
  carries an FK to `users(id)`.
- **API** `packages/api/src/database/seeds/public-recipes.seed.ts` —
  10 curated PUBLIC recipes, deterministic UUIDs
  `00000000-0000-4000-8000-00000000000{1..a}`, three styles per demo
  bottle (IPA / Belgian / Strong Dark / Lager). Idempotent loader
  (insert-or-update on id). `is_official=true`,
  `imported_from_recipe_id=null`, `import_provenance=null`.
- **API** `packages/api/scripts/run-public-recipes-seed.ts` — CLI
  orchestrator: system user first, then public recipes.
- **Mobile** `scan.types.ts` — new optional `publicRecipeId?: string`
  on `ScanRecipeMatch`.
- **Mobile** `recipes.use-cases.ts` — new `getImportSourceId(match)`
  helper. In demo mode returns `match.recipeId` (resolves against
  `demoRecipes`); in backend mode returns
  `match.publicRecipeId ?? match.recipeId` (so the API receives the
  real PUBLIC UUID).
- **Mobile** `demo-data.ts` — 12 `demoEquivalentRecipes` entries get
  the new `publicRecipeId` field wired to the seeded UUIDs.
- **Mobile** `BeerInfoCardScreen.tsx` — uses `getImportSourceId(recipe)`
  instead of `recipe.recipeId`.
- **Tests** — 24 new (24 / 24 green): 9 system-user, 8 public-recipes,
  5 `getImportSourceId`, 2 screen-level. Full backend + mobile suites
  stay green.

Review cycle (3 rounds):

- Round 1 (`86f6dc0`) — Codex P2: payload duplication between insert
  and update branches in `public-recipes.seed.ts`. Addressed by
  extracting a shared `payload` const used by both branches.
- Round 2 (`47c4025`) — SonarCloud Quality Gate failure: Math.random
  usage flagged as security hotspot, 5.5% code duplication. Switched
  password generation to `crypto.randomBytes(32)` (cryptographic
  randomness) and confirmed the duplication fix held.
- Round 3 (`0bdf058`) — Codex P2: `seedSystemUser` only checked
  existence by `id`, but `users.email` and `users.username` are
  UNIQUE. A row squatting either reserved value would crash the
  orchestrator on a non-empty DB. Fix: extended `findOne` to OR on
  id + email + username; collision under a different id throws a
  clear error rather than silently rewriting the squatting row.

Decisions:

- `Sentinel system user, not a fake admin` — chose a dedicated
  `SYSTEM_USER_ID` with a random unguessable bcrypt hash and
  `is_active=false` over reusing the developer admin account, so the
  curated content owner can never be impersonated and stays distinct
  in audit queries.
- `Throw on credential squat, do not silently rewrite` — when a real
  user occupies the reserved system email/username, the seed refuses
  loudly. Rationale: silently aligning their row to system metadata
  would be data loss; refusing surfaces the conflict so a human can
  reconcile before the FK from public recipes blows up downstream.
- `Helper-in-use-case for the dual-id resolution` — `getImportSourceId`
  lives in `recipes.use-cases.ts`, not the screen. Keeps
  presentation agnostic of the demo/backend toggle and reuses the
  established `dataSource.useDemoData` branching pattern.

---

## 2026-04-27

### PR opened — Mobile UI: import community recipe (Issue #601)

Branch `feat/mobile-recipe-import-issue-601`. Mobile-side closing of
the demo-hero scan loop, paired with the just-merged backend PR #742.
The user can now scan a beer, see the curated equivalent recipes, and
import one into their own catalog with a single tap — landing on the
new recipe's detail page.

Scope (mobile only):

- **Data layer** `recipes.api.ts` — new
  `importFromCommunity(sourceId): Promise<Recipe>` calling
  `POST /recipes/import-from-community/:id`.
- **Use-case** `recipes.use-cases.ts` — new
  `importRecipeFromCommunity(sourceId)` with the standard
  `dataSource.useDemoData` branch:
  - demo: returns the source recipe id + name from `demoRecipes`
    (lets the UI navigate to a resolvable detail page when no real
    backend is wired);
  - backend: delegates to the API, returns the new recipe id + name
    from the response.
- **Screen** `BeerInfoCardScreen.tsx` — `EquivalentRecipesSection`
  rewritten:
  - per-row "+ Importer" CTA replaces the previous "tap to navigate
    to source" affordance;
  - `importingId` local state drives `disabled` + `accessibilityState
    busy/disabled` + a "Import…" label during the round-trip;
  - `Alert.alert` success modal with "Voir la recette" action →
    `router.push('/(app)/recipes/{newId}')`;
  - `Alert.alert` failure modal with retry-friendly French copy.
- **Tests** — 5 added across 2 suites:
  - 3 use-case unit tests in
    `__tests__/import-recipe.test.ts` (happy demo, sad demo, happy
    backend with API delegation assertion);
  - 2 screen tests in `BeerInfoCardScreen.test.tsx` `import community
    recipe` block (happy: import called + alert posted + nav on
    "Voir la recette"; sad: rejected import → error alert + no nav).
- Full mobile suite stays green: 531 / 58 (was 526 / 57).

Decisions:

- Tap on the row IS the import action (vs. a dedicated icon-button
  to the right) — keeps the layout dense, makes the demo flow a
  single tap, and matches the persona of a curious brewer who already
  trusts the curated list.
- Source id translation lives in the use-case (not the screen) —
  keeps the screen agnostic of demo / backend mode and follows the
  data-source toggle convention.
- Provenance display (the `import_provenance` text written by the
  backend) is intentionally NOT surfaced on the recipe detail screen
  yet — the recipe detail refonte (4 tabs) ships that surface
  later, this PR keeps the mobile layer minimal and demo-functional.

Follows up: backend-mode integration with real public recipe IDs
(curated public seed + #700 swap) before the soutenance demo. Until
then, real-backend mode requires the demo recipe IDs to exist in the
DB; demo mode works end-to-end on day 1.

### PR opened — Backend import-from-community endpoint (Issue #601)

Branch `feat/recipes-import-from-community-issue-601`. Closes the
demo-hero scan loop on the backend side: when a user picks a community
recipe from the BeerInfoCardScreen `Recettes équivalentes` section, the
mobile UI (separate PR) will call the new endpoint to copy that recipe
into the user's private catalog with full provenance.

Scope (backend only):

- **Migration** `1779000000000-AddRecipeImportProvenanceFields.ts` —
  adds two nullable columns to `recipes`:
  - `imported_from_recipe_id` (varchar(36), indexed) — FK pointer to
    the source recipe for audit
  - `import_provenance` (text) — French human-readable string
    surfaced in the UI ("Importée de Punk IPA Clone le 2026-04-27")
- **Entity** `recipe.orm.entity.ts` — 2 new columns + 1 index
  (`imported_from_recipe_id`)
- **DTO** `recipe.dto.ts` — exposes the 2 fields with explanatory
  ApiPropertyOptional descriptions
- **Service** `recipe.service.ts` — new `importFromCommunity(userId,
  sourceId)` method:
  - Refuses PRIVATE source (ForbiddenException) — only PUBLIC and
    UNLISTED are importable
  - Refuses unknown sourceId (NotFoundException)
  - Generates new UUID, owns recipe to current user, sets visibility
    PRIVATE, version 1, root_recipe_id = own id, parent_recipe_id =
    null, brew_count = 0, avg_rating = null, last_brewed_at = null
  - Deep-copies the 6 satellite tables (steps, hops, fermentables,
    yeasts, additives, water) with new FKs
  - Wraps the whole flow in a single transaction
- **Controller** `recipe.controller.ts` — new route
  `POST /recipes/import-from-community/:id` guarded by
  `@JwtAuthGuard`, with Swagger annotations covering 201/404/403.

Tests:

- 9 new service tests (`recipe-import.service.spec.ts`) covering
  happy / sad / edge:
  - PUBLIC source → success with right ownership / visibility / provenance
  - UNLISTED source → also accepted
  - Resets community-tracking fields on the new recipe
  - Copies recipe metrics (batch volume, OG, IBU…)
  - PRIVATE source → ForbiddenException
  - Unknown id → NotFoundException
  - Steps deep-copied with new recipe_id
  - Hops deep-copied with new ids and recipe_id
  - Source with no satellites → empty target
- 2 new controller tests covering route → service contract +
  NotFoundException propagation
- Full backend suite stays green: 312 / 41 suites (1 skipped).

Decisions:

- Visibility check at service layer (not DTO) — keeps the policy
  testable in isolation and centralised regardless of caller.
- New recipe is its own root (no lineage to source via
  `root_recipe_id`/`parent_recipe_id`) — those keep their natural
  meaning for user-driven forks. The import relationship lives
  exclusively in the new `imported_from_recipe_id` column.
- Provenance string format: `Importée de "<source.name>" le
  YYYY-MM-DD`. Simple, French, machine-readable date for log filters.

Mobile half ships in a separate PR (next step in the J-30 roadmap).

### PR opened — Polish batch on BeerInfoCardScreen (closes #734 #735 #736 #737)

Branch `fix/scan-info-card-polish-batch`. Cosmetic + demo-blocker fixes
captured during the same-day sanity-check session on PR #732 (just-merged
mobile UI info card). Four issues closed in one batch:

- **#734** (demo-blocker) — `<meta name="color-scheme" content="light">`
  added to `app/+html.tsx`, plus the `prefers-color-scheme: dark` body
  override removed. Browsers with auto-dark-mode (Chrome flag, OS dark
  theme) no longer desaturate the EBC-driven hero colors. Confirmed via
  F12 inspect during the sanity-check that the DOM receives the right
  hex codes; the issue was purely the rendering layer auto-inverting
  light backgrounds. `app.json` `userInterfaceStyle` left as
  `automatic` for now (separate concern for native iOS/Android dark
  mode handling).
- **#735** — at-a-glance Style cell now allows 3 lines + auto-shrinks
  font (`adjustsFontSizeToFit` + `minimumFontScale=0.85`). Long beer
  styles like "Belgian Strong Pale Ale" no longer truncate.
- **#736** — at-a-glance value text honors word boundaries. Cell value
  style adds `wordBreak: keep-all` + `overflowWrap: break-word` on web
  via `Platform.OS === 'web'` guard (RN core types don't expose these
  properties; cast through `as object`). "Légèrement amère" no longer
  breaks mid-word as "Légèreme | nt amère".
- **#737** — ScrollView `paddingBottom` raised from `spacing.xxl` (40px)
  to `spacing.xxl * 3` (~120px) so the last fold's content
  ("Histoire de la brasserie") clears the bottom tab bar.

Side observation captured during the sanity-check: the dark-mode
auto-invert that triggered finding A1 ("hero olive-green") was a false
positive on the code (F12 confirmed `rgb(213, 181, 33)` reaching the
DOM correctly for Punk IPA EBC 14). #734 is the architectural fix that
ensures all future browsers render the EBC palette faithfully.

Tests: full mobile suite still 527/527 — no new tests added (visual
fixes only, existing tests cover behavior).

Skipped from this batch: **#733** (SRM palette consolidation between
calculator and lookup-color). The palette refactor would shift the
visual rendering of beer hero colors; user explicitly opted to keep
the current visuals as-is for soutenance. #733 stays open in the
backlog for post-soutenance.

### PR #732 opened — Mobile UI: beer info card with hero + lazy folds (Issue #698)

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
