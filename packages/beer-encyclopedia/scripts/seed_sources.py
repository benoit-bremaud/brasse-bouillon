"""Seed the ``sources`` registry with the external systems we ingest from.

Each row in ``sources`` is referenced by ``entity_sources.source_id``,
so an importer cannot persist its audit trail until the matching
``Source`` exists. This script ensures the canonical entries are in
place before any importer runs.

The script is idempotent: matching is performed by ``Source.name`` so
re-running updates the metadata of existing rows in place and inserts
only what is missing.
"""

from __future__ import annotations

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import create_engine, create_session_factory, get_database_url
from db.models import Source

# name, source_type, base_url, description
SourceSeed = tuple[str, str, str, str]

SOURCES: list[SourceSeed] = [
    (
        "openfoodfacts",
        "api",
        "https://world.openfoodfacts.org",
        "Open Food Facts — public, crowd-sourced food product database. "
        "Used as the primary external source to bootstrap the encyclopedia "
        "from product barcodes (EAN-8/12/13/14).",
    ),
]


async def seed_sources(session: AsyncSession) -> tuple[int, int]:
    """Upsert the source registry. Returns (created, updated)."""

    created = 0
    updated = 0

    for name, source_type, base_url, description in SOURCES:
        existing = (
            await session.execute(select(Source).where(Source.name == name))
        ).scalar_one_or_none()

        if existing is None:
            session.add(
                Source(
                    name=name,
                    source_type=source_type,
                    base_url=base_url,
                    description=description,
                )
            )
            created += 1
        else:
            existing.source_type = source_type
            existing.base_url = base_url
            existing.description = description
            updated += 1

    await session.commit()
    return created, updated


async def main() -> None:
    engine = create_engine(get_database_url())
    factory = create_session_factory(engine)
    try:
        async with factory() as session:
            created, updated = await seed_sources(session)
            print(f"Sources seeded: {created} created, {updated} updated.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
