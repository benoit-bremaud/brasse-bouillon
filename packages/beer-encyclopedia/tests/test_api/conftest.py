"""Fixtures shared by the HTTP API tests.

Builds an in-memory SQLite database populated with all encyclopedia
tables, overrides the FastAPI ``get_db`` dependency to use it, and
yields a ``TestClient`` so tests can issue HTTP calls without touching
a real PostgreSQL instance.
"""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterator
from typing import Any

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import ConnectionPoolEntry

from api.dependencies import get_db
from api.main import app
from db.models import Base


def _enable_sqlite_foreign_keys(
    dbapi_connection: Any,
    _connection_record: ConnectionPoolEntry,
) -> None:
    """SQLAlchemy ``connect`` hook: enable FK enforcement on SQLite.

    ``dbapi_connection`` is the raw DB-API connection (``sqlite3.Connection``
    or equivalent) and is typed ``Any`` because the concrete class varies
    with the installed driver (aiosqlite wraps ``sqlite3``).
    """
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    event.listen(engine.sync_engine, "connect", _enable_sqlite_foreign_keys)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    try:
        async with factory() as session:
            yield session
    finally:
        await engine.dispose()


@pytest.fixture
def client(db_session: AsyncSession) -> Iterator[TestClient]:
    """TestClient wired to the in-memory session via dependency override."""

    async def _override_get_db() -> AsyncIterator[AsyncSession]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
