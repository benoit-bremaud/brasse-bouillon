"""Seed the ``styles`` table with the core beer style catalog.

The 15 styles seeded here cover:
- The 8 slugs already recognized by the ML field extractor (ml/extract.py)
  so the scan pipeline can resolve its output to a persisted row.
- 7 additional mainstream styles frequently encountered on real labels
  (porter, pilsner, hefeweizen, dubbel, quadrupel, barleywine, blonde_ale).

This script is idempotent: running it multiple times updates existing rows
in place (matched by ``slug``) and inserts only what is missing.
"""

from __future__ import annotations

import asyncio
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import create_engine, create_session_factory, get_database_url
from db.models import Style

# name, slug, category, abv_min, abv_max, ibu_min, ibu_max, srm_min, srm_max
StyleSeed = tuple[
    str, str, str,
    Decimal | None, Decimal | None,
    int | None, int | None,
    int | None, int | None,
]

STYLES: list[StyleSeed] = [
    # -- already recognized by ml/extract.py ---------------------------------
    ("India Pale Ale", "ipa", "Ale", Decimal("5.5"), Decimal("7.5"), 40, 70, 6, 14),
    ("Lager", "lager", "Lager", Decimal("4.0"), Decimal("5.5"), 8, 25, 2, 6),
    ("Wheat Beer", "wheat", "Ale", Decimal("4.0"), Decimal("5.6"), 8, 20, 3, 9),
    ("Stout", "stout", "Ale", Decimal("4.0"), Decimal("7.0"), 25, 60, 30, 40),
    ("Amber Ale", "amber_ale", "Ale", Decimal("4.5"), Decimal("6.2"), 25, 45, 10, 17),
    ("Sour Ale", "sour", "Ale", Decimal("3.5"), Decimal("6.5"), 5, 25, 3, 20),
    ("Saison", "saison", "Ale", Decimal("5.0"), Decimal("7.0"), 20, 35, 5, 14),
    ("Belgian Tripel", "tripel", "Ale", Decimal("7.5"), Decimal("9.5"), 20, 40, 4, 7),

    # -- additional mainstream styles ----------------------------------------
    ("Porter", "porter", "Ale", Decimal("4.0"), Decimal("6.5"), 25, 50, 20, 35),
    ("Pilsner", "pilsner", "Lager", Decimal("4.2"), Decimal("5.5"), 25, 45, 2, 6),
    ("Hefeweizen", "hefeweizen", "Ale", Decimal("4.5"), Decimal("5.6"), 8, 15, 2, 6),
    ("Belgian Dubbel", "dubbel", "Ale", Decimal("6.0"), Decimal("7.6"), 15, 25, 10, 17),
    ("Belgian Quadrupel", "quadrupel", "Ale", Decimal("9.0"), Decimal("12.0"), 20, 35, 12, 22),
    ("Barleywine", "barleywine", "Ale", Decimal("8.0"), Decimal("12.0"), 40, 100, 10, 19),
    ("Blonde Ale", "blonde_ale", "Ale", Decimal("4.0"), Decimal("5.5"), 15, 28, 3, 6),
]


async def seed_styles(session: AsyncSession) -> tuple[int, int]:
    """Upsert the style catalog. Returns (created, updated) counts."""

    created = 0
    updated = 0

    for name, slug, category, abv_min, abv_max, ibu_min, ibu_max, srm_min, srm_max in STYLES:
        existing = (
            await session.execute(select(Style).where(Style.slug == slug))
        ).scalar_one_or_none()

        if existing is None:
            session.add(
                Style(
                    name=name,
                    slug=slug,
                    category=category,
                    abv_min=abv_min,
                    abv_max=abv_max,
                    ibu_min=ibu_min,
                    ibu_max=ibu_max,
                    srm_min=srm_min,
                    srm_max=srm_max,
                )
            )
            created += 1
        else:
            existing.name = name
            existing.category = category
            existing.abv_min = abv_min
            existing.abv_max = abv_max
            existing.ibu_min = ibu_min
            existing.ibu_max = ibu_max
            existing.srm_min = srm_min
            existing.srm_max = srm_max
            updated += 1

    await session.commit()
    return created, updated


async def main() -> None:
    engine = create_engine(get_database_url())
    factory = create_session_factory(engine)
    try:
        async with factory() as session:
            created, updated = await seed_styles(session)
            print(f"Styles seeded: {created} created, {updated} updated.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
