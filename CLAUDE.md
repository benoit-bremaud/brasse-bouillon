# CLAUDE.md — brasse-bouillon-frontend

## Design System

See [docs/design-system.md](docs/design-system.md) for the complete graphic charter:
colors, typography, spacing, radius, component patterns (list screen, detail screen, hub screen), icon conventions, and accessibility rules.

**Core rule:** All screens must use design tokens from `src/core/theme/`. No hardcoded hex values, spacing, or font sizes.

---

## Project Overview

**Name:** Brasse Bouillon — Frontend
**Stack:** React Native + Expo SDK 54 + Expo Router v6 + TypeScript (strict)
**Domain:** Homebrewing app — recipes, batch tracking, brewing tools & academy
**Backend:** REST API (`brasse-bouillon-backend`) — responses wrapped as `{ success, statusCode, message, data }`, the HTTP client auto-unwraps `data`.
**Path alias:** `@/*` → `src/*` (configured in `tsconfig.json`, `jest.config.js`, `babel.config.js`)

## Key Directory Structure

```
app/              → Expo Router file-based routes (delegate immediately to src/features screens)
src/
  core/           → Shared: auth, http client, theme tokens, UI primitives, config, data-source toggle
  features/       → Feature modules (auth, recipes, batches, ingredients, tools, dashboard, shop…)
    <feature>/
      domain/       → Types / interfaces only (no logic, no imports from other layers)
      data/         → API calls via src/core/http/http-client.ts (no business logic)
      application/  → Use-cases (business logic, orchestration of data layer)
      presentation/ → React Native screens & components
        __tests__/  → Component & use-case tests
  mocks/          → Demo data (used when EXPO_PUBLIC_USE_DEMO_DATA=true)
  types/          → Global TypeScript declarations
```

## Architecture Rules — Clean Architecture (strictly layered)

```
domain  ←  application  ←  data
                ↓
          presentation
```

- `domain/` — types/interfaces only. No logic, no cross-layer imports.
- `data/` — API calls using `src/core/http/http-client.ts`. No business logic.
- `application/` — use-cases only. Orchestrate data layer, apply business rules. No UI imports.
- `presentation/` — screens/components. Call use-cases only, never call `data/` directly.
- `app/` — Expo Router routes only. Delegate immediately to feature screens.

## Git Workflow

- Every task requires a new dedicated branch from `main`. No exceptions.
- Never commit directly to `main`. Never reuse branches for unrelated tasks.

| Type     | Pattern            | Example                        |
| -------- | ------------------ | ------------------------------ |
| Feature  | `feat/<scope>`     | `feat/color-calculator`        |
| Bug fix  | `fix/<scope>`      | `fix/srm-edge-case`            |
| Refactor | `refactor/<scope>` | `refactor/color-calculator-ux` |
| Chore    | `chore/<scope>`    | `chore/update-clinerules`      |
| Docs     | `docs/<scope>`     | `docs/readme-setup`            |

- Use **Conventional Commits** format: `<type>(<scope>): <short description>`
- Run `npm run ci:check` before any push.
- **Ask for explicit user validation before creating a PR.** Never merge without user approval.

## Workflow Order

**Before any code change:**

1. Present a complete plan: every file to create/modify, the approach, tradeoffs.
2. Wait for explicit approval before writing any code.

**After implementing:**

1. Run `npm run ci:check` (lint + typecheck + format:check).
2. Run `npm test` — all tests must pass.
3. Push and ask for user validation before creating the PR.

## State Management

- Migrating to **TanStack Query** (`useQuery`, `useMutation`) for all data-fetching.
- Do NOT introduce new `useState + useEffect` patterns for remote data.
- Existing patterns may remain until explicitly refactored.

## Data Source Toggle

- Always respect the `dataSource.useDemoData` pattern from `src/core/data/data-source.ts`.
- Use-cases must branch on `dataSource.useDemoData` before calling the real API.
- Never hardcode demo data outside `src/mocks/`.

## Environment Variables

```bash
EXPO_PUBLIC_API_URL          # Base URL of the backend API
EXPO_PUBLIC_USE_DEMO_DATA    # "true" to use mock data instead of live API
```

## Code Style & Naming

### TypeScript

- Strict mode is ON — never use `any`. Always type explicitly.
- `interface` for object shapes in `domain/`; `type` for unions, mapped types, utility types.
- Named exports only (no default exports for screens, use-cases, or API modules).

### Naming Conventions

| Element             | Convention             | Example                    |
| ------------------- | ---------------------- | -------------------------- |
| React components    | `PascalCase`           | `RecipesScreen`, `Badge`   |
| Functions / hooks   | `camelCase`            | `listRecipes`, `useRouter` |
| Constants           | `SCREAMING_SNAKE_CASE` | `MAX_BATCH_SIZE`           |
| Files (components)  | `PascalCase.tsx`       | `RecipeDetailsScreen.tsx`  |
| Files (logic/utils) | `kebab-case.ts`        | `recipes.use-cases.ts`     |
| Test files          | `*.test.ts/tsx`        | `RecipesScreen.test.tsx`   |

### Styling

- Always use `StyleSheet.create()` — no inline style objects.
- Always use design tokens from `src/core/theme/` — never hardcode colors, spacing, or fonts.

### Import Order

1. React & React Native
2. Expo / third-party libraries
3. Internal `@/core/...`
4. Internal `@/features/...`
5. Relative imports

## Testing

Tests are **mandatory for every new feature**.

- Use-cases → unit tests in `src/features/<feature>/application/__tests__/`
- Screens/components → integration tests in `src/features/<feature>/presentation/__tests__/`
- Use `@testing-library/react-native` for component tests.
- Mock the use-case layer when testing presentation (never test real HTTP calls).

```bash
npm test                   # run all tests
npm test -- --watch        # watch mode
npm test -- <path>         # run a specific test file
npm run test:coverage      # generate coverage report
```

## CI Check (must pass before every PR)

```bash
npm run ci:check   # lint + typecheck + format:check
npm test           # all tests green
```

## Forbidden — Never Without Explicit User Request

### Config files — do not modify

- `eslint.config.js`, `tsconfig.json`, `babel.config.js`, `jest.config.js`, `jest.setup.ts`, `app.json`, `.env`, `.env.example`

### Directories — never touch

- `node_modules/`, `.expo/`, `.git/`

### Patterns — never introduce

- `any` TypeScript type
- Default exports for screens, use-cases, or API modules
- Direct `fetch()` calls outside `src/core/http/http-client.ts`
- Business logic inside `app/` route files
- Hardcoded colors, spacing, or font values (use theme tokens)
