"""FastAPI application factory for the beer-encyclopedia HTTP layer.

The app is built from the routers under ``api/routers/`` (currently only
``scan``; CRUD + search routers land in #546). The lifespan only handles
graceful shutdown — the database engine is initialized lazily on the first
``get_db()`` call (see ``db/engine.py``), which keeps cold starts fast and
lets tests inject in-memory engines without forcing a real connection at
import time.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.routers import scan
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
    version="0.3.0",
    description=(
        "Beer encyclopedia HTTP API: label scanning + recipe recommendation, "
        "with brewery/beer/style endpoints landing in a follow-up."
    ),
    lifespan=lifespan,
)

app.include_router(scan.router)
