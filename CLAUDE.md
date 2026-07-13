# CLAUDE.md — brasse-bouillon (monorepo root)

## Project Overview

**Name:** Brasse-Bouillon
**Type:** npm workspaces monorepo
**Packages:** `packages/mobile-app`, `packages/api`, `packages/website`, `packages/beer-encyclopedia`
**Node:** 20.x (enforced via `.nvmrc` and `engines` field)
**Language:** English only — all code, comments, commits, docs, issues, PR bodies, and PR review replies in English. **Single documented exception (brasse-bouillon-specific):** the **PR notification comment** posted right after PR creation is written in **French**, to brief the project's French-speaking team in plain language at PR time. See § Git & PR workflow below and [CONTRIBUTING.md](CONTRIBUTING.md) § PR notification comment. This rule does not apply to any other repo.

## Per-Package Instructions

Each package ships its own `CLAUDE.md` with detailed conventions:

- **Mobile App:** [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md)
- **API:** [packages/api/CLAUDE.md](packages/api/CLAUDE.md)
- **Website:** [packages/website/CLAUDE.md](packages/website/CLAUDE.md)
- **Beer Encyclopedia:** [packages/beer-encyclopedia/CLAUDE.md](packages/beer-encyclopedia/CLAUDE.md)

## Project-specific rules

Global rules (Conventional Commits, branch from `main`, no `any`, no default exports, AI attribution allowed for transparency, security defaults) are inherited from `~/.claude/CLAUDE.md` — not duplicated here. The rules below are the ones that *only* apply to this repo.

### TypeScript

- `interface` for object shapes; `type` for unions, mapped types, utility types.

### Code quality tooling

- ESLint + Prettier enforced per package.
- SonarQube local analysis: `make sonar-scan SONAR_TOKEN=sqp_xxx`.
- CI auto-runs on every PR (path-filtered per package) — see `.github/workflows/ci.yml`.

### Testing

- Tests are mandatory for every new feature (happy + sad + edge cases).
- Mobile App: Jest + `@testing-library/react-native`.
- API: Jest (unit + e2e).
- Run everything: `npm run test:all`.

### Git & PR workflow

- Branch naming: `feat/<scope>`, `fix/<scope>`, `refactor/<scope>`, `chore/<scope>`, `docs/<scope>`.
- After creating a PR, post the **PR notification comment in French** (the single FR-public exception, see "Language" above) mentioning relevant team members based on the PR's scope/area labels. Full template and example in [CONTRIBUTING.md § 6 — PR notification comment](CONTRIBUTING.md#6-pr-notification-comment).
- For the full PR-creation procedure (assignee, labels, project, Copilot reviewer, FYI comment), the on-demand skill `pr-create` applies — load it when opening a PR.

## Root Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:mobile-app` | Start Expo dev server |
| `npm run dev:api` | Start NestJS in watch mode |
| `npm run ci:all` | Lint + typecheck + format check for all packages |
| `npm run test:all` | Run all tests |
| `npm run lint:all` | Run all linters |
| `npm run typecheck:all` | Run all type checkers |

## Environment variables

Each package has its own `.env.example` documenting required variables — copy to `.env` and edit. Never modify `.env` files in-place; never commit them.

## Forbidden — never without explicit user request

### Config files — do not modify

- `eslint.config.*`, `tsconfig.json`, `babel.config.js`, `jest.config.*`, `app.json`.
- `.env`, `.env.example` (except to add a newly-documented variable).

### Directories — never touch

- `node_modules/`, `.expo/`, `.git/`, `_archive/`.

### Patterns — never introduce

- `any` TypeScript type.
- Default exports for screens, use-cases, or API modules.
- Direct `fetch()` calls outside `packages/mobile-app/src/core/http/http-client.ts`.
- Hardcoded colors, spacing, or font values in the mobile app (use theme tokens).
- Inline style objects in the mobile app (use `StyleSheet.create()`).

## Project Log

This project maintains a [PROJECT_LOG.md](PROJECT_LOG.md) — chronological, agent-agnostic operational logbook (merged PRs, architectural decisions, backlog changes). Entries are add-only, most-recent first. **This is NOT `docs/changelog.md`** — the changelog tracks releases, the project log tracks daily operations. For the full authoring rules, see global skill `project-log-discipline`.

## Architecture Decision Records — mandatory context for every PR review

