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

# gcc is a safety net for any source-only dependency wheel (e.g. asyncpg on
# uncommon platforms). Removed from the final layer to keep the image lean.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

COPY . .

# Install the app + the SQLite async driver explicitly (aiosqlite ships in the
# `dev` extra; we want it in prod without pulling pytest/ruff). The heavy `ml`
# extra (YOLO/EasyOCR) is intentionally NOT installed — label OCR (UC5) is a
# later slice; this image serves the EAN / OpenFoodFacts path (UC4).
RUN pip install . "aiosqlite>=0.20"

EXPOSE 8080

# Apply migrations (idempotent) then serve. Shell form so `&&` is honoured;
# a failed migration exits the container and Fly restarts it.
CMD alembic upgrade head && uvicorn api.main:app --host 0.0.0.0 --port 8080
