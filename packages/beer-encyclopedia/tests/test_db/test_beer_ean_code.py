"""Behaviour tests for ``Beer.ean_code`` (added by migration 004).

Three layers of guarantees, each covered by happy / sad / edge cases:
- ORM validator (assignment-time format check)
- DB CHECK constraint (length whitelist)
- DB UNIQUE constraint (no two beers share an EAN, but multiple NULLs are
  allowed)
"""

from __future__ import annotations

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Beer

# --- Happy path ----------------------------------------------------------


@pytest.mark.parametrize(
    "ean",
    [
        "12345678",            # EAN-8
        "123456789012",        # UPC-A
        "1234567890123",       # EAN-13
        "12345678901234",      # EAN-14
    ],
)
async def test_beer_accepts_every_supported_ean_length(
    db_session: AsyncSession, ean: str
) -> None:
    db_session.add(Beer(name=f"Beer {ean}", slug=f"beer-{ean}", ean_code=ean))
    await db_session.commit()

    loaded = (
        await db_session.execute(select(Beer).where(Beer.slug == f"beer-{ean}"))
    ).scalar_one()
    assert loaded.ean_code == ean


async def test_beer_accepts_null_ean_code(db_session: AsyncSession) -> None:
    db_session.add(Beer(name="No barcode", slug="no-barcode"))
    await db_session.commit()

    loaded = (
        await db_session.execute(select(Beer).where(Beer.slug == "no-barcode"))
    ).scalar_one()
    assert loaded.ean_code is None


# --- Sad path ------------------------------------------------------------


def test_beer_rejects_non_digit_ean_at_orm_layer() -> None:
    with pytest.raises(ValueError, match="ean_code"):
        Beer(name="X", slug="x", ean_code="123abc456")


def test_beer_rejects_ean_with_unsupported_length() -> None:
    # 9 digits is not a standard barcode length — ORM validator rejects.
    with pytest.raises(ValueError, match="ean_code"):
        Beer(name="X", slug="x", ean_code="123456789")


def test_beer_rejects_empty_string_ean() -> None:
    with pytest.raises(ValueError, match="ean_code"):
        Beer(name="X", slug="x", ean_code="")


async def test_beer_db_check_blocks_raw_sql_invalid_ean_length(
    db_session: AsyncSession,
) -> None:
    """Last line of defence: the DB CHECK rejects bypass attempts.

    Driving a raw insert through SQLAlchemy Core skips the ORM
    validator. The migration's CHECK constraint must still reject the
    bad length so corrupted rows cannot reach the DB.
    """

    from sqlalchemy import insert

    with pytest.raises(IntegrityError):
        await db_session.execute(
            insert(Beer).values(
                name="Bypass",
                slug="bypass",
                ean_code="123456789",  # 9 digits — invalid length
            )
        )
        await db_session.commit()


# --- Edge cases ----------------------------------------------------------


async def test_unique_constraint_blocks_two_beers_with_same_ean(
    db_session: AsyncSession,
) -> None:
    db_session.add(Beer(name="First", slug="first", ean_code="3760231860119"))
    await db_session.commit()

    db_session.add(Beer(name="Second", slug="second", ean_code="3760231860119"))
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_unique_constraint_allows_multiple_null_ean_rows(
    db_session: AsyncSession,
) -> None:
    """SQLite + PostgreSQL both treat NULL as ``unknown`` in unique
    constraints — multiple beers without an EAN must coexist."""

    db_session.add(Beer(name="A", slug="a"))
    db_session.add(Beer(name="B", slug="b"))
    db_session.add(Beer(name="C", slug="c"))
    await db_session.commit()

    count = (
        await db_session.execute(
            select(Beer).where(Beer.ean_code.is_(None))
        )
    ).scalars().all()
    assert len(count) == 3


async def test_ean_code_can_be_unset_after_being_set(
    db_session: AsyncSession,
) -> None:
    db_session.add(Beer(name="X", slug="x", ean_code="3760231860119"))
    await db_session.commit()

    beer = (
        await db_session.execute(select(Beer).where(Beer.slug == "x"))
    ).scalar_one()
    beer.ean_code = None
    await db_session.commit()

    refreshed = (
        await db_session.execute(select(Beer).where(Beer.slug == "x"))
    ).scalar_one()
    assert refreshed.ean_code is None
