"""Slug generation helpers for CRUD handlers.

Given a user-supplied display name, produce a slug that is safe for URLs
and unique within the target table. Uniqueness is enforced by appending a
short numeric suffix when a collision is detected (``-2``, ``-3``, ...).

Two concurrent creates with the same display name can still race between
the read (``_slug_exists``) and the insert (``session.commit``) — the DB
unique constraint is the final arbiter. ``create_with_unique_slug``
retries on ``IntegrityError`` so the race surfaces as a successful create
with a suffixed slug instead of a 500.
"""

from __future__ import annotations

from slugify import slugify
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
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


async def create_with_unique_slug[T](
    session: AsyncSession,
    *,
    model_cls: type[T],
    slug_column: InstrumentedAttribute[str],
    name: str,
    attributes: dict[str, object],
    max_retries: int = 3,
) -> T:
    """Create ``model_cls`` with a unique slug, retrying on races.

    If two concurrent requests pass ``build_unique_slug`` with the same
    candidate, the DB unique constraint will raise ``IntegrityError`` on
    one of them. We rollback and try again; ``build_unique_slug`` will
    now see the newly-committed row and pick a suffix.
    """

    last_error: IntegrityError | None = None
    for _ in range(max_retries):
        slug = await build_unique_slug(session, column=slug_column, name=name)
        instance = model_cls(slug=slug, **attributes)  # type: ignore[call-arg]
        session.add(instance)
        try:
            await session.commit()
        except IntegrityError as exc:
            last_error = exc
            await session.rollback()
            continue
        await session.refresh(instance)
        return instance
    assert last_error is not None
    raise last_error


async def _slug_exists(
    session: AsyncSession,
    column: InstrumentedAttribute[str],
    value: str,
) -> bool:
    stmt = select(column).where(column == value).limit(1)
    return (await session.execute(stmt)).scalar_one_or_none() is not None
