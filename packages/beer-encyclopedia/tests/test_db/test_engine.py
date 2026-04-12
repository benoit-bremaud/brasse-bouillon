"""Behavior tests for the async engine factory and session dependency."""

from __future__ import annotations

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from db.engine import (
    create_engine,
    create_session_factory,
    dispose_engine,
    get_db,
    get_engine,
    get_session_factory,
)


@pytest.fixture
def sqlite_url() -> str:
    return "sqlite+aiosqlite:///:memory:"


async def test_create_engine_returns_async_engine(sqlite_url: str) -> None:
    engine = create_engine(sqlite_url)
    try:
        assert isinstance(engine, AsyncEngine)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            assert result.scalar_one() == 1
    finally:
        await engine.dispose()


async def test_session_factory_opens_and_closes_session(sqlite_url: str) -> None:
    engine = create_engine(sqlite_url)
    factory = create_session_factory(engine)
    try:
        async with factory() as session:
            assert isinstance(session, AsyncSession)
            result = await session.execute(text("SELECT 42"))
            assert result.scalar_one() == 42
    finally:
        await engine.dispose()


async def test_get_engine_is_memoized(monkeypatch: pytest.MonkeyPatch, sqlite_url: str) -> None:
    monkeypatch.setenv("DATABASE_URL", sqlite_url)
    await dispose_engine()
    try:
        first = get_engine()
        second = get_engine()
        assert first is second
    finally:
        await dispose_engine()


async def test_dispose_engine_resets_state(
    monkeypatch: pytest.MonkeyPatch, sqlite_url: str
) -> None:
    monkeypatch.setenv("DATABASE_URL", sqlite_url)
    await dispose_engine()
    get_engine()
    await dispose_engine()
    # A fresh call rebuilds the engine cleanly.
    rebuilt = get_engine()
    try:
        assert isinstance(rebuilt, AsyncEngine)
    finally:
        await dispose_engine()


async def test_get_db_yields_active_session(
    monkeypatch: pytest.MonkeyPatch, sqlite_url: str
) -> None:
    monkeypatch.setenv("DATABASE_URL", sqlite_url)
    await dispose_engine()
    try:
        agen = get_db()
        session = await agen.__anext__()
        try:
            assert isinstance(session, AsyncSession)
            result = await session.execute(text("SELECT 7"))
            assert result.scalar_one() == 7
        finally:
            # Close the generator so the session context manager exits cleanly.
            with pytest.raises(StopAsyncIteration):
                await agen.__anext__()
    finally:
        await dispose_engine()


def test_session_factory_requires_prior_engine_or_initializes(
    monkeypatch: pytest.MonkeyPatch, sqlite_url: str
) -> None:
    monkeypatch.setenv("DATABASE_URL", sqlite_url)
    # Without running the async teardown, we just check that requesting the
    # factory does not explode when called before ``get_engine``.
    factory = get_session_factory()
    assert factory is not None
