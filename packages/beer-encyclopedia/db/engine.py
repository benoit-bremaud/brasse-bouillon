"""Async SQLAlchemy engine and session factory.

Reads the connection string from the ``DATABASE_URL`` environment variable and
exposes a FastAPI-compatible ``get_db`` dependency that yields an AsyncSession.
"""

from __future__ import annotations

import os
from collections.abc import AsyncIterator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Load .env once at import time so every entry point (FastAPI app, Alembic,
# pytest, ad-hoc scripts) shares the same configuration without each having to
# remember to call load_dotenv themselves.
load_dotenv()


class DatabaseConfigurationError(RuntimeError):
    """Raised when mandatory database configuration is missing."""


def get_database_url() -> str:
    """Return the configured DATABASE_URL or fail fast with a clear message."""

    url = os.environ.get("DATABASE_URL")
    if not url:
        raise DatabaseConfigurationError(
            "DATABASE_URL is not set. Copy .env.example to .env and fill it in, "
            "or export DATABASE_URL in your shell before starting the app."
        )
    return url


def _echo_enabled() -> bool:
    return os.environ.get("DATABASE_ECHO", "false").lower() in {"1", "true", "yes"}


def create_engine(url: str | None = None, *, echo: bool | None = None) -> AsyncEngine:
    """Create a fresh AsyncEngine.

    Exposed as a factory (not a module-level singleton) so tests can create
    isolated engines and the application can swap URLs between runs.
    """

    resolved_url = url if url is not None else get_database_url()
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
    if _session_factory is None:
        raise DatabaseConfigurationError(
            "Session factory could not be initialized — the engine setup likely failed."
        )
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
