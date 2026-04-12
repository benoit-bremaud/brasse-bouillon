"""Async SQLAlchemy engine and session factory.

Reads the connection string from the ``DATABASE_URL`` environment variable and
exposes a FastAPI-compatible ``get_db`` dependency that yields an AsyncSession.
"""

from __future__ import annotations

import os
from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

DEFAULT_DATABASE_URL = (
    "postgresql+asyncpg://beer_enc:beer_enc_dev@localhost:5432/beer_encyclopedia"
)


def _database_url() -> str:
    return os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)


def _echo_enabled() -> bool:
    return os.environ.get("DATABASE_ECHO", "false").lower() in {"1", "true", "yes"}


def create_engine(url: str | None = None, *, echo: bool | None = None) -> AsyncEngine:
    """Create a fresh AsyncEngine.

    Exposed as a factory (not a module-level singleton) so tests can create
    isolated engines and the application can swap URLs between runs.
    """

    resolved_url = url if url is not None else _database_url()
    resolved_echo = echo if echo is not None else _echo_enabled()
    return create_async_engine(resolved_url, echo=resolved_echo, future=True)


def create_session_factory(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """Lazy-initialize and return the process-wide async engine."""

    global _engine, _session_factory
    if _engine is None:
        _engine = create_engine()
        _session_factory = create_session_factory(_engine)
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    if _session_factory is None:
        get_engine()
    assert _session_factory is not None
    return _session_factory


async def dispose_engine() -> None:
    """Dispose the process-wide engine and reset module state."""

    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


async def get_db() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency yielding a scoped AsyncSession."""

    factory = get_session_factory()
    async with factory() as session:
        yield session
