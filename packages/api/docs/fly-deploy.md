# Fly.io Deployment — Brasse-Bouillon API

Production host for the NestJS API. Single-region (Paris / `cdg`), SQLite persisted on a Fly Volume.

## Prerequisites

1. Install `flyctl` and put it on `PATH`, so every command in this doc
   resolves to `fly` directly (no hard-coded absolute path needed):
   ```bash
   curl -L https://fly.io/install.sh | sh
   # The installer prints two `export` lines for FLYCTL_INSTALL and PATH —
   # append them to ~/.zshrc (or ~/.bashrc), then `source` it or open a
   # new shell. Verify with:
   fly version
   ```
   On Homebrew or a Linux package manager, follow the official install
   instructions — the rest of this doc only assumes `fly` is callable.
2. Create a Fly account and log in:
   ```bash
   fly auth signup   # or: fly auth login
   ```
3. Add a payment method in the Fly dashboard. The current config stays inside the free / low-tier envelope (1× `shared-cpu-1x` 512 MB, 1 GB volume), but Fly now requires a card on file for all accounts.

## First-time setup

The Dockerfile expects the **monorepo root** as build context (it copies the
root `package.json` + `package-lock.json` to install workspace dependencies),
so `fly deploy` must be invoked from the repo root with `--config` and
`--dockerfile` pointing at `packages/api/`.

```bash
# 0. From the monorepo root.
cd /path/to/brasse-bouillon

# 1. Register the app on your account (single-step, no boilerplate)
fly apps create brasse-bouillon-api

# 2. Create the 1 GB volume that backs SQLite (region must match fly.toml)
fly volumes create bb_data --size 1 --region cdg \
  --app brasse-bouillon-api --yes

# 3. Stage production secrets — applied on next deploy
fly secrets set JWT_SECRET="$(openssl rand -hex 32)" \
  --app brasse-bouillon-api --stage

# 4. First deploy (build context = monorepo root, remote builder)
fly deploy \
  --config packages/api/fly.toml \
  --dockerfile packages/api/Dockerfile \
  --remote-only \
  --app brasse-bouillon-api

# 5. Verify
fly status --app brasse-bouillon-api
curl https://brasse-bouillon-api.fly.dev/
fly logs --app brasse-bouillon-api
```

**Initial deployment confirmed on 2026-05-07** by `bbd.concept@gmail.com`,
machine `shared-cpu-1x:512MB` in `cdg`, volume `bb_data` 1 GB, public URL
`https://brasse-bouillon-api.fly.dev/` returning `{"success":true,"data":"Hello World!"}`.

## What `fly.toml` encodes

| Setting | Value | Reason |
|---|---|---|
| `primary_region` | `cdg` (Paris) | French audience, low latency for demo |
| `[[mounts]]` | `bb_data` → `/app/data` | SQLite DB lives inside the volume; survives deploys |
| `DATABASE_PATH` | `/app/data/brasse-bouillon.db` | Absolute path on the volume |
| `SWAGGER_ENABLED` | `false` | Production hides schema; flip to `true` for debugging |
| `min_machines_running` | `0` | Scale-to-zero: no traffic → no running machine → no machine-time billing |
| `auto_stop_machines` | `"stop"` | Fly's proxy stops the machine after a few idle minutes and auto-starts it on the next request (~10 s cold start measured — NestJS boot + migrations — acceptable pre-launch). Was `false`/`1` (always-on) until 2026-07-02 for the 27 May live demo |
| `vm.memory` | `512 mb` | Enough for NestJS + SQLite at expected load |

## Day-to-day operations

Every command runs from the **monorepo root**. The deploy command keeps
the same `--config` / `--dockerfile` flags as the first-time setup, so
the build context stays at the repo root (mandatory for the workspace
install in the Dockerfile).

```bash
# Ship new code
fly deploy \
  --config packages/api/fly.toml \
  --dockerfile packages/api/Dockerfile \
  --remote-only \
  --app brasse-bouillon-api

# Inspect / operate
fly logs           --app brasse-bouillon-api
fly status         --app brasse-bouillon-api
fly ssh console    --app brasse-bouillon-api                   # interactive shell on the running VM
fly ssh console    --app brasse-bouillon-api -C "ls -la /app/data"  # inspect the volume
fly secrets list   --app brasse-bouillon-api                   # list (names only) production secrets
fly machines list  --app brasse-bouillon-api                   # see running machines
fly apps open      --app brasse-bouillon-api                   # open dashboard in browser
```

