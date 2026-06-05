"""Seed the ``styles`` table with the core beer style catalog.

The styles seeded here cover:
- The 8 slugs already recognized by the ML field extractor (ml/extract.py)
  so the scan pipeline can resolve its output to a persisted row.
- 7 additional mainstream styles frequently encountered on real labels
  (porter, pilsner, hefeweizen, dubbel, quadrupel, barleywine, blonde_ale).
- 25 BJCP 2021 styles backing the curated beer corpus (see seed_beers.py),
  from Munich Helles and Doppelbock to Gueuze, Gose and NEIPA.

Each row carries its canonical BJCP ``family`` (ADR-0016 D2) and abv/ibu/srm
ranges. This script is idempotent: running it multiple times updates existing
rows in place (matched by ``slug``) and inserts only what is missing.
"""

from __future__ import annotations

import asyncio
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import create_engine, create_session_factory, get_database_url
from db.models import Style

# name, slug, category, family, abv_min, abv_max, ibu_min, ibu_max, srm_min, srm_max
# ``family`` is the canonical BJCP style family (ADR-0016 D2 / Appendix),
# distinct from ``category`` (Ale/Lager fermentation class).
StyleSeed = tuple[
    str,
    str,
    str,
    str,
    Decimal | None,
    Decimal | None,
    int | None,
    int | None,
    int | None,
    int | None,
]

