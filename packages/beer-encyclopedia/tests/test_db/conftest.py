"""Fixtures shared across db/model tests.

Spins up an isolated SQLite database per test function, creates all tables
via ``Base.metadata.create_all`` (faster than running Alembic for each test),
and yields an active ``AsyncSession``. Dispose is guaranteed by the fixture
teardown so no state leaks between tests.
"""

from __future__ import annotations

from collections.abc import AsyncIterator

import pytest_asyncio
from sqlalchemy import event
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from db.models import Base


def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:  # type: ignore[no-untyped-def]
    """Activate FK constraint enforcement on SQLite connections.

    SQLite disables foreign-key support by default, which silently breaks
    ``ON DELETE CASCADE`` and ``ON DELETE SET NULL``. PostgreSQL (the
    production backend) always enforces these, so flipping the pragma on
    SQLite keeps test behavior aligned with prod.
    """

    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    # Attach per-engine so the pragma fires on every aiosqlite connection,
    # not only on the (unused) sync Engine base class.
    event.listen(engine.sync_engine, "connect", _enable_sqlite_foreign_keys)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    try:
        async with factory() as session:
            yield session
    finally:
        await engine.dispose()
