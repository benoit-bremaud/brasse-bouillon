# Beer-encyclopedia (FastAPI) — production image for Fly.io.
#
# Runs on SQLite stored on a Fly volume (mounted at /app/data), mirroring
# the NestJS API's deployment pattern (ADR-0001 "build for today"). The
# Alembic migrations are verified SQLite-compatible (batch_alter_table,
# JSON-variant columns, no CREATE EXTENSION); `is_postgres()` runtime guards
# degrade pg_trgm search to a substring match on SQLite — acceptable for the
# current catalogue size, upgradeable to Postgres later (see ADR-0015 / #1175).
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

# No build toolchain: every runtime dependency (fastapi, uvicorn, sqlalchemy,
# alembic, asyncpg, aiosqlite, pydantic) ships a manylinux wheel for
# cp312-slim, so the image needs no compiler — keeping it lean and reducing
# the attack surface.
COPY . .

# Install the app + the SQLite async driver explicitly (aiosqlite ships in the
# `dev` extra; we want it in prod without pulling pytest/ruff). The heavy `ml`
# extra (YOLO/EasyOCR) is intentionally NOT installed — label OCR (UC5) is a
# later slice; this image serves the EAN / OpenFoodFacts path (UC4).
RUN pip install . "aiosqlite>=0.20"

EXPOSE 8080

# Boot sequence (all idempotent): apply migrations, then seed the catalogue
# the import path depends on — the `openfoodfacts` Source (a FK requirement
# for /beers/import-by-ean; without it the endpoint 503s on a fresh volume)
# and the Style rows (so OFF category → Style resolution actually links a
# `style_id` instead of silently staying null on a fresh volume). Then the
# curated corpus in FK order — breweries → beers (+ tasting profiles) →
# ingredients — so /beers/import-by-ean resolves known EANs from a direct DB
# hit. Finally `exec` uvicorn so it replaces the shell and runs as PID 1 —
# giving Fly's SIGTERM proper graceful-shutdown handling. A failed migration
# or seed exits the container and Fly restarts it. (Legal denominations stay a
# manual one-off seed; they are not on the scan/import hot path.)
CMD alembic upgrade head \
    && python scripts/seed_sources.py \
    && python scripts/seed_styles.py \
    && python scripts/seed_breweries.py \
    && python scripts/seed_beers.py \
    && python scripts/seed_ingredients.py \
    && exec uvicorn api.main:app --host 0.0.0.0 --port 8080