STYLES: list[StyleSeed] = [
    # -- already recognized by ml/extract.py ---------------------------------
    ("India Pale Ale", "ipa", "Ale", "IPA", Decimal("5.5"), Decimal("7.5"), 40, 70, 6, 14),
    ("Lager", "lager", "Lager", "Pale Lager", Decimal("4.0"), Decimal("5.5"), 8, 25, 2, 6),
    ("Wheat Beer", "wheat", "Ale", "Wheat Beer", Decimal("4.0"), Decimal("5.6"), 8, 20, 3, 9),
    ("Stout", "stout", "Ale", "Stout", Decimal("4.0"), Decimal("7.0"), 25, 60, 30, 40),
    ("Amber Ale", "amber_ale", "Ale", "Amber Ale", Decimal("4.5"), Decimal("6.2"), 25, 45, 10, 17),
    ("Sour Ale", "sour", "Ale", "Sour Ale", Decimal("3.5"), Decimal("6.5"), 5, 25, 3, 20),
    ("Saison", "saison", "Ale", "Pale Ale", Decimal("5.0"), Decimal("7.0"), 20, 35, 5, 14),
    (
        "Belgian Tripel",
        "tripel",
        "Ale",
        "Strong Belgian Ale",
        Decimal("7.5"),
        Decimal("9.5"),
        20,
        40,
        4,
        7,
    ),
    # -- additional mainstream styles ----------------------------------------
    ("Porter", "porter", "Ale", "Porter", Decimal("4.0"), Decimal("6.5"), 25, 50, 20, 35),
    ("Pilsner", "pilsner", "Lager", "Pale Lager", Decimal("4.2"), Decimal("5.5"), 25, 45, 2, 6),
    ("Hefeweizen", "hefeweizen", "Ale", "Wheat Beer", Decimal("4.5"), Decimal("5.6"), 8, 15, 2, 6),
    (
        "Belgian Dubbel",
        "dubbel",
        "Ale",
        "Belgian Ale",
        Decimal("6.0"),
        Decimal("7.6"),
        15,
        25,
        10,
        17,
    ),
    (
        "Belgian Quadrupel",
        "quadrupel",
        "Ale",
        "Strong Belgian Ale",
        Decimal("9.0"),
        Decimal("12.0"),
        20,
        35,
        12,
        22,
    ),
    (
        "Barleywine",
        "barleywine",
        "Ale",
        "Strong Ale",
        Decimal("8.0"),
        Decimal("12.0"),
        40,
        100,
        10,
        19,
    ),
    ("Blonde Ale", "blonde_ale", "Ale", "Pale Ale", Decimal("4.0"), Decimal("5.5"), 15, 28, 3, 6),
    # -- corpus styles (BJCP 2021) added for the curated beer corpus ---------
    (
        "International Pale Lager",
        "international_pale_lager",
        "Lager",
        "Pale Lager",
        Decimal("4.6"),
        Decimal("6.0"),
        18,
        25,
        2,
        6,
    ),
    (
        "Munich Helles",
        "munich_helles",
        "Lager",
        "Pale Lager",
        Decimal("4.7"),
        Decimal("5.4"),
        16,
        22,
        3,
        5,
    ),
    (
        "Munich Dunkel",
        "munich_dunkel",
        "Lager",
        "Dark Lager",
        Decimal("4.5"),
        Decimal("5.6"),
        18,
        28,
        14,
        28,
    ),
    (
        "Rauchbier",
        "rauchbier",
        "Lager",
        "Amber Lager",
        Decimal("5.8"),
        Decimal("6.3"),
        18,
        24,
        8,
        17,
    ),
    ("Doppelbock", "doppelbock", "Lager", "Bock", Decimal("7.0"), Decimal("10.0"), 16, 26, 6, 25),
    ("Eisbock", "eisbock", "Lager", "Bock", Decimal("9.0"), Decimal("14.0"), 25, 35, 18, 30),
    ("Kölsch", "kolsch", "Ale", "Pale Ale", Decimal("4.4"), Decimal("5.2"), 18, 30, 3, 5),
    ("Altbier", "altbier", "Ale", "Amber Ale", Decimal("4.3"), Decimal("5.5"), 25, 50, 11, 17),
    ("Witbier", "witbier", "Ale", "Wheat Beer", Decimal("4.5"), Decimal("5.5"), 8, 20, 2, 4),
    (
        "Weizenbock",
        "weizenbock",
        "Ale",
        "Wheat Beer",
        Decimal("6.5"),
        Decimal("9.0"),
        15,
        30,
        6,
        25,
    ),
    (
        "American Pale Ale",
        "american_pale_ale",
        "Ale",
        "Pale Ale",
        Decimal("4.5"),
        Decimal("6.2"),
        30,
        50,
        5,
        10,
    ),
    ("Double IPA", "double_ipa", "Ale", "IPA", Decimal("7.5"), Decimal("10.0"), 60, 120, 6, 14),
    ("New England IPA", "neipa", "Ale", "IPA", Decimal("6.0"), Decimal("9.0"), 25, 60, 3, 7),
    (
        "Belgian Golden Strong Ale",
        "belgian_golden_strong",
        "Ale",
        "Strong Belgian Ale",
        Decimal("7.5"),
        Decimal("10.5"),
        22,
        35,
        3,
        6,
    ),
    (
        "Belgian Pale Ale",
        "belgian_pale_ale",
        "Ale",
        "Belgian Ale",
        Decimal("4.8"),
        Decimal("5.5"),
        20,
        30,
        8,
        14,
    ),
    (
        "Best Bitter",
        "best_bitter",
        "Ale",
        "British Bitter",
        Decimal("3.8"),
        Decimal("4.6"),
        25,
        40,
        8,
        16,
    ),
    (
        "British Brown Ale",
        "british_brown_ale",
        "Ale",
        "Brown Ale",
        Decimal("4.2"),
        Decimal("5.4"),
        20,
        30,
        12,
        22,
    ),
    (
        "Wee Heavy",
        "wee_heavy",
        "Ale",
        "Strong Ale",
        Decimal("6.5"),
        Decimal("10.0"),
        17,
        35,
        14,
        25,
    ),
    ("Irish Stout", "irish_stout", "Ale", "Stout", Decimal("4.0"), Decimal("4.5"), 25, 45, 25, 40),
    (
        "Imperial Stout",
        "imperial_stout",
        "Ale",
        "Stout",
        Decimal("8.0"),
        Decimal("12.0"),
        50,
        90,
        30,
        40,
    ),
    (
        "Berliner Weisse",
        "berliner_weisse",
        "Ale",
        "Sour Ale",
        Decimal("2.8"),
        Decimal("3.8"),
        3,
        8,
        2,
        3,
    ),
    ("Gose", "gose", "Ale", "Sour Ale", Decimal("4.2"), Decimal("4.8"), 5, 12, 3, 4),
    (
        "Flanders Red Ale",
        "flanders_red",
        "Ale",
        "Sour Ale",
        Decimal("4.6"),
        Decimal("6.5"),
        10,
        25,
        10,
        16,
    ),
    ("Gueuze", "gueuze", "Ale", "Sour Ale", Decimal("5.0"), Decimal("8.0"), 0, 10, 3, 7),
    (
        "Fruit Lambic",
        "fruit_lambic",
        "Ale",
        "Sour Ale",
        Decimal("5.0"),
        Decimal("7.0"),
        0,
        10,
        3,
        7,
    ),
]


async def seed_styles(session: AsyncSession) -> tuple[int, int]:
    """Upsert the style catalog. Returns (created, updated) counts."""

    created = 0
    updated = 0

    for (
        name,
        slug,
        category,
        family,
        abv_min,
        abv_max,
        ibu_min,
        ibu_max,
        srm_min,
        srm_max,
    ) in STYLES:
        existing = (
            await session.execute(select(Style).where(Style.slug == slug))
        ).scalar_one_or_none()

        if existing is None:
            session.add(
                Style(
                    name=name,
                    slug=slug,
                    category=category,
                    family=family,
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
            existing.family = family
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
