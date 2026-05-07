# Brasse-Bouillon Beer Encyclopedia API

Python 3.12 + FastAPI service (npm package `@brasse-bouillon/beer-encyclopedia`, package version **0.2.0**; the FastAPI `app.version` is temporarily set to 0.4.0 pending a version sync). Two complementary surfaces:

1. **Encyclopedia CRUD** — brewery/beer/style catalog with fuzzy search (since PR #552)
2. **Label scanner** — YOLOv8 detection + EasyOCR + recipe recommendation (MVP)

## HTTP API (v0.4.0)

Mounted in `api/main.py` (Swagger UI at `/docs`). 14 routes across three resources:

| Resource     | Routes                                                                                                                                            | Notes                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `/styles`    | `GET /` (list), `GET /{id}` (detail)                                                                                                              | Read-only                                |
| `/breweries` | `GET /` (list + filters: `country`, `city`, `brewery_type`), `GET /search?q=…`, `GET /{id}`, `POST /`, `PATCH /{id}`, `DELETE /{id}`              | Full CRUD + fuzzy search                 |
| `/beers`     | `GET /` (list + filters: `style_id`, `brewery_id`, `abv_min`, `abv_max`), `GET /search?q=…`, `GET /{id}`, `POST /`, `PATCH /{id}`, `DELETE /{id}` | Full CRUD + FK validation + fuzzy search |

Additional `/scan` endpoint from the ML pipeline (`POST /scan`) remains available.

### Search strategy

- **PostgreSQL (production):** `Resource.name.op('%')(q)` in `WHERE`, gated by `pg_trgm.similarity_threshold` (default 0.3). Uses the GIN trigram index created in migration 001. `similarity(name, q)` is only used in `ORDER BY` for ranking.
- **SQLite (tests):** case-insensitive substring match (`func.lower(name).contains(q.lower())`), alphabetical order.

Dialect detection is centralized in `api/db_utils.is_postgres(session)` — shared by both routers.

### Slug generation

User-facing URL slugs are derived from the display name via `python-slugify` and kept unique by `api/slug.create_with_unique_slug()`, which wraps the build + insert in a retry loop catching `IntegrityError` (rollback, re-pick with `-2` / `-3` suffix, up to 3 attempts). This closes the read-then-insert race between `build_unique_slug` and `commit` under concurrent creates with the same display name.

### Pagination envelope

Every list response uses the shared `PaginationMeta` envelope:

```json
{
  "items": [...],
  "meta": { "total": 42, "page": 1, "per_page": 20 }
}
```

Constants live in `api/schemas/common.py` (`DEFAULT_PAGE_SIZE=20`, `MAX_PAGE_SIZE=100`).

## MVP Goal (label scanner)

- Label detection (YOLOv8)
- Text extraction (EasyOCR)
- Top-3 recipe ranking based on style/ABV/IBU

## Project Structure

- `api/`: FastAPI layer — `main.py`, `dependencies.py`, `db_utils.py`, `slug.py`, `routers/` (`scan`, `styles`, `breweries`, `beers`), `schemas/`
- `ml/`: training, inference, OCR, extraction, recommendation
- `db/`: async SQLAlchemy engine + ORM models
- `migrations/`: Alembic migrations (async-aware env.py)
- `data/`: datasets and sample assets (`recipes.sample.json`)
- `scripts/`: utility scripts (scan demo)
- `docs/`: technical docs and roadmap
- `tests/`: automated tests (`tests/test_api/*` for HTTP, 64 passing as of v0.4.0)

## Quickstart

Full instructions: [docs/SETUP.md](docs/SETUP.md).

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e ".[ml,dev]"
cp .env.example .env
docker compose up -d          # Postgres (use psql or DBeaver to inspect)
alembic upgrade head
make -C ../.. dev-beer-enc     # → http://localhost:8000 (Swagger at /docs)
                               # binds 0.0.0.0 so a phone on LAN/Tailscale can reach it
```

## Environment Variables

General workflow (templates, file precedence, secrets policy): see [root README § Environment Variables](../../README.md#environment-variables). This section lists the beer-encyclopedia-specific variables.

### Quick start

```bash
make setup                                              # from monorepo root (recommended)
# or
cp packages/beer-encyclopedia/.env.example packages/beer-encyclopedia/.env
# then edit and replace every CHANGE_ME_* placeholder with a real value
```

`make setup` automatically generates a fresh `POSTGRES_PASSWORD` so the local `docker compose up -d` works out of the box.

### Variables

| Variable            | Required | Default                    | Description                                                                                                                                   |
| ------------------- | -------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `POSTGRES_DB`       | ✅       | `beer_encyclopedia`        | PostgreSQL database name. Read by `docker-compose.yml`.                                                                                       |
| `POSTGRES_USER`     | ✅       | —                          | PostgreSQL user. Read by `docker-compose.yml` and embedded in `DATABASE_URL`.                                                                 |
| `POSTGRES_PASSWORD` | ✅       | —                          | PostgreSQL password. Generated by `make setup`. Embedded in `DATABASE_URL`.                                                                   |
| `DATABASE_URL`      | ✅       | —                          | Full async SQLAlchemy connection string: `postgresql+asyncpg://<user>:<password>@localhost:5432/<db>`. The app fails fast at boot if missing. |
| `DATABASE_ECHO`     | No       | `false`                    | When `true`, every SQL statement is logged to stdout. Useful for debugging; never enable in production.                                       |
| `SCAN_RECIPES_PATH` | No       | `data/recipes.sample.json` | Path to the recipes catalog consumed by the `/scan` pipeline. Operator-only.                                                                  |
| `SCAN_MODEL_PATH`   | No       | unset                      | Optional trained YOLO checkpoint. Leave unset to fall back to full-image detection.                                                           |

### Inspecting the database

The `docker-compose.yml` exposes only PostgreSQL (port `5432`); there is **no web admin UI** in the stack. Inspect the database with:

- **`psql` CLI** — `docker exec -it beer-encyclopedia-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"`
- **DBeaver** (free, multi-DB) — connect to `localhost:5432` with the credentials from your `.env`
- **VS Code extension** — for example `cweijan.vscode-postgresql-client2`

## MVP Scan Pipeline

1. Detect label regions (YOLOv8 if a model is provided, full-image fallback otherwise)
2. Run OCR on detected regions
3. Extract structured fields (`name`, `style`, `abv`, `brewery`)
4. Return top-3 recipe recommendations with explainable scores

## Example

```bash
python scripts/run_scan_demo.py --image /path/to/beer-photo.jpg
```

## Roadmap

See `docs/ROADMAP.md`.

## Development Agent Governance

See `docs/AGENT.md` for the development-agent collaboration rules.

## Sprint 1 Dataset Assets

- Taxonomy: `docs/dataset/TAXONOMY_V1.md`
- Dataset strategy: `docs/dataset/DATASET_STRATEGY_SPRINT1.md`
- Legal collection playbook:
  `docs/dataset/LEGAL_COLLECTION_PLAYBOOK_V1.md`
- Annotation rules: `docs/dataset/ANNOTATION_GUIDELINES_V1.md`
- Execution plan: `docs/dataset/SPRINT1_EXECUTION_PLAN.md`
- Batch 1 operational workflow: `docs/dataset/BATCH1_WORKFLOW.md`
- Source registry template:
  `data/templates/dataset_manifest.template.csv`
- Dataset sanity check:

```bash
python scripts/dataset_sanity_check.py --dataset /absolute/path/to/dataset
```
