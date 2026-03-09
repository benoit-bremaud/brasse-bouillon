# Environment and Secret Management Strategy

This document describes the official environment variable strategy for the **Brasse-Bouillon** backend.

## 1) Goals

- Clearly separate `development`, `test`, `staging`, and `production`
- Prevent any secret leaks into the Git repository
- Guarantee **fail-fast** startup when configuration is invalid
- Keep behavior consistent across local, CI, and server environments

## 2) Core Variables

Two variables structure runtime behavior:

- `APP_ENV`: application context (`development` | `test` | `staging` | `production`)
- `NODE_ENV`: Node runtime mode (`development` | `test` | `production`)

Required compatibility:

| APP_ENV | Expected NODE_ENV |
|---|---|
| `development` | `development` |
| `test` | `test` |
| `staging` | `production` |
| `production` | `production` |

> Note: `staging` intentionally runs with `NODE_ENV=production` to match production-like behavior.

## 3) Bootstrap Resolution

Bootstrap logic is centralized in `src/config/environment.config.ts`.

Rules:

1. If both `APP_ENV` and `NODE_ENV` are provided, compatibility is validated.
2. If only `APP_ENV` is provided, `NODE_ENV` is derived automatically.
3. If only `NODE_ENV` is provided, `APP_ENV` is inferred (`production` → `production`).
4. If neither is provided, fallback is `development/development`.

## 4) `.env` File Loading Order

Loading is hierarchical per environment:

- `development`: `.env.development.local` → `.env.development` → `.env.local` → `.env`
- `test`: `.env.test.local` → `.env.test` → `.env.local` → `.env`
- `staging`: `.env.staging.local` → `.env.staging` → `.env.local` → `.env`
- `production`: no `.env` file loaded (`ignoreEnvFile=true`)

## 5) Strict Validation (Joi)

Validation is applied via `ConfigModule.forRoot({ validationSchema })`.

- Required critical variables: `APP_ENV`, `NODE_ENV`, `JWT_SECRET`
- Explicit defaults for non-critical variables
- Boolean config validation through pattern (`true/false/1/0/yes/no/on/off`)
- Immediate startup failure when configuration is invalid

## 6) Versioned File Policy

Versioned example files:

- `.env.example`
- `.env.test.example`
- `.env.staging.example`

Real environment files ignored by Git:

- `.env`
- `.env.local`
- `.env.*.local`
- `.env.staging`, `.env.production`, etc.

## 7) Environment-Specific Rules

### Local (development)

- Copy `.env.example` to `.env.local`
- Use a strong local `JWT_SECRET`
- `SWAGGER_ENABLED=true` is allowed

### Test

- npm scripts inject `APP_ENV=test` and `NODE_ENV=test`
- `:memory:` DB is preferred for isolation
- No seeding in tests

### Staging

- `APP_ENV=staging`, `NODE_ENV=production`
- Secrets injected via CI/CD (never committed)
- `TYPEORM_SYNCHRONIZE=false`

### Production

- **No local `.env` files** on the host
- Variables injected at runtime (platform/CI/CD)
- Regular secret rotation

## 8) Secret Management

- Storage: GitHub Environments + GitHub Secrets
- Standard rotation: quarterly
- Immediate rotation: incident/suspicion
- Operational reference: `docs/secret-incident-runbook.md`

## 9) Operational Checklist

Before merging any PR that changes configuration:

- [ ] `npm run lint:check`
- [ ] `npm run build`
- [ ] `npm run test`
- [ ] README and docs aligned with actual variables
- [ ] No real secrets in versioned files
