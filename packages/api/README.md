# Brasse-Bouillon Backend

NestJS API for the **Brasse-Bouillon** application (homebrewing assistant), with JWT authentication, user management, equipment profiles, recipes, brewing batches, and fermentation reminders.

## Quick start from the monorepo root

If you cloned the whole monorepo (recommended), two commands are enough:

```bash
make setup     # idempotent: creates packages/api/.env (with a fresh
               # JWT_SECRET) only if missing. Existing .env files are
               # left untouched.
make dev-api   # starts NestJS in watch mode at http://<LAN-IP>:3000
```

Equivalent npm invocation: `npm run dev:api` (runs `npm -w packages/api run start:dev`). Swagger UI: <http://localhost:3000/api>.

The rest of this README covers the standalone package (env strategy, Docker, migrations) and applies whether you run via `make`, `npm -w`, or from inside `packages/api/` directly.

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

General workflow (templates, file precedence, secrets policy): see [root README § Environment Variables](../../README.md#environment-variables). This section lists the API-specific variables.

### Quick start

```bash
make setup                                  # from monorepo root
# or
cp packages/api/.env.example packages/api/.env
# then edit packages/api/.env: set JWT_SECRET via `openssl rand -hex 32`
```

### Variables

| Variable                   | Required | Default                          | Description                                                                  |
| -------------------------- | -------- | -------------------------------- | ---------------------------------------------------------------------------- |
| `APP_ENV`                  | ✅       | `development`                    | App context: `development` \| `test` \| `production`. Must match `NODE_ENV`. |
| `NODE_ENV`                 | ✅       | derived from `APP_ENV`           | Node runtime mode.                                                           |
| `JWT_SECRET`               | ✅       | —                                | JWT signing secret (min. 24 chars). Generate with `openssl rand -hex 32`.    |
| `JWT_EXPIRATION`           | No       | `86400s`                         | Access-token lifetime.                                                       |
| `PORT`                     | No       | `3000`                           | HTTP port.                                                                   |
| `DATABASE_PATH`            | No       | `./data/brasse-bouillon.db`      | SQLite file. In Docker: `/app/data/brasse-bouillon.db`.                      |
| `TYPEORM_LOGGING`          | No       | `true` in dev, `false` elsewhere | Echo SQL to stdout.                                                          |
| `SWAGGER_ENABLED`          | No       | `true` in dev, `false` elsewhere | Expose Swagger UI at `/api`.                                                 |
| `HUBEAU_TIMEOUT_MS`        | No       | `8000`                           | HTTP timeout for the Hubeau water-quality API.                               |
| `HUBEAU_CACHE_TTL_SECONDS` | No       | `3600`                           | In-memory cache TTL for Hubeau responses.                                    |
| `API_IMAGE_TAG`            | No       | `latest`                         | Docker image tag (used by `docker-compose.yml`, not the runtime).            |

`APP_ENV` and `NODE_ENV` must agree (`development`↔`development`, `test`↔`test`, `production`↔`production`); the app refuses to start otherwise. Validation logic: [src/config/environment.config.ts](src/config/environment.config.ts).

### Templates

| File                  | When to use                                                  |
| --------------------- | ------------------------------------------------------------ |
| `.env.example`        | Local dev.                                                   |
| `.env.test.example`   | Override test values beyond what `npm test` injects (rare).  |
| `.env.docker.example` | Production-like Docker stack — read by `docker-compose.yml`. |

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
