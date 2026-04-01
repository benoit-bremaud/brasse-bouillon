# CLAUDE.md — brasse-bouillon (monorepo root)

## Project Overview

**Name:** Brasse-Bouillon
**Type:** npm workspaces monorepo
**Packages:** `packages/mobile-app`, `packages/api`, `packages/website`, `packages/beer-label-ai`
**Node:** 20.x (enforced via `.nvmrc` and `engines` field)
**Language:** English only — all code, comments, commits, docs, and issues in English

---

## Monorepo Structure

```
brasse-bouillon/
  packages/
    mobile-app/   React Native + Expo SDK 54 + Router v6 + TypeScript (strict)
    api/          NestJS 11 + TypeORM + SQLite + TypeScript
    website/      Static HTML/CSS/JS marketing site + Python quality gate
    beer-label-ai/ Python 3.12 + FastAPI + YOLOv8 + EasyOCR ML pipeline
  docs/           Project documentation
  _archive/       Pre-monorepo code (read-only reference)
  .github/        CI workflows
  tools/ci/       SonarQube scan script
```

## Per-Package Instructions

Each package has its own CLAUDE.md with detailed conventions:

- **Mobile App:** [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md)
- **API:** No CLAUDE.md yet — follow NestJS conventions, TypeORM patterns, and the rules below
- **Beer Label AI:** [packages/beer-label-ai/CLAUDE.md](packages/beer-label-ai/CLAUDE.md)

---

## Cross-Cutting Rules (apply to ALL packages)

### Git Workflow

- Every task requires a dedicated branch from `main`. Never commit directly to `main`.
- Branch naming: `feat/<scope>`, `fix/<scope>`, `refactor/<scope>`, `chore/<scope>`, `docs/<scope>`
- Use **Conventional Commits**: `<type>(<scope>): <short description>`
- Run CI checks before pushing. Ask for explicit user validation before creating a PR.
- After creating a PR, post an **informational notification comment** mentioning relevant team members (based on scope/area labels). The comment must use plain, non-technical language so all team members understand. See [CONTRIBUTING.md](CONTRIBUTING.md) § PR notification comment.
- See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

### TypeScript

- Strict mode enabled everywhere. Never use `any`.
- Named exports only. No default exports for screens, use-cases, or API modules.
- `interface` for object shapes; `type` for unions, mapped types, utility types.

### Code Quality

- ESLint + Prettier enforced per package
- SonarQube local analysis available: `make sonar-scan SONAR_TOKEN=sqp_xxx`
- CI runs automatically on every PR (path-filtered per package)

### Testing

- Tests are mandatory for every new feature
- Mobile App: Jest + @testing-library/react-native (407 tests)
- API: Jest (238 tests)
- Run all tests: `npm run test:all`

### Security

- Never introduce: command injection, XSS, SQL injection, hardcoded secrets
- Never commit `.env` files or credentials
- Never push `--force` to `main`

---

## Root Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:mobile-app` | Start Expo dev server |
| `npm run dev:api` | Start NestJS in watch mode |
| `npm run ci:all` | Lint + typecheck + format check for all packages |
| `npm run test:all` | Run all tests |
| `npm run lint:all` | Run all linters |
| `npm run typecheck:all` | Run all type checkers |

---

## CI Pipeline

GitHub Actions workflow at `.github/workflows/ci.yml`:

- Triggered on PRs to `main` and pushes to `main`
- Path-filtered: only changed packages are tested
- Mobile App: `ci:check` + `test:coverage`
- API: `lint:check` + `build` + `test:cov`
- Website: Python quality gate
- Coverage artifacts uploaded for SonarQube integration

---

## Environment Variables

Each package has its own `.env.example`. Never modify `.env` files — copy from `.env.example`.

### Mobile App (`packages/mobile-app/.env`)

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_USE_DEMO_DATA=false
```

### API (`packages/api/.env`)

```bash
APP_ENV=development
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRATION=86400s
PORT=3000
DATABASE_PATH=./data/brasse-bouillon.db
```

---

## Forbidden — Never Without Explicit User Request

### Config files — do not modify

- `eslint.config.*`, `tsconfig.json`, `babel.config.js`, `jest.config.*`, `app.json`
- `.env`, `.env.example` (except to add new documented variables)

### Directories — never touch

- `node_modules/`, `.expo/`, `.git/`, `_archive/`

### Patterns — never introduce

- `any` TypeScript type
- Default exports for screens, use-cases, or API modules
- Direct `fetch()` calls outside `packages/mobile-app/src/core/http/http-client.ts`
- Hardcoded colors, spacing, or font values in mobile app (use theme tokens)
- Inline style objects in mobile app (use `StyleSheet.create()`)

---

## Project Log

This project maintains a [PROJECT_LOG.md](PROJECT_LOG.md) — a chronological, agent-agnostic operational logbook recording all significant project activity (merged PRs, architectural decisions, backlog changes).

**Rules:**

- Update after every merged PR, significant decision, or backlog change
- Entries are append-only (never delete), most recent first
- This is NOT `CHANGELOG.md` — the changelog tracks releases, the project log tracks daily operations

---

## Documentation

| Topic | Location |
|-------|----------|
| Project log | [PROJECT_LOG.md](PROJECT_LOG.md) |
| Mobile App conventions | [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md) |
| Design system | [packages/mobile-app/docs/design-system.md](packages/mobile-app/docs/design-system.md) |
| Contributing guide | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Definition of Done | [docs/project-management/definition-of-done.md](docs/project-management/definition-of-done.md) |
| Definition of Ready | [docs/project-management/definition-of-ready.md](docs/project-management/definition-of-ready.md) |
| Sprint structure | [docs/project-management/sprint-definition.md](docs/project-management/sprint-definition.md) |
| API docs | [docs/api/](docs/api/) |
| Architecture | [docs/architecture/](docs/architecture/) |
