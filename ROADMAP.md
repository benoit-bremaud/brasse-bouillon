# Brasse-Bouillon Roadmap

Last updated: 2026-01-29

## Vision
Mobile-first assistant for homebrewers and craft brewers to design, brew, and
track beer batches with minimal equipment. The app must be beginner-friendly,
modern, and offline-first.

## Product Decisions (Confirmed)
- Recipes: public by default; can be private or shared.
- Sharing: unlisted read-only link + opt-in public.
- Recipe versioning: allow duplication/forking.
- Recipe steps: specific per recipe, based on generic style templates.
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
- Clean Architecture inside feature modules (domain/application/infrastructure/presentation).

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
- User + Auth modules (JWT login/register, profile)
 - Recipes domain (entities, public/private, versioning/forking)
 - Recipe steps workflow (mash, boil, whirlpool, fermentation, packaging)

### In Progress
- Backend stabilization and hardening
- Roadmap definition (this document)

### To Do
Phase 1 - MVP Backend
- Equipment profile per user
- Brewing assistant workflow model
- Batch/fermentation tracking + reminders
- Calculators service (ABV/IBU first)
- Offline sync API design (last-write-wins)
- Role model expansion (beyond ADMIN/MODERATOR/USER)
- Legal compliance checks (age, country gating)
- PostgreSQL migrations (baseline schema)

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
- Exact required vs optional recipe fields (MVP).
- Default values for equipment fields (per system type).
- Offline conflict UI beyond last-write-wins (V1+).
- Legal requirements for France + EU (disclaimers, data retention).
- Expanded roles and permissions beyond user/admin (scope + permissions).

## Changelog
- 2026-01-29: Initial roadmap created from user requirements.
- 2026-01-29: Added detailed MVP/V1 decisions (recipes, sharing, calc, offline, legal, roles, DB).
- 2026-01-29: Added engineering workflow + clean architecture decision.
