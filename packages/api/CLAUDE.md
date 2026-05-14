# CLAUDE.md — brasse-bouillon-backend

## Project Overview

**Name:** Brasse Bouillon — Backend API
**Stack:** NestJS 11 + TypeORM + SQLite + TypeScript (strict) + Jest
**Domain:** Homebrewing platform — recipes, batches, ingredients catalogues, beer scan, label drafts, water profiles, equipment templates
**Consumers:** mobile-app (React Native) and beer-encyclopedia (Python FastAPI, ADR-0005 fallback)
**Auth:** JWT via `@nestjs/passport` + `@nestjs/jwt`
**Tests:** Jest unit + e2e (in-memory SQLite, migrations run, synchronize off)

## Response Envelope

Every controller response is wrapped by a global interceptor as:

```json
{ "success": true, "statusCode": 200, "message": "...", "data": { ... } }
```

The mobile HTTP client (`packages/mobile-app/src/core/http/http-client.ts`) auto-unwraps `data`. Never bypass the envelope. Errors flow through the global exception filter and produce the same shape with `success: false`.

## Module Structure

```
src/
  auth/                → Sign in, sign up, JWT strategy, password reset, guards
  batch/               → Brewing batch tracking (steps, narratives, demo seed)
  beer-contribution/   → Community contributions to the beer catalogue
  catalog/             → Reference catalogues (hops, fermentables, yeasts, styles, mash, water, equipment, misc, producers, distributors)
  common/              → constants, dto, enums, exceptions, filters, interceptors (response envelope, logging)
  config/              → @nestjs/config schema, env validation
  database/            → data-source.ts, migrations/, seeders
  equipment/           → User equipment profiles
  label/               → Label draft generation
  recipe/              → Recipe CRUD, ingredients, steps, import (BeerXML / BeerJSON), catalog lookup
  scan/                → Barcode + label panoramic scan endpoints (with beer-encyclopedia fallback)
  user/                → User profile management
  water/               → Brewing water profile calculator
  main.ts              → Bootstrap, global pipes, filters, interceptors
```

### Inside each feature module

- `<feature>.module.ts` — provider registration
- `<feature>.controller.ts` — HTTP routing, decorated DTOs, `@nestjs/swagger`
- `<feature>.service.ts` (and optional sub-services like `recipe-import.service.ts`)
- `dto/` — request/response shapes, validated via `class-validator`
- `entity/` (or `entities/`) — TypeORM entities
- `*.spec.ts` colocated with implementation — H/S/E unit tests (Happy / Sad / Edge)

## Database

- **TypeORM data source:** `src/database/data-source.ts`
- **Migrations folder:** `src/database/migrations/` (timestamp-prefixed, e.g. `1791000000000-AddProducersAndCatalogueFks.ts`)
- **Migration commands:**
  - `npm run migration:create` — empty migration file
  - `npm run migration:generate` — generate from entity diff
  - `npm run migration:run` — apply pending migrations
  - `npm run migration:revert` — revert the last migration
- **Synchronize is OFF in test and prod.** E2E tests run migrations explicitly (`TYPEORM_MIGRATIONS_RUN=true`).
- **SQLite path** comes from `DATABASE_PATH` env var. Production uses a persistent path; tests use `:memory:`.

## Auth & Guards

- JWT secret from `JWT_SECRET`, expiration from `JWT_EXPIRATION` (default `86400s`).
- Use the `@UseGuards(JwtAuthGuard)` pattern (or the route-level `@Public()` decorator if exposing an endpoint).
- Throttling via `@nestjs/throttler` is wired globally; per-route overrides via `@Throttle()`.
- Password reset flow stores reset tokens on the `User` entity (see migration `1778000000000-AddPasswordResetFieldsToUser.ts`).

## Coding Conventions

### TypeScript

- Strict mode is ON — never use `any`. Type explicitly.
- `interface` for object shapes (DTO bodies, repository contracts).
- `type` for unions, mapped types, utility types.
- Named exports only — no default exports for controllers, services, modules, DTOs.

### DTOs

- All input DTOs validated with `class-validator` decorators (`@IsString()`, `@IsEnum()`, `@IsOptional()`, etc.).
- DTOs live in `dto/` next to the feature module.
- Output DTOs / view models follow the same naming convention.

### Services

- Inject repositories via `@InjectRepository(EntityName)`.
- Never use raw SQL outside repository / query-builder methods. No string concatenation for SQL.
- Throw domain-specific exceptions from `src/common/exceptions/` rather than generic `HttpException`.

### Imports

1. NestJS (`@nestjs/*`)
2. Third-party libraries
3. Internal `src/common/...`
4. Internal feature-local
5. Relative imports

## Testing

Tests are **mandatory for every new feature**. Convention is **H/S/E** (memory `feedback_test_happy_sad_edge.md`):

- **Happy path** — the nominal scenario
- **Sad path** — expected error cases (validation failures, missing entities, unauthorised access)
- **Edge cases** — boundary inputs, empty collections, concurrent writes, etc.

```bash
npm test               # all unit tests
npm run test:cov       # with coverage
npm run test:e2e       # e2e suite (in-memory DB, migrations applied)
npm run test:watch     # watch mode
```

E2E tests use `test/jest-e2e.json`, run with `--runInBand`, and rely on environment variables defined in the `test` and `test:e2e` scripts of `package.json`.

## CI Check (must pass before every PR)

```bash
npm run lint:check     # ESLint
npm run build          # nest build
npm run test:cov       # unit tests + coverage
```

The coverage artifact is consumed by SonarQube in CI.

## Environment Variables

`.env.example` is the source of truth. Required variables:

```bash
APP_ENV=development
NODE_ENV=development
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRATION=86400s
PORT=3000
DATABASE_PATH=./data/brasse-bouillon.db
```

Never commit `.env`. Never edit `.env.example` except to add a newly documented variable with a placeholder value.

## Architecture Decision Records — mandatory reading

Before touching any module, read the accepted ADRs under [docs/architecture/decisions/](../../docs/architecture/decisions/):

- **ADR-0001** — Build for today, design for tomorrow: 5-clause rule, 4 forbidden anti-patterns, 3 tolerated exceptions
- **ADR-0002** — Centralized NestJS backend for all external data sources: mobile talks only to this API; external services (Open Food Facts, beer-encyclopedia) are proxied here
- **ADR-0003** — Consent as a single source of truth: not directly enforced by the API, but consent-gated endpoints must respect the mobile-side store

Any diff that violates an ADR must be flagged in review (cite the ADR number and clause).

## Forbidden — Never Without Explicit User Request

### Config files — do not modify

- `nest-cli.json`, `tsconfig*.json`, `eslint.config.*`, `jest.config.*`, `test/jest-e2e.json`
- `.env`, `.env.example` (except to add a newly documented variable)

### Directories — never touch

- `node_modules/`, `dist/`, `.git/`, `data/`, `coverage/`

### Patterns — never introduce

- `any` TypeScript type
- Default exports for controllers, services, modules, or DTOs
- Raw SQL strings outside repository / query-builder methods
- Hardcoded secrets, tokens, or credentials
- Direct calls to third-party HTTP services from controllers (proxy through a dedicated service module — ADR-0002)
- Skipping the response envelope (every controller method returns plain data; the interceptor wraps it)

## Project-local Claude tooling

- Subagent `pr-pre-reviewer` — local pre-push review in Copilot/Codex style; flags ADR violations and forbidden patterns. See [.claude/agents/pr-pre-reviewer.md](../../.claude/agents/pr-pre-reviewer.md).
