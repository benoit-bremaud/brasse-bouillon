# Brasse-Bouillon Backend — Technical Audit

> **Date**: 2026-02-18  
> **Audited commit**: `ca90768` (PR #30 merged)  
> **Auditor**: Cline AI (assistant)  
> **Scope**: Repository `benoit-bremaud/brasse-bouillon-backend`

---

## 1. Architecture Overview

### Technical Stack
| Item | Version / Choice |
|---|---|
| Runtime | Node.js 20 (`>=20 <21`) |
| Framework | NestJS 11 |
| Language | TypeScript 5.7 (strict) |
| ORM | TypeORM 0.3 |
| DB (dev/test) | SQLite via `better-sqlite3` |
| DB (production target) | PostgreSQL (not migrated yet) |
| Auth | JWT + Passport (`passport-jwt`) |
| Validation | `class-validator` + `class-transformer` |
| API docs | Swagger/OpenAPI (`@nestjs/swagger`) |
| Containerization | Multi-stage Docker (`node:20-bookworm-slim`) |
| CI | GitHub Actions |
| CD | GHCR (GitHub Container Registry) |
| Code quality | Lint + tests + security audit in CI (SonarCloud planned) |

### Module-Based Architecture
The project follows a **Clean Architecture** approach by feature module:

```
src/
  auth/          <- JWT auth, guards, strategies, decorators
  user/          <- Users, profile, roles, dev seeding
  equipment/     <- Equipment profiles (owner-scoped CRUD)
  recipe/        <- Recipes + steps (ingredients still to implement)
  batch/         <- Batches, steps, fermentation, reminders
  database/      <- TypeORM config + migrations
  common/        <- Filters, interceptors, shared DTOs, enums
  config/        <- auth.config.ts, database.config.ts
```

Each module mostly follows this structure:
```
<module>/
  controllers/   <- Thin HTTP controllers
  services/      <- Application services (use-case layer)
  dtos/          <- Validated HTTP DTOs (class-validator)
  entities/      <- ORM entities (TypeORM, infrastructure)
  domain/
    entities/    <- Domain entities (pure TypeScript, zero framework dependency)
    enums/       <- Domain enums
    services/    <- Domain services (pure business logic)
```

---

## 2. Module Status

### 2.1 Auth (`/auth`)
| Endpoint | Status |
|---|---|
| `POST /auth/register` | ✅ Operational |
| `POST /auth/login` | ✅ Operational |
| `GET /auth/me` | ✅ Operational (JWT protected) |

**Notes:**
- Email/password validation with `class-validator` ✅
- No refresh token (out of MVP scope) ✅
- No login rate limiting yet (brute force risk — **TODO V1**) ⚠️
- `role` is not embedded in JWT payload (`sub: userId` only). Role is reloaded from DB in `JwtStrategy.validate()` -> acceptable but potential N+1 cost.

### 2.2 Users (`/users`)
| Endpoint | Status |
|---|---|
| `POST /users` (register) | ✅ Operational |
| `GET /users/me` | ✅ Operational |
| `PATCH /users/me` | ✅ Operational |
| `POST /users/me/change-password` | ✅ Operational |
| `GET /users/admin/list` | ✅ Admin only |
| `GET /users/:id` | ✅ Ownership enforced |
| `PUT /users/:id` | ✅ Ownership enforced |
| `DELETE /users/:id` | ✅ Ownership enforced |
| `POST /users/dev/seed-admin` | ✅ Gated (`SEED_ENDPOINTS_ENABLED`) |
| `POST /users/dev/seed-moderator` | ✅ Gated (`SEED_ENDPOINTS_ENABLED`) |

**Notes:**
- `console.log` is still used in the controller (unstructured logging). Acceptable in dev, should be replaced with NestJS `Logger` for production ⚠️
- `GET /users/:id` ownership behavior is now correct in code (`ForbiddenException` for non-owner/non-admin). The old discrepancy was documentation-related.
- `PUT /users/:id` and `PATCH /users/me` overlap functionally and can be simplified.

### 2.3 Equipment Profiles (`/equipment-profiles`)
| Endpoint | Status |
|---|---|
| `POST /equipment-profiles` | ✅ Operational |
| `GET /equipment-profiles` | ✅ Owner-scoped |
| `GET /equipment-profiles/:id` | ✅ Ownership enforced |
| `PATCH /equipment-profiles/:id` | ✅ Ownership enforced |
| `DELETE /equipment-profiles/:id` | ✅ Ownership enforced |

**Notes:**
- Domain validation through `EquipmentProfileDomainService.createProfile()` on create/update ✅
- No dedicated controller tests yet ⚠️

### 2.4 Recipes (`/recipes`)
| Endpoint | Status |
|---|---|
| `POST /recipes` | ✅ Operational |
| `GET /recipes` | ✅ Owner-scoped |
| `GET /recipes/:id` | ✅ Ownership enforced |
| `PATCH /recipes/:id` | ✅ Ownership enforced |
| `DELETE /recipes/:id` | ✅ FK guard (blocked when referenced by a batch) |
| `GET /recipes/:id/steps` | ✅ Lazy backfill of 5 default steps |
| `PATCH /recipes/:id/steps/:order` | ✅ Ownership enforced |

**Notes:**
- Ingredients (fermentables, hops, yeasts, water, additives) are **not implemented yet**: no dedicated migration, no ORM entities, no HTTP API ❌
- `RecipeOrmEntity` still has no `@OneToMany` relations to ingredient entities ❌
- Recipe deletion protection with FK checks is correct ✅
- No recipe controller tests yet ⚠️

### 2.5 Batches (`/batches`)
| Endpoint | Status |
|---|---|
| `POST /batches` | ✅ Start batch from recipe |
| `GET /batches` | ✅ Owner-scoped |
| `GET /batches/:id` | ✅ Ownership enforced |
| `POST /batches/:id/steps/current/complete` | ✅ Domain state machine |
| `POST /batches/:id/fermentation/start` | ✅ Operational |
| `POST /batches/:id/fermentation/complete` | ✅ Operational |
| `GET /batches/:id/reminders` | ✅ Ownership enforced |
| `POST /batches/:id/reminders` | ✅ Operational |
| `PATCH /batches/:id/reminders/:reminderId` | ✅ Operational |
| `DELETE /batches/:id` | ❌ Missing endpoint |

**Notes:**
- Batch domain state machine is isolated and tested ✅
- `completeMineCurrentStep` currently calls `stepRepo.save(stepPayloads)` for all steps in one transaction; this may recreate existing steps depending on driver behavior (potential PK conflicts). Needs review ⚠️
- Batch deletion endpoint is missing ❌

---

## 3. Database and Migrations

### Existing Migrations
| Migration | Content |
|---|---|
| `1739439600000-InitialSchema` | Tables: users, equipment_profiles, recipes, recipe_steps, batches, batch_steps, batch_reminders |

**Notes:**
- Migrations use `PRAGMA foreign_keys = OFF/ON` — correct for SQLite ✅
- Index naming follows convention (`IDX_<table>_<column>`) ✅
- FK naming follows convention (`FK_<table>_<column>`) ✅
- No ingredient/metrics migration at this stage ❌
- `updated_at` is managed by TypeORM `@UpdateDateColumn` (no DB trigger) — acceptable ✅
- No PostgreSQL migration path yet ❌

---

## 4. Tests

### Current Results (2026-02-18)
```
Test Suites: 1 skipped, 10 passed, 10 of 11 total
Tests:       2 skipped, 54 passed, 56 total
```

### Global Coverage
| Metric | Value |
|---|---|
| Statements | ~33% |
| Branches | ~31% |
| Functions | ~40% |
| Lines | ~32% |

### Existing Test Files
| File | Type | Coverage |
|---|---|---|
| `src/app.controller.spec.ts` | Unit | AppController (hello world) |
| `src/batch/batch.service.spec.ts` | Integration | BatchService (SQLite `:memory:`) |
| `src/batch/domain/batch.domain.spec.ts` | Unit | BatchDomainService |
| `src/equipment/domain/equipment-profile.domain.spec.ts` | Unit | EquipmentProfileDomainService |
| `src/recipe/recipe-steps.service.spec.ts` | Integration | RecipeService.ensureDefaultSteps |
| `src/recipe/domain/recipe-workflow.domain.spec.ts` | Unit | RecipeWorkflowService |
| `src/recipe/domain/recipe.domain.spec.ts` | Unit | RecipeDomainService |
| `src/user/controllers/user.controller.spec.ts` | Unit (mock) | UserController |
| `src/user/services/user.service.spec.ts` | Unit | UserService |
| `src/user/user.e2e-simple.spec.ts` | E2E | User flows |
| `src/user/user.e2e.spec.ts` | E2E | User flows (skipped) |
| `test/app.e2e-spec.ts` | E2E | App root |
| `test/auth.protected.e2e-spec.ts` | E2E | JWT auth guard |

### Testing Gaps
- ❌ No tests for `RecipeController`
- ❌ No tests for `EquipmentProfileController` and `EquipmentProfileService`
- ❌ No tests for `AuthController` and `AuthService` (except JWT guard coverage)
- ❌ No tests for `BatchController`
- ❌ No tests for `common/` module parts (filters, interceptors)

---

## 5. CI/CD

### CI Pipeline (`.github/workflows/ci.yml`)
| Job | Status |
|---|---|
| Build + Lint + Test | ✅ Operational |
| Security Audit (prod deps, critical only) | ✅ Operational |

**CI note:**
- No SonarCloud/SonarQube step is currently configured in `ci.yml` ⚠️

### CD Pipeline (`.github/workflows/cd-docker.yml`)
| Job | Status |
|---|---|
| Build + Push Docker image to GHCR | ✅ Operational (triggered after CI on `main`) |

### Copilot Review (`.github/workflows/copilot-review.yml`)
- Automatic Copilot review on every PR ✅

---

## 6. Security

### Authentication
- JWT HS256 with mandatory secret at startup (app fails fast if missing) ✅
- Expiration configurable with `JWT_EXPIRATION` (default `86400s`) ✅
- No refresh token (MVP scope decision) ✅
- Password hashing with bcrypt ✅

### Authorization
- Ownership enforced via `owner_id = user.id` on all protected resources ✅
- `RolesGuard` for admin routes ✅
- Dev seed endpoints gated by `SEED_ENDPOINTS_ENABLED` + optional `SEED_ENDPOINTS_TOKEN` ✅

### Dependencies
- `npm audit` critical vulnerabilities: ✅ clean (sqlite3 chain handled with tar override)
- `high`-level vulnerabilities may still exist (policy: CI gate at `critical` only)

### Exposure and Hardening
- Swagger disabled in production unless `SWAGGER_ENABLED=true` ✅
- Stack traces masked in production (`AllExceptionsFilter`) ✅
- No rate limiting on auth endpoints yet ⚠️ (**brute force risk — TODO**)
- `console.log` still logs user data in `UserController` ⚠️ (sensitive log risk)

---

## 7. Docker

### Image Setup
- Multi-stage build (build -> runtime) ✅
- Base image: `node:20-bookworm-slim` ✅
- Non-root runtime user (`USER node`) ✅
- Native `HEALTHCHECK` (HTTP fetch) ✅
- SQLite volume at `/app/data` ✅
- `NODE_ENV=production` by default ✅

### Notes
- Migrations can run at startup via `TYPEORM_MIGRATIONS_RUN=true` — acceptable ✅
- PostgreSQL migration will deprecate current SQLite volume data path; data migration strategy is required ⚠️

---

## 8. Recommended Priorities

### 🔴 Critical (MVP blockers)
1. **Ingredients foundation + CRUD API** — Add DB migration, ORM entities, and HTTP API (controllers/services/DTOs) for fermentables, hops, yeasts, water, additives under `/recipes/:id/fermentables`, `/recipes/:id/hops`, etc.
2. **TypeORM relations** — Add `@OneToMany` in `RecipeOrmEntity` toward ingredient entities once those entities exist.

### 🟠 Important (quality and robustness)
3. **Test coverage** — Reach >=60% (add recipe/equipment/batch controller tests and AuthService tests)
4. **SonarCloud** — Add CI integration (coverage upload + analysis) and configure `SONAR_TOKEN`
5. **Batch DELETE** — Add `DELETE /batches/:id` (owner-scoped, soft or hard delete)
6. **Rate limiting** — Add `@nestjs/throttler` to `/auth/login` and `/auth/register`

### 🟡 Planned improvements
7. **PostgreSQL migration** — Define strategy for SQLite -> PostgreSQL migration
8. **ABV/IBU calculators** — Add `calculator/` module with Tinseth service
9. **Swagger bearer alignment** — Replace `@ApiBearerAuth()` with `@ApiBearerAuth('JWT-auth')` where still needed
10. **Structured logging** — Replace `console.log` in `UserController` with NestJS `Logger`

### 🟢 Post-MVP
11. Refresh tokens
12. Social login
13. Offline sync API
14. Extended roles (Mentor/Editor/Pro)

---

## 9. Snapshot Metrics

| Metric | Value | Target |
|---|---|---|
| Passing tests | 54/56 | 100% |
| Statement coverage | ~33% | >=60% |
| Branch coverage | ~31% | >=60% |
| Critical npm vulnerabilities | 0 | 0 |
| Feature modules | 5 (auth, user, equipment, recipe, batch) | - |
| HTTP endpoints | ~30 | - |
| Migrations | 1 | - |
| Merged PRs | 30 | - |

---

## 10. Addendum (2026-03-09) — Label Workshop Lot 1

### Implemented Scope
- New backend `label/` feature scaffolded with Clean Architecture:
  - `controllers/`: `label-draft.controller.ts`, `label-catalog.controller.ts`, `label-defaults.controller.ts`
  - `services/`: `label-draft.service.ts`, `label-catalog.service.ts`, `label-defaults.service.ts`
  - `domain/enums/`: `LabelDraftStatus`, `BottleFormat`, `TemplateId`
  - `domain/entities/`: `LabelDraft`, `LabelEditableFields`, `LabelPreviewSnapshot`
  - `entities/`: `LabelDraftOrmEntity`
  - `label.module.ts`

- Database foundation added:
  - Migration `1775000000000-AddLabelDrafts.ts`
  - `label_drafts` table with CHECK constraints, named FKs, and named indexes
  - Soft delete ready via `deleted_at`
  - Optimistic concurrency ready via `version`

- Application wiring:
  - `LabelModule` imported in `AppModule`
  - `LabelDraftOrmEntity` added to `ormEntities` (`typeorm.config.ts`)

### Quality and Compliance
- Controllers are JWT protected (`@UseGuards(JwtAuthGuard)`) and documented with Swagger (`@ApiBearerAuth('JWT-auth')`, `@ApiTags('Labels')`).
- TypeScript build passes ✅ (`npm run build`)
- Targeted lint passes ✅ (`npm run lint:check ...`)
- Foundation module test added ✅ (`src/label/label.module.spec.ts`, SQLite in-memory)

### Status
- **Lot 1 completed** (module foundation + migration + wiring).
- Business routes/DTOs/use-cases remain for next lots (P0 CRUD, catalog/defaults, e2e/docs, hardening).

---

*Next audit recommended after ingredient foundation implementation (migration + ORM + API) and SonarCloud CI integration.*