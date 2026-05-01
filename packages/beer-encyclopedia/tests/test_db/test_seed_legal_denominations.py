"""Behavior tests for ``scripts/seed_legal_denominations.py``.

Mirrors the structure of ``test_seed_styles.py``: full population on a
blank DB, idempotence on re-run, and field refresh on drift. Adds a
specific check that every code listed in ``LEGAL_DENOMINATION_VALUES``
is actually seeded — drift between the canonical tuple and the seed
catalog would silently break ``Beer.legal_denomination`` validation.
"""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import LegalDenomination
from db.models.legal_denomination import LEGAL_DENOMINATION_VALUES
from scripts.seed_legal_denominations import (
    DENOMINATIONS,
    seed_legal_denominations,
)


async def test_seed_creates_full_catalog_on_empty_db(
    db_session: AsyncSession,
) -> None:
    created, updated = await seed_legal_denominations(db_session)

    assert created == len(DENOMINATIONS)
    assert updated == 0

    count = (
        await db_session.execute(select(func.count()).select_from(LegalDenomination))
    ).scalar_one()
    assert count == len(DENOMINATIONS)


async def test_seed_covers_every_canonical_code(
    db_session: AsyncSession,
) -> None:
    await seed_legal_denominations(db_session)

    rows = (
        await db_session.execute(select(LegalDenomination.code))
    ).scalars().all()
    assert set(rows) == set(LEGAL_DENOMINATION_VALUES)


async def test_seed_is_idempotent(db_session: AsyncSession) -> None:
    await seed_legal_denominations(db_session)

    created, updated = await seed_legal_denominations(db_session)
    assert created == 0
    assert updated == len(DENOMINATIONS)

    count = (
        await db_session.execute(select(func.count()).select_from(LegalDenomination))
    ).scalar_one()
    assert count == len(DENOMINATIONS)


async def test_seed_updates_changed_fields_on_rerun(
    db_session: AsyncSession,
) -> None:
    await seed_legal_denominations(db_session)

    garde = (
        await db_session.execute(
            select(LegalDenomination).where(
                LegalDenomination.code == "biere_de_garde"
            )
        )
    ).scalar_one()
    assert garde.min_aging_days == 21  # sanity check
    garde.label = "Drifted label"
    garde.min_aging_days = 1
    await db_session.commit()

    await seed_legal_denominations(db_session)
    refreshed = (
        await db_session.execute(
            select(LegalDenomination).where(
                LegalDenomination.code == "biere_de_garde"
            )
        )
    ).scalar_one()
    assert refreshed.label == "Bière de garde"
    assert refreshed.min_aging_days == 21
