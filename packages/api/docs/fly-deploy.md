# Fly.io Deployment — Brasse-Bouillon API

Production host for the NestJS API. Single-region (Paris / `cdg`), SQLite persisted on a Fly Volume.

## Prerequisites

1. Install `flyctl`:
   ```bash
   curl -L https://fly.io/install.sh | sh
   # then add the printed export PATH=... line to ~/.zshrc if needed
   ```
2. Create a Fly account and log in:
   ```bash
   fly auth signup   # or: fly auth login
   ```
3. Add a payment method in the Fly dashboard. The current config stays inside the free / low-tier envelope (1× `shared-cpu-1x` 512 MB, 1 GB volume), but Fly now requires a card on file for all accounts.

## First-time setup

Run from `packages/api/` (the directory containing `fly.toml` and `Dockerfile`):

```bash
cd packages/api

# 1. Register the app name (no deploy yet, no config regenerate)
fly launch --no-deploy --copy-config --name brasse-bouillon-api --region cdg

# 2. Create the 1 GB volume that backs SQLite
fly volumes create bb_data --size 1 --region cdg

# 3. Set production secrets
fly secrets set \
  JWT_SECRET="$(openssl rand -hex 48)" \
  JWT_EXPIRATION=86400s

# 4. First deploy
fly deploy

# 5. Verify
fly status
curl https://brasse-bouillon-api.fly.dev/
fly logs
```

## What `fly.toml` encodes

| Setting | Value | Reason |
|---|---|---|
| `primary_region` | `cdg` (Paris) | French audience, low latency for demo |
| `[[mounts]]` | `bb_data` → `/app/data` | SQLite DB lives inside the volume; survives deploys |
| `DATABASE_PATH` | `/app/data/brasse-bouillon.db` | Absolute path on the volume |
| `SWAGGER_ENABLED` | `false` | Production hides schema; flip to `true` for debugging |
| `min_machines_running` | `1` | Always-on: avoids cold start during the 27 May live demo |
| `auto_stop_machines` | `false` | Same reason — predictable latency during soutenance |
| `vm.memory` | `512 mb` | Enough for NestJS + SQLite at expected load |

## Day-to-day operations

```bash
fly deploy                        # ship new code (from packages/api/)
fly logs                          # tail logs
fly ssh console                   # interactive shell on the running VM
fly ssh console -C "ls -la /app/data"  # inspect the volume
fly secrets list                  # list (names only) production secrets
fly machines list                 # see running machines
fly apps open                     # open dashboard in browser
```

Inspect the SQLite DB (requires `sqlite3` in the base image or install ad-hoc):

```bash
fly ssh console
apt-get update && apt-get install -y sqlite3  # one-off
sqlite3 /app/data/brasse-bouillon.db ".tables"
```

## Rotating secrets

```bash
fly secrets set JWT_SECRET="$(openssl rand -hex 48)"   # triggers restart
```

Existing JWTs become invalid after rotation — all users will be forced to re-login. Coordinate before running this.

## Rollback

```bash
fly releases                       # list past deploys
fly releases rollback <version>    # roll back to a previous image
```

## Pre-soutenance readiness checklist

Five days before 2026-05-27:

- [ ] `curl https://brasse-bouillon-api.fly.dev/` returns `200`
- [ ] `fly status` shows one machine in `started` state
- [ ] `fly logs` shows no recent errors
- [ ] `fly volumes list` confirms `bb_data` attached, size 1 GB, healthy
- [ ] Backup: `fly ssh console -C "cat /app/data/brasse-bouillon.db" > backup-$(date +%F).db`
- [ ] Record result in [PROJECT_LOG.md](../../../PROJECT_LOG.md)

## Known caveats

- **SQLite under concurrent writes**: `better-sqlite3` is synchronous and serialises writes. Fine for soutenance traffic; revisit for Postgres after the soutenance if multi-user load becomes real.
- **Secrets never land in `fly.toml`**: plaintext config only. All secrets go through `fly secrets set`.
- **Free-tier VM suspension**: disabled here (`auto_stop_machines = false`) to avoid cold-start during live demos. This costs slightly more than idling; acceptable until after the soutenance.
- **Single region**: no HA. If Paris has an outage during the demo, use the backup video (issue #533).
