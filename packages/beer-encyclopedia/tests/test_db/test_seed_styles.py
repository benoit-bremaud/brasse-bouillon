"""Behavior tests for ``scripts/seed_styles.py``.

Focus on the two invariants that matter in practice: the seeder creates the
full catalog on a blank DB, and re-running it is idempotent (no duplicates,
fields refreshed if they change).
"""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Style
from scripts.seed_styles import STYLES, seed_styles


async def test_seed_creates_full_catalog_on_empty_db(db_session: AsyncSession) -> None:
    created, updated = await seed_styles(db_session)

    assert created == len(STYLES)
    assert updated == 0

    count = (await db_session.execute(select(func.count()).select_from(Style))).scalar_one()
    assert count == len(STYLES)


async def test_seed_covers_every_ml_extractor_slug(db_session: AsyncSession) -> None:
    # These slugs must exist in the DB after seeding — they are the keys the
    # ML pipeline (ml/extract.py) produces.
    ml_slugs = {"ipa", "lager", "wheat", "stout", "amber_ale", "sour", "saison", "tripel"}

    await seed_styles(db_session)

    rows = (await db_session.execute(select(Style.slug))).scalars().all()
    assert ml_slugs.issubset(set(rows))


async def test_seed_is_idempotent(db_session: AsyncSession) -> None:
    await seed_styles(db_session)

    created, updated = await seed_styles(db_session)
    assert created == 0
    assert updated == len(STYLES)

    count = (await db_session.execute(select(func.count()).select_from(Style))).scalar_one()
    assert count == len(STYLES)


async def test_seed_updates_changed_fields_on_rerun(db_session: AsyncSession) -> None:
    # First run populates.
    await seed_styles(db_session)

    # Simulate drift: someone mislabelled the category of an existing row.
    ipa = (
        await db_session.execute(select(Style).where(Style.slug == "ipa"))
    ).scalar_one()
    assert ipa.category == "Ale"  # sanity check before mutation
    assert ipa.family == "IPA"
    ipa.category = "Wrong Category"
    ipa.name = "Wrong Name"
    ipa.family = "Wrong Family"
    await db_session.commit()

    # Re-seeding must restore the canonical metadata.
    await seed_styles(db_session)
    refreshed = (
        await db_session.execute(select(Style).where(Style.slug == "ipa"))
    ).scalar_one()
    assert refreshed.category == "Ale"
    assert refreshed.name == "India Pale Ale"
    assert refreshed.family == "IPA"
    assert refreshed.abv_max == Decimal("7.5")
