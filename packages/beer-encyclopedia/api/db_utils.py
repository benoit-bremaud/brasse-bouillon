"""Shared DB-dialect helpers used across routers."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession


def is_postgres(session: AsyncSession) -> bool:
    """Return True when the session is bound to a PostgreSQL engine.

    Used by search endpoints to branch between the ``pg_trgm`` trigram
    index (prod) and a case-insensitive substring fallback (SQLite tests).
    """
    return session.bind is not None and session.bind.dialect.name == "postgresql"
