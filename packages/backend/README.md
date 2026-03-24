# Brasse-Bouillon Backend

NestJS API for the **Brasse-Bouillon** application (homebrewing assistant), with JWT authentication, user management, equipment profiles, recipes, brewing batches, and fermentation reminders.

## Main Features

- Authentication (`/auth`): login, register, current profile
- Users (`/users`): profile, password change, roles
- Equipment (`/equipment-profiles`): user-scoped CRUD
- Recipes (`/recipes`): CRUD + workflow steps
- Batches (`/batches`): start batch, step progression, fermentation, reminders
- Swagger documentation (enabled outside production, or via dedicated environment variable)

## Tech Stack

- **Node.js 20** + **NestJS 11**
- **TypeScript**
- **TypeORM**
- **SQLite (better-sqlite3)** by default
- **JWT / Passport** for security
- **Docker** (multi-stage image)

## Prerequisites

- Node.js `>=20 <21`
- npm
- Docker (for containerized execution)

## Environment Variables

The environment strategy is based on **2 core variables**:

- `APP_ENV`: application context (`development`, `test`, `staging`, `production`)
- `NODE_ENV`: Node runtime mode (`development`, `test`, `production`)

Compatibility rules:

- `APP_ENV=development` → `NODE_ENV=development`
- `APP_ENV=test` → `NODE_ENV=test`
- `APP_ENV=staging` → `NODE_ENV=production`
- `APP_ENV=production` → `NODE_ENV=production`

### `.env` File Loading Order

- `development`: `.env.development.local` → `.env.development` → `.env.local` → `.env`
- `test`: `.env.test.local` → `.env.test` → `.env.local` → `.env`
- `staging`: `.env.staging.local` → `.env.staging` → `.env.local` → `.env`
- `production`: **no `.env` file loaded** (`ignoreEnvFile=true`), runtime injection required

### Versioned Templates

- `.env.example`: local development baseline
- `.env.test.example`: test baseline
- `.env.staging.example`: staging (production-like) baseline

Important variables used by the API:

| Variable | Required | Default | Description |
|---|---|---|---|
| `APP_ENV` | ✅ Yes | `development` (bootstrap fallback) | Application context (`development`/`test`/`staging`/`production`) |
| `NODE_ENV` | ✅ Yes | derived from `APP_ENV` (bootstrap fallback) | Node runtime mode |
| `JWT_SECRET` | ✅ Yes | - | JWT secret (min. 24 characters) |
| `JWT_EXPIRATION` | No | `86400s` | Token lifetime |
| `PORT` | No | `3000` | API HTTP port |
| `DATABASE_PATH` | No | `./data/brasse-bouillon.db` | SQLite file path |
| `TYPEORM_MIGRATIONS_RUN` | No | `false` | Run migrations on startup |
| `TYPEORM_SYNCHRONIZE` | No | `false` | Auto schema sync (forbidden in staging/production) |
| `TYPEORM_LOGGING` | No | depends on environment | TypeORM logging |
| `SWAGGER_ENABLED` | No | depends on environment | Enable/disable Swagger |
| `SEED_ENDPOINTS_ENABLED` | No | `false` | Enable seed endpoints (development only) |
| `SEED_ENDPOINTS_TOKEN` | No | empty | Seed protection token |
| `WATER_PROVIDER_DEFAULT` | No | `hubeau` | Default water provider |
| `HUBEAU_BASE_URL` | No | Official Hubeau URL | Hubeau API base URL |
| `HUBEAU_TIMEOUT_MS` | No | `8000` | Water provider timeout |
| `HUBEAU_CACHE_TTL_SECONDS` | No | `3600` | Water provider cache TTL |
| `HUBEAU_MAX_SAMPLES` | No | `50` | Maximum number of samples |
| `HUBEAU_COMMUNES_UDI_SIZE` | No | `10` | Batch size for communes/UDI |
| `HUBEAU_RESULTATS_DIS_SIZE` | No | `100` | Batch size for distribution results |

## Run Locally (Without Docker)

1. Install dependencies:

```bash
npm ci
```

2. Create local configuration from the template:

```bash
cp .env.example .env.local
```

Minimal example:

```env
APP_ENV=development
NODE_ENV=development
JWT_SECRET=change-me-in-local
JWT_EXPIRATION=86400s
PORT=3000
DATABASE_PATH=./data/brasse-bouillon.db
TYPEORM_MIGRATIONS_RUN=true
TYPEORM_SYNCHRONIZE=false
SWAGGER_ENABLED=true
```

3. Start in development mode:

```bash
npm run start:dev
```

4. Verify:

- API: `http://localhost:3000/`
- Swagger UI: `http://localhost:3000/api`

## Run With Docker

### 1) Build the image

```bash
docker build -t brasse-bouillon-backend:local .
```

### 2) Run the container

```bash
docker run --rm \
  --name brasse-bouillon-api \
  -p 3000:3000 \
  -e JWT_SECRET=change-me-in-prod \
  -e JWT_EXPIRATION=86400s \
  -e TYPEORM_MIGRATIONS_RUN=true \
  -e SWAGGER_ENABLED=true \
  -v brasse-bouillon-data:/app/data \
  brasse-bouillon-backend:local
```

### Important Docker Notes

- `JWT_SECRET` is **required**, otherwise the app will not start.
- The `brasse-bouillon-data` volume persists the SQLite database (`/app/data`).
- In Docker image runtime, `NODE_ENV=production` by default (defined in `Dockerfile`).
- Swagger is disabled in production unless `SWAGGER_ENABLED=true`.

## Useful Commands

```bash
# Build TypeScript
npm run build

# Lint
npm run lint:check

# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Migrations
npm run migration:run
npm run migration:revert
```

## Project Structure (Quick View)

```text
src/
  auth/         # JWT auth, guards, strategies
  user/         # Users, profile, roles
  equipment/    # Equipment profiles
  recipe/       # Recipes and steps
  batch/        # Batches, fermentation, reminders
  database/     # TypeORM config + migrations
  common/       # Filters, interceptors, shared DTOs
```

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) for product vision and next steps.

## Additional Documentation

- [Environment Strategy](./docs/environment-strategy.md)
- [Secret Incident Runbook](./docs/secret-incident-runbook.md)
