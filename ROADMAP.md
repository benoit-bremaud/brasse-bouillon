# Brasse-Bouillon Roadmap

Last updated: 2026-02-19 (session 4)

## Vision
Mobile-first assistant for homebrewers and craft brewers to design, brew, and
track beer batches with minimal equipment. The app must be beginner-friendly,
modern, and offline-first.

## Product Decisions (Confirmed)
- Recipes: private by default; the owner can switch to UNLISTED or PUBLIC.
- Sharing: unlisted read-only link + opt-in public.
- Recipe versioning: allow duplication/forking.
- Recipe steps: per recipe; fixed 5-step workflow for MVP (templating later).
- Content sources: MVP content written in-house only (no imports).
- Units: metric and imperial; user-selectable with automatic conversion.
- Equipment profiles: multiple per user (not a single profile).
- Brewing journal: batches, notes, temps, gravity readings, reminders.
- Offline-first: must work without network and sync later.
- Auth: MVP with email+password; social login later.
- Production DB: PostgreSQL (migrations from the start).
- Roles: MVP user + admin; V1+ mentor/editor/pro roles possible.
- Legal: alcohol-related compliance required (France + EU, 18+ gating).

## Engineering Workflow (Confirmed)
- Branch naming: `<type>/<scope>` in kebab-case.
  Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `ci`.
- Base branch: `main` (trunk-based).
- PR policy: 2 PRs (baseline fixes/docs, then features).
- Copilot review: auto-review via repo/org config; mention `@copilot` in PRs.
- Reviewers: CODEOWNERS configured to request review from `@vitalikevin`.
- Clean Architecture inside feature modules (domain/application/infrastructure/presentation).
- Code quality gates in CI: lint + tests + security audit (SonarCloud planned).

## MVP Scope (Mobile)
1) Authentication
   - Email/password signup/login
   - Profile page (basic info + preferences)

2) Recipes
   - Browse a curated public list of recipes
   - Recipe preview: ingredients, equipment, steps, estimated metrics
   - Favorites (saved recipes)

3) Brewing Assistant
   - Step-by-step guidance for beginners
   - Strict step tracking (timers, confirmations)
   - Equipment requirements and preparation checklist

4) Fermentation + Packaging
   - Post-brew guidance: fermentation start, carbonatation, bottling
   - Reminders and checks (gravity readings, temps)
   - Status tracking: in progress / fermentation / finished

5) Calculators
   - Dynamic ABV + IBU calculators (simple, modern UX)
   - IBU formula: Tinseth (MVP)
   - V1+: SRM/EBC, OG/FG, efficiency, priming

6) Offline-first
   - Full use without network
   - Sync on reconnect (MVP last-write-wins)

## MVP Specifications (Detailed)

### Recipes (MVP)
- Steps per recipe (templated by style, user-editable).
- Workflow: mash -> boil -> whirlpool -> fermentation -> packaging.
- Sharing: unlisted read-only link + opt-in public.

### Ingredients (MVP)
- Grains: type, weight, potential (optional), color (optional).
- Hops: variety, alpha %, weight, timing (boil/whirlpool/dry hop), form.
- Yeast: strain, type (ale/lager), attenuation (optional).
- Additives: name, amount, step.
- Water: mash/sparge volumes; optional target temperature.
- Water profile (sulfate/chloride/pH): V1+ only.

### Equipment Profiles (MVP)
- Multiple profiles per user.
- Fields: mash tun volume, boil volume, fermenter volume.
- Losses: trub/kettle loss, dead space, transfer loss.
- Evaporation rate (L/h or %/h).
- Efficiency (%), measured vs estimated.
- Cooling time/flow (optional).
- System type: extract / all-grain / all-in-one.

### Calculators (MVP)
- ABV + IBU (Tinseth).
- V1+: OG/FG, SRM/EBC, efficiency, priming.

### Offline & Sync (MVP)
- Must work offline for recipes, active batches, timers, notes, readings.
- Conflict strategy: last-write-wins (MVP).
- V1+: merge UI for conflicts.

### Legal & Roles (MVP)
- Region: France + EU.
- Age gate: 18+ confirmation (no identity verification in MVP).
- Roles: User + Admin (MVP), Mentor/Editor/Pro (V1+ if validated).

## Phases and Status

