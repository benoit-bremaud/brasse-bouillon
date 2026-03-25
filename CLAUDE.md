# CLAUDE.md — brasse-bouillon (monorepo root)

## Project Overview

**Name:** Brasse-Bouillon
**Type:** npm workspaces monorepo
**Packages:** `packages/frontend`, `packages/backend`, `packages/website`
**Node:** 20.x (enforced via `.nvmrc` and `engines` field)
**Language:** English only — all code, comments, commits, docs, and issues in English

---

## Monorepo Structure

```
brasse-bouillon/
  packages/
    frontend/     React Native + Expo SDK 54 + Router v6 + TypeScript (strict)
    backend/      NestJS 11 + TypeORM + SQLite + TypeScript
    website/      Static HTML/CSS/JS marketing site + Python quality gate
  docs/           Project documentation
  _archive/       Pre-monorepo code (read-only reference)
  .github/        CI workflows
  tools/ci/       SonarQube scan script
```

## Per-Package Instructions

Each package has its own CLAUDE.md with detailed conventions:

- **Frontend:** [packages/frontend/CLAUDE.md](packages/frontend/CLAUDE.md)
- **Backend:** No CLAUDE.md yet — follow NestJS conventions, TypeORM patterns, and the rules below

---

## Cross-Cutting Rules (apply to ALL packages)

### Git Workflow

- Every task requires a dedicated branch from `main`. Never commit directly to `main`.
- Branch naming: `feat/<scope>`, `fix/<scope>`, `refactor/<scope>`, `chore/<scope>`, `docs/<scope>`
- Use **Conventional Commits**: `<type>(<scope>): <short description>`
- Run CI checks before pushing. Ask for explicit user validation before creating a PR.
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
- Frontend: Jest + @testing-library/react-native (407 tests)
- Backend: Jest (238 tests)
- Run all tests: `npm run test:all`

### Security

- Never introduce: command injection, XSS, SQL injection, hardcoded secrets
- Never commit `.env` files or credentials
- Never push `--force` to `main`

---

## Root Scripts

| Script | Description |
|--------|-------------|
| `npm run dev:frontend` | Start Expo dev server |
| `npm run dev:backend` | Start NestJS in watch mode |
| `npm run ci:all` | Lint + typecheck + format check for all packages |
| `npm run test:all` | Run all tests |
| `npm run lint:all` | Run all linters |
| `npm run typecheck:all` | Run all type checkers |

---

## CI Pipeline

GitHub Actions workflow at `.github/workflows/ci.yml`:

- Triggered on PRs to `main` and pushes to `main`
- Path-filtered: only changed packages are tested
- Frontend: `ci:check` + `test:coverage`
- Backend: `lint:check` + `build` + `test:cov`
- Website: Python quality gate
- Coverage artifacts uploaded for SonarQube integration

---

## Environment Variables

Each package has its own `.env.example`. Never modify `.env` files — copy from `.env.example`.

### Frontend (`packages/frontend/.env`)

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_USE_DEMO_DATA=false
```

### Backend (`packages/backend/.env`)

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
- Direct `fetch()` calls outside `packages/frontend/src/core/http/http-client.ts`
- Hardcoded colors, spacing, or font values in frontend (use theme tokens)
- Inline style objects in frontend (use `StyleSheet.create()`)

---

## Documentation

| Topic | Location |
|-------|----------|
| Frontend conventions | [packages/frontend/CLAUDE.md](packages/frontend/CLAUDE.md) |
| Design system | [packages/frontend/docs/design-system.md](packages/frontend/docs/design-system.md) |
| Contributing guide | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Definition of Done | [docs/project-management/definition-of-done.md](docs/project-management/definition-of-done.md) |
| Definition of Ready | [docs/project-management/definition-of-ready.md](docs/project-management/definition-of-ready.md) |
| Sprint structure | [docs/project-management/sprint-definition.md](docs/project-management/sprint-definition.md) |
| API docs | [docs/api/](docs/api/) |
| Architecture | [docs/architecture/](docs/architecture/) |
