"""Behavior tests for the ``LegalDenomination`` model.

Covers the three invariants this reference table must hold:
- ``code`` is unique and constrained to the canonical whitelist
- numeric guards reject negative values
- happy-path persistence round-trips every column correctly
"""

from __future__ import annotations

from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import LegalDenomination
from db.models.legal_denomination import LEGAL_DENOMINATION_VALUES


async def test_create_and_round_trip(db_session: AsyncSession) -> None:
    db_session.add(
        LegalDenomination(
            code="biere_de_garde",
            label="Bière de garde",
            description="Période de garde minimale de 21 jours.",
            legal_reference="Décret 92-307",
            min_aging_days=21,
            max_alcohol_pct=None,
        )
    )
    await db_session.commit()

    loaded = (
        await db_session.execute(
            select(LegalDenomination).where(
                LegalDenomination.code == "biere_de_garde"
            )
        )
    ).scalar_one()

    assert loaded.label == "Bière de garde"
    assert loaded.min_aging_days == 21
    assert loaded.created_at is not None
    assert loaded.updated_at is not None


async def test_code_is_unique(db_session: AsyncSession) -> None:
    db_session.add(
        LegalDenomination(
            code="biere",
            label="Bière",
            description="Dénomination générique.",
            legal_reference="Décret 92-307",
        )
    )
    await db_session.commit()

    db_session.add(
        LegalDenomination(
            code="biere",
            label="Bière (doublon)",
            description="Tentative de doublon.",
            legal_reference="Décret 92-307",
        )
    )

    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_invalid_code_is_rejected_by_check_constraint(
    db_session: AsyncSession,
) -> None:
    db_session.add(
        LegalDenomination(
            code="not_a_real_denomination",
            label="Invalide",
            description="Devrait être rejeté.",
            legal_reference="(none)",
        )
    )

    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_negative_min_aging_days_is_rejected(
    db_session: AsyncSession,
) -> None:
    db_session.add(
        LegalDenomination(
            code="biere_de_garde",
            label="Bière de garde",
            description="Devrait être rejeté.",
            legal_reference="Décret 92-307",
            min_aging_days=-1,
        )
    )

    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_negative_max_alcohol_pct_is_rejected(
    db_session: AsyncSession,
) -> None:
    db_session.add(
        LegalDenomination(
            code="biere_sans_alcool",
            label="Bière sans alcool",
            description="Devrait être rejeté.",
            legal_reference="Décret 92-307",
            max_alcohol_pct=Decimal("-0.1"),
        )
    )

    with pytest.raises(IntegrityError):
        await db_session.commit()


def test_canonical_values_tuple_has_ten_entries() -> None:
    # Sanity check: the regulatory catalog must hold exactly the ten
    # denominations defined by decree 92-307 modified by 2016-1531.
    # Drift here means the ORM, the migration, and the seed script will
    # disagree about what is valid.
    assert len(LEGAL_DENOMINATION_VALUES) == 10
    assert len(set(LEGAL_DENOMINATION_VALUES)) == 10  # no duplicates