Inspect the SQLite DB (requires `sqlite3` in the base image or install ad-hoc):

```bash
fly ssh console --app brasse-bouillon-api
apt-get update && apt-get install -y sqlite3  # one-off
sqlite3 /app/data/brasse-bouillon.db ".tables"
```

## Migrations & seeding in production

The flow is **deploy → migrate (automatic) → seed (on demand)**:

1. **Schema / migrations — automatic on boot.** The runtime TypeORM config sets
   `migrationsRun: true` (see `src/database/typeorm.config.ts`), so the app
   applies any pending migrations against the volume DB **every time it starts**.
   A plain `fly deploy` therefore brings both the code and the schema up to date —
   nothing extra to run.

2. **Seed data — run the seed CLI on the app machine.** The curated PUBLIC
   recipes (and the system curator user that owns them) are seeded by a compiled
   entrypoint shipped inside the image at `dist/database/seed-cli.js`. Run it on
   the **running app machine** (which has the volume mounted at `/app/data`):

   ```bash
   fly ssh console --app brasse-bouillon-api \
     -C "node dist/database/seed-cli.js"
   # logs: Production seed complete: {"systemUser":{...},"publicRecipes":{...}}
   ```

   It is **idempotent** (rows upsert by id), so it is safe to re-run after every
   deploy that changes the seed data.

> **Why not a `fly.toml` `release_command`?** Release-command machines run the
> new image **without the volume mounted**, so a SQLite-on-volume migrate/seed
> there would write to a throwaway database. Migrations already run at app boot,
> and the seed CLI runs on the app machine — both reach the real `/app/data` DB.
>
> **Why not `scripts/run-public-recipes-seed.ts`?** That script lives outside
> `src/`, is never copied into the runtime image, and runs via `ts-node` (a dev
> dependency pruned in production). `seed-cli.ts` lives in `src/`, compiles into
> `dist/`, and runs on plain `node`.

To verify the blonde (or any seed change) landed — both options run **on the app
machine** (the `/recipes/public` endpoint is JWT-guarded, so an unauthenticated
`curl` would `401`):

**Option 1 — re-run the seed CLI and read the `updated` counts:**

```bash
fly ssh console --app brasse-bouillon-api \
  -C "node dist/database/seed-cli.js"
```

**Option 2 — query the volume DB with sqlite3 (if installed on the machine):**

```bash
fly ssh console --app brasse-bouillon-api \
  -C "sqlite3 /app/data/brasse-bouillon.db \"SELECT name, batch_size_l FROM recipes WHERE name LIKE 'Blonde Facile%';\""
```

## Rotating secrets

```bash
fly secrets set JWT_SECRET="$(openssl rand -hex 48)" \
  --app brasse-bouillon-api    # triggers restart
```

Existing JWTs become invalid after rotation — all users will be forced to re-login. Coordinate before running this.

## Rollback

```bash
fly releases --app brasse-bouillon-api                    # list past deploys
fly releases rollback <version> --app brasse-bouillon-api # roll back to a previous image
```

## Pre-soutenance readiness checklist

Five days before 2026-05-27:

- [ ] `curl https://brasse-bouillon-api.fly.dev/` returns `200`
- [ ] `fly status --app brasse-bouillon-api` shows one machine in `started` state
- [ ] `fly logs --app brasse-bouillon-api` shows no recent errors
- [ ] `fly volumes list --app brasse-bouillon-api` confirms `bb_data` attached, size 1 GB, healthy
- [ ] Backup: `fly ssh console --app brasse-bouillon-api -C "cat /app/data/brasse-bouillon.db" > backup-$(date +%F).db`
- [ ] Record result in [PROJECT_LOG.md](../../../PROJECT_LOG.md)

## Known caveats

- **SQLite under concurrent writes**: `better-sqlite3` is synchronous and serialises writes. Fine for soutenance traffic; revisit for Postgres after the soutenance if multi-user load becomes real.
- **Secrets never land in `fly.toml`**: plaintext config only. All secrets go through `fly secrets set`.
- **Free-tier VM suspension**: disabled here (`auto_stop_machines = false`) to avoid cold-start during live demos. This costs slightly more than idling; acceptable until after the soutenance.
- **Single region**: no HA. If Paris has an outage during the demo, use the backup video (issue #533).
