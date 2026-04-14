"""FastAPI application module for the beer-encyclopedia HTTP layer.

Exposes a single module-level ``app`` instance (consumed by
``uvicorn api.main:app``) assembled from the routers under
``api/routers/``: ``scan`` (ML label scanning), ``styles`` (read-only
catalog), ``breweries`` and ``beers`` (full CRUD + fuzzy search). The
lifespan only handles graceful shutdown — the database engine is
initialized lazily on the first ``get_db()`` call (see ``db/engine.py``),
which keeps cold starts fast and lets tests inject in-memory engines
without forcing a real connection at import time.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.routers import beers, breweries, scan, styles
from db.engine import dispose_engine


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Application lifespan: yield immediately, dispose engine on shutdown."""

    try:
        yield
    finally:
        await dispose_engine()


app = FastAPI(
    title="Brasse-Bouillon Beer Encyclopedia API",
    version="0.4.0",
    description=(
        "Beer encyclopedia HTTP API: label scanning + recipe recommendation "
        "plus CRUD and fuzzy search over breweries, beers, and styles."
    ),
    lifespan=lifespan,
)

app.include_router(scan.router)
app.include_router(styles.router)
app.include_router(breweries.router)
app.include_router(beers.router)
