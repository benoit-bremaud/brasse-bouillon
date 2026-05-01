"""Behavior tests for the four French regulatory fields on ``Beer``.

Covers happy path (every accepted shape persists), sad path (invalid
values are rejected at the ORM validator level before flush), and edge
cases (case normalisation on country code, JSON list round-trip).
"""

from __future__ import annotations

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Beer, Brewery
from db.models.beer import ALCOHOL_GROUP_VALUES
from db.models.legal_denomination import LEGAL_DENOMINATION_VALUES


async def _make_brewery(session: AsyncSession, slug: str = "test-brewery") -> Brewery:
    brewery = Brewery(name=slug.replace("-", " ").title(), slug=slug)
    session.add(brewery)
    await session.commit()
    return brewery


async def test_beer_persists_full_legal_payload(db_session: AsyncSession) -> None:
    brewery = await _make_brewery(db_session)

    db_session.add(
        Beer(
            name="Test Beer",
            slug="test-beer",
            brewery_id=brewery.id,
            legal_denomination="biere_de_garde",
            country_of_origin="FR",
            allergens=["gluten", "sulfites"],
            alcohol_group=3,
        )
    )
    await db_session.commit()

    loaded = (
        await db_session.execute(select(Beer).where(Beer.slug == "test-beer"))
    ).scalar_one()
    assert loaded.legal_denomination == "biere_de_garde"
    assert loaded.country_of_origin == "FR"
    assert loaded.allergens == ["gluten", "sulfites"]
    assert loaded.alcohol_group == 3


async def test_beer_accepts_null_legal_fields(db_session: AsyncSession) -> None:
    # Non-FR beers (and pre-existing rows) leave every regulatory field NULL.
    db_session.add(Beer(name="Plain", slug="plain"))
    await db_session.commit()

    loaded = (
        await db_session.execute(select(Beer).where(Beer.slug == "plain"))
    ).scalar_one()
    assert loaded.legal_denomination is None
    assert loaded.country_of_origin is None
    assert loaded.allergens is None
    assert loaded.alcohol_group is None


@pytest.mark.parametrize("value", LEGAL_DENOMINATION_VALUES)
async def test_beer_accepts_every_canonical_denomination(
    db_session: AsyncSession, value: str
) -> None:
    db_session.add(Beer(name=f"Beer {value}", slug=value, legal_denomination=value))
    await db_session.commit()


def test_beer_rejects_unknown_denomination_at_orm_layer() -> None:
    # The ``@validates`` hook fires at assignment time — no flush needed.
    with pytest.raises(ValueError, match="legal_denomination"):
        Beer(name="X", slug="x", legal_denomination="not_a_real_one")


@pytest.mark.parametrize("value", ALCOHOL_GROUP_VALUES)
async def test_beer_accepts_every_alcohol_group(
    db_session: AsyncSession, value: int
) -> None:
    db_session.add(Beer(name=f"Beer g{value}", slug=f"g{value}", alcohol_group=value))
    await db_session.commit()


def test_beer_rejects_alcohol_group_two() -> None:
    # Group 2 was historically merged into group 3 — it is not part of
    # the current nomenclature under article L-3321-1.
    with pytest.raises(ValueError, match="alcohol_group"):
        Beer(name="X", slug="x", alcohol_group=2)


async def test_beer_country_code_is_uppercased(db_session: AsyncSession) -> None:
    db_session.add(Beer(name="Lowercase Country", slug="lc", country_of_origin="fr"))
    await db_session.commit()

    loaded = (
        await db_session.execute(select(Beer).where(Beer.slug == "lc"))
    ).scalar_one()
    assert loaded.country_of_origin == "FR"


def test_beer_rejects_country_code_with_wrong_length() -> None:
    with pytest.raises(ValueError, match="country_of_origin"):
        Beer(name="X", slug="x", country_of_origin="FRA")


def test_beer_rejects_non_letter_country_code() -> None:
    # Length-only check would let "12" or "!!" through to the DB; the
    # ORM validator rejects these at assignment time so the error is
    # actionable from the caller side.
    with pytest.raises(ValueError, match="country_of_origin"):
        Beer(name="X", slug="x", country_of_origin="12")
    with pytest.raises(ValueError, match="country_of_origin"):
        Beer(name="X", slug="x", country_of_origin="!!")


async def test_beer_db_check_blocks_raw_sql_invalid_denomination(
    db_session: AsyncSession,
) -> None:
    # Last line of defence: even if the ORM validator is bypassed (e.g.
    # via ``execute(insert(...))``), the DB CHECK constraint must reject
    # invalid values. Going through the ORM but skipping the validator by
    # using ``__dict__`` would be brittle — instead drive a raw insert.
    from sqlalchemy import insert

    with pytest.raises(IntegrityError):
        await db_session.execute(
            insert(Beer).values(
                name="Bypass",
                slug="bypass",
                legal_denomination="not_valid",
            )
        )
        await db_session.commit()
