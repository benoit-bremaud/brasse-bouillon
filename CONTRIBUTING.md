# Contributing to Brasse-Bouillon

Thank you for contributing to Brasse-Bouillon. This guide covers the workflow, conventions, and quality standards for the monorepo.

---

## Prerequisites

- **Node.js** 20.x (see `.nvmrc`)
- **npm** 10+
- **Git** 2.30+

```bash
# Clone and install
git clone git@github.com:benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon
npm install
```

---

## Branching Strategy

We use **trunk-based development** with `main` as the single production branch. Never commit directly to `main`.

### Branch Naming

Every task requires a dedicated branch from `main`:

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<scope>` | `feat/ibu-calculator` |
| Bug fix | `fix/<scope>` | `fix/login-redirect` |
| Refactor | `refactor/<scope>` | `refactor/http-client` |
| Chore | `chore/<scope>` | `chore/update-deps` |
| Docs | `docs/<scope>` | `docs/readme-update` |

```bash
git checkout main
git pull origin main
git checkout -b feat/my-feature
```

---

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

**Scope:** the affected area (`auth`, `recipes`, `tools`, `backend`, `frontend`, `monorepo`, `ci`, `sonar`)

Examples:
```
feat(recipes): add recipe duplication use-case
fix(auth): handle expired refresh token gracefully
ci(monorepo): add SonarQube quality gate to CI pipeline
docs(readme): update getting started section
```

---

## Development Workflow

### 1. Pick an issue

Assign yourself on the GitHub issue before starting. Check the project board for priority.

### 2. Create a branch

```bash
git checkout -b feat/issue-description main
```

### 3. Make changes

Follow the architecture and code style conventions (see below).

### 4. Run checks locally

```bash
# Frontend
npm -w packages/frontend run ci:check   # lint + typecheck + format
npm -w packages/frontend test           # 407 tests

# Backend
npm -w packages/backend run lint:check
npm -w packages/backend run build
npm -w packages/backend test            # 238 tests

# Or run everything at once
npm run ci:all && npm run test:all
```

### 5. Push and open a PR

```bash
git push -u origin feat/issue-description
```

Create a PR targeting `main` with:
- A clear title following Conventional Commits format
- A summary of what changed and why
- A checklist of acceptance criteria
- `Closes #<issue-number>` in the body

### 6. Wait for review

- CI must pass (GitHub Actions runs automatically)
- At least one reviewer must approve
- Address review comments before merging

---

## Code Style

### TypeScript

- Strict mode enabled everywhere
- **No `any` type** — ever
- **Named exports only** — no default exports for screens, use-cases, or API modules
- `interface` for object shapes, `type` for unions and utility types

### Frontend (React Native / Expo)

- **Clean Architecture**: domain -> application -> data -> presentation
- `StyleSheet.create()` for all styles — no inline style objects
- Design tokens from `packages/frontend/src/core/theme/` — never hardcode colors, spacing, or fonts
- TanStack Query for data fetching (no `useState + useEffect` for remote data)
- Path alias: `@/*` maps to `src/*`

### Backend (NestJS)

- TypeORM for database access
- DTOs with `class-validator` decorators for request validation
- Standardized response format: `{ success, statusCode, message, data }`

### Import Order

1. React / React Native
2. Expo / third-party libraries
3. Internal `@/core/...`
4. Internal `@/features/...`
5. Relative imports

---

## Testing

Tests are mandatory for every new feature.

| Package | Test framework | Location |
|---------|---------------|----------|
| Frontend | Jest + @testing-library/react-native | `src/features/<feature>/presentation/__tests__/` |
| Frontend | Jest (unit) | `src/features/<feature>/application/__tests__/` |
| Backend | Jest | `src/**/*.spec.ts` and `test/**/*.e2e-spec.ts` |

```bash
# Run specific test file
npm -w packages/frontend test -- path/to/test.ts

# Run with coverage
npm -w packages/frontend run test:coverage
npm -w packages/backend run test:cov
```

---

## PR Checklist

Before requesting review, verify:

- [ ] Branch is up to date with `main`
- [ ] `npm run ci:all` passes (lint + typecheck + format)
- [ ] `npm run test:all` passes (all tests green)
- [ ] No `any` types introduced
- [ ] No inline styles introduced
- [ ] No hardcoded colors, spacing, or font values
- [ ] PR title follows Conventional Commits format
- [ ] PR body includes `Closes #<issue-number>`

---

## Project Structure

```
brasse-bouillon/
  packages/
    frontend/         Expo SDK 54 + Router v6 + TypeScript
      src/
        core/           Shared: auth, http client, theme, UI primitives
        features/       Feature modules (auth, recipes, batches, tools...)
          <feature>/
            domain/       Types and interfaces only
            data/         API calls
            application/  Use-cases (business logic)
            presentation/ Screens and components
      app/              Expo Router file-based routes
    backend/          NestJS 11 + TypeORM + SQLite
      src/              Application source code
      test/             E2E tests
    website/          Static marketing site
  docs/               Project documentation
  _archive/           Pre-monorepo code (preserved for reference)
  .github/workflows/  CI/CD pipelines
```

---

## Useful Links

- [Frontend conventions (CLAUDE.md)](packages/frontend/CLAUDE.md)
- [Design system](packages/frontend/docs/design-system.md)
- [Definition of Done](docs/project-management/definition-of-done.md)
- [Definition of Ready](docs/project-management/definition-of-ready.md)
- [Sprint structure](docs/project-management/sprint-definition.md)