### Done (Code Exists)
- NestJS backend scaffolding
- Global API hardening (validation, standardized responses, exception filters, Swagger gated in prod)
- User + Auth modules (email/password, JWT login/register, /auth/me, profile endpoints, roles/guards)
- Equipment profiles (CRUD scoped to current user)
- Recipes module (CRUD + persistence scoped to current user)
- Recipe steps workflow (default mash/boil/whirlpool/fermentation/packaging)
- Recipe steps persistence + minimal editing API (label/description) + lazy backfill
- Recipe brewing metrics fields (batch_size_l, boil_time_min, og_target, fg_target, abv_estimated, ibu_target, ebc_target, efficiency_target)
- Brewing assistant workflow model: Batch domain (domain-only)
- Brewing assistant: Batch persistence + service (no HTTP yet)
- Brewing assistant: Batch API + auth integration
- Brewing assistant: Fermentation + reminders API
- JWT integration tests (auth.protected.e2e-spec.ts — valid/invalid/expired/missing token)
- Security: npm audit pipeline hardening (critical-only gate + tar override for sqlite3 chain)
- DB config alignment with migrations (typeorm.config.ts + data-source.ts synchronized)
- CI: GitHub Actions build + test + lint:check
- CI: Security audit job (production deps, critical-only)
- CI: auto-request Copilot review on new PRs
- CD: build and push Docker image to GHCR on merges to main
- Repo: CODEOWNERS auto-requests review from `@vitalikevin`

### In Progress
- Test coverage improvement (currently ~33% — target ≥60%)
- SonarCloud setup planning (project onboarding + CI integration still pending)

### To Do
Phase 1 - MVP Backend
- Ingredients foundation: DB migration + ORM entities + CRUD API (fermentables/hops/yeasts/water/additives)
- TypeORM `@OneToMany` relations between `RecipeOrmEntity` and ingredient entities
- Swagger `@ApiBearerAuth()` alignment (reference name `'JWT-auth'` vs default)
- Calculators service (ABV/IBU first, Tinseth)
- Offline sync API design (last-write-wins)
- Role model expansion (beyond ADMIN/MODERATOR/USER)
- Legal compliance checks (age, country gating)
- PostgreSQL migrations (baseline schema migration from SQLite)
- Test coverage improvement — unit tests for recipe/equipment/batch controllers (target ≥60%)
- Batch DELETE endpoint (no soft-delete, scoped to owner)

Phase 2 - MVP Mobile
- Recipe browsing + favorites
- Recipe detail view (ingredients/equipment/steps)
- Guided brew assistant (timers, checklists)
- Fermentation workflow + notifications
- Offline data storage + sync UI

Phase 3 - Post-MVP
- Social login (Google, Facebook, Instagram, etc.)
- Community features (sharing, comments, ratings)
- Advanced calculators (SRM/OG/FG/efficiency)
- Recipe versioning UX and diff
- Multi-batch analytics and insights

## Open Questions (Need Decisions)
- Exact required vs optional recipe fields (MVP) — especially for ingredients.
- Which ingredient fields are mandatory at creation vs optional?
- Default values for equipment fields (per system type).
- Offline conflict UI beyond last-write-wins (V1+).
- Legal requirements for France + EU (disclaimers, data retention).
- Expanded roles and permissions beyond user/admin (scope + permissions).
- SonarCloud organization/project key — self-hosted SonarQube vs SonarCloud (free tier)?
- PostgreSQL target version and migration strategy from SQLite.

## Changelog
- 2026-01-29: Initial roadmap created from user requirements.
- 2026-01-29: Added detailed MVP/V1 decisions (recipes, sharing, calc, offline, legal, roles, DB).
- 2026-01-29: Added engineering workflow + clean architecture decision.
- 2026-02-04: Updated status based on current backend (equipment profiles + hardening + CODEOWNERS) and clarified next backend priorities.
- 2026-02-05: Marked recipes/steps persistence as done and added batch domain workflow; clarified default recipe visibility = PRIVATE.
- 2026-02-05: Added batch persistence + service (PR #19).
- 2026-02-06: Added batch API endpoints + auth integration (PR #21).
- 2026-02-06: Added fermentation + reminders API (PR #24).
- 2026-02-18: Full repo audit. Confirmed JWT protected e2e tests and CI security audit hardening; refined backend priorities and open questions.
- 2026-02-19 (session 4): Documentation consistency pass after Copilot review; removed unimplemented items from "Done" and aligned statuses with the current codebase.
