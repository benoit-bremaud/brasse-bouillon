"""Slug generation helpers for CRUD handlers.

Given a user-supplied display name, produce a slug that is safe for URLs
and unique within the target table. Uniqueness is enforced by appending a
short numeric suffix when a collision is detected (``-2``, ``-3``, ...).
"""

from __future__ import annotations

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import InstrumentedAttribute


async def build_unique_slug(
    session: AsyncSession,
    *,
    column: InstrumentedAttribute[str],
    name: str,
    max_length: int = 255,
) -> str:
    """Return a slug based on ``name`` that does not exist in ``column``."""

    base = slugify(name)[:max_length] or "item"
    candidate = base
    suffix = 2
    while await _slug_exists(session, column, candidate):
        # Reserve room for the "-N" suffix without blowing past max_length.
        trailer = f"-{suffix}"
        candidate = f"{base[: max_length - len(trailer)]}{trailer}"
        suffix += 1
    return candidate


async def _slug_exists(
    session: AsyncSession,
    column: InstrumentedAttribute[str],
    value: str,
) -> bool:
    stmt = select(column).where(column == value).limit(1)
    return (await session.execute(stmt)).scalar_one_or_none() is not None
