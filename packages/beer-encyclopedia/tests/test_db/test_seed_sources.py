"""Behaviour tests for ``scripts/seed_sources.py``.

Mirrors the structure of ``test_seed_styles.py``: full population on a
blank DB, idempotence on re-run, field refresh on drift. Adds a
specific check that the ``openfoodfacts`` source is present after
seeding — this row is the FK target the OFF importer relies on.
"""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Source
from scripts.seed_sources import SOURCES, seed_sources

# --- Happy path ----------------------------------------------------------


async def test_seed_creates_full_catalog_on_empty_db(
    db_session: AsyncSession,
) -> None:
    created, updated = await seed_sources(db_session)

    assert created == len(SOURCES)
    assert updated == 0

    count = (
        await db_session.execute(select(func.count()).select_from(Source))
    ).scalar_one()
    assert count == len(SOURCES)


async def test_openfoodfacts_source_is_seeded(db_session: AsyncSession) -> None:
    await seed_sources(db_session)

    off = (
        await db_session.execute(
            select(Source).where(Source.name == "openfoodfacts")
        )
    ).scalar_one()
    assert off.source_type == "api"
    assert off.base_url == "https://world.openfoodfacts.org"


# --- Sad path ------------------------------------------------------------


async def test_seed_is_idempotent(db_session: AsyncSession) -> None:
    await seed_sources(db_session)

    created, updated = await seed_sources(db_session)
    assert created == 0
    assert updated == len(SOURCES)

    count = (
        await db_session.execute(select(func.count()).select_from(Source))
    ).scalar_one()
    assert count == len(SOURCES)


# --- Edge cases ----------------------------------------------------------


async def test_seed_updates_changed_fields_on_rerun(
    db_session: AsyncSession,
) -> None:
    await seed_sources(db_session)

    off = (
        await db_session.execute(
            select(Source).where(Source.name == "openfoodfacts")
        )
    ).scalar_one()
    off.base_url = "https://drifted.example.org"
    off.description = "drifted description"
    await db_session.commit()

    await seed_sources(db_session)
    refreshed = (
        await db_session.execute(
            select(Source).where(Source.name == "openfoodfacts")
        )
    ).scalar_one()
    assert refreshed.base_url == "https://world.openfoodfacts.org"
    assert "Open Food Facts" in refreshed.description