**IMPORTANT** — Every agent (Copilot, Codex, human reviewer) MUST read the accepted ADRs under [docs/architecture/decisions/](docs/architecture/decisions/) before reviewing code. They define the structural rules of this project.

Currently accepted ADRs (see each file for the `Status` line and full rationale):

- [ADR-0001 — Build for today, design for tomorrow](docs/architecture/decisions/0001-build-for-today-design-for-tomorrow.md)
- [ADR-0002 — Centralized NestJS backend](docs/architecture/decisions/0002-centralized-nestjs-backend.md)
- [ADR-0003 — Consent as a single source of truth](docs/architecture/decisions/0003-consent-single-source-of-truth.md)
- [ADR-0004 — Data locality hybrid principle](docs/architecture/decisions/0004-data-locality-hybrid-principle.md)
- [ADR-0005 — Backend split (encyclopedia vs product)](docs/architecture/decisions/0005-backend-split-encyclopedia-vs-product.md)
- [ADR-0009 — Beer-duel preference data ownership](docs/architecture/decisions/0009-beer-duel-preference-data-ownership.md)
- [ADR-0011 — Single-holder CREATOR role above ADMIN](docs/architecture/decisions/0011-creator-role-above-admin.md)
- [ADR-0013 — Canonical beer model, scan-catalog reconciliation, and conception order](docs/architecture/decisions/0013-beer-canonical-model-and-conception-order.md)
- [ADR-0014 — Website hosting on Cloudflare Pages, DNS authority on Cloudflare](docs/architecture/decisions/0014-website-hosting-cloudflare-pages-dns.md)
- [ADR-0015 — Beer ingestion & enrichment strategy (staging → human-gated promotion)](docs/architecture/decisions/0015-beer-ingestion-enrichment-strategy.md)
- [ADR-0018 — Admin/moderation surface: in-app CREATOR moderation, secured at the NestJS API](docs/architecture/decisions/0018-admin-moderation-surface.md)
- [ADR-0020 — Equipment-driven batch sizing & volume planning (computed in the backend)](docs/architecture/decisions/0020-equipment-driven-volume-planning.md)
- [ADR-0022 — Public FAQ chatbot: Mistral LLM + self-hosted ALTCHA, EU-sovereign](docs/architecture/decisions/0022-public-faq-chatbot-llm.md)
- [ADR-0024 — Recipe brewing-difficulty badge: rule-based, max-dominates, backend-computed](docs/architecture/decisions/0024-recipe-difficulty-scoring.md)
- [ADR-0025 — Local water profile: postal-code geolocation, live proxy first, append-only cache second](docs/architecture/decisions/0025-water-profile-geolocation-and-caching.md)
- [ADR-0026 — Equipment capacity fit-check: advisory pre-batch readiness, backend-computed](docs/architecture/decisions/0026-equipment-capacity-fit-check.md)
- [ADR-0027 — Website internationalization strategy (bilingual FR+EN marketing site)](docs/architecture/decisions/0027-website-i18n-strategy.md)
- [ADR-0028 — Website donation link: Ko-fi one-off, plain outbound link only](docs/architecture/decisions/0028-website-donation-link-kofi.md)

When a new ADR is accepted, add its file link here (no dates, no per-ADR summaries — open the file for the live status and content). When reviewing a PR, flag any diff that violates these ADRs and cite the ADR number and clause in the review comment.

## Documentation

| Topic | Location |
|-------|----------|
| Project log | [PROJECT_LOG.md](PROJECT_LOG.md) |
| Contributing guide | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Mobile App conventions | [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md) |
| Design system | [packages/mobile-app/docs/design-system.md](packages/mobile-app/docs/design-system.md) |
| Definition of Done | [docs/project-management/definition-of-done.md](docs/project-management/definition-of-done.md) |
| Definition of Ready | [docs/project-management/definition-of-ready.md](docs/project-management/definition-of-ready.md) |
| Sprint structure | [docs/project-management/sprint-definition.md](docs/project-management/sprint-definition.md) |
| Testing strategy | [docs/testing/testing-strategy.md](docs/testing/testing-strategy.md) |
| API docs | [docs/api/](docs/api/) |
| Architecture | [docs/architecture/](docs/architecture/) |
| Architecture Decision Records | [docs/architecture/decisions/](docs/architecture/decisions/) |

## Project-local Claude tooling

- Subagent `pr-pre-reviewer` — local pre-push review (ADR violations, forbidden patterns). See [.claude/agents/pr-pre-reviewer.md](.claude/agents/pr-pre-reviewer.md).
