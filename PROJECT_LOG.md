# Project Log — Brasse-Bouillon

Reverse-chronological record of all project activity (most recent entries first).
This is the operational logbook, not the release changelog (see [docs/changelog.md](docs/changelog.md)).

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
