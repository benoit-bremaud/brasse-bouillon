"""Behavior tests for the encyclopedia ORM models.

Cover the relationships and constraints that are hard to get right:
cascades on parents with children, unique slugs, required-parent check
on polymorphic ``media`` rows, one-to-one on ``tasting_profiles``, and
the provenance triplet uniqueness on ``entity_sources``.
"""

from __future__ import annotations

import uuid
from decimal import Decimal

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from db.models import (
    Beer,
    BeerIngredient,
    Brewery,
    CommunityCorrection,
    EntitySource,
    Ingredient,
    Media,
    Source,
    Style,
    TastingProfile,
)


async def test_style_is_persisted_with_all_fields(db_session: AsyncSession) -> None:
    style = Style(
        name="India Pale Ale",
        slug="ipa",
        category="Ale",
        abv_min=Decimal("5.5"),
        abv_max=Decimal("7.5"),
        ibu_min=40,
        ibu_max=70,
    )
    db_session.add(style)
    await db_session.commit()

    fetched = (
        await db_session.execute(select(Style).where(Style.slug == "ipa"))
    ).scalar_one()
    assert fetched.name == "India Pale Ale"
    assert fetched.abv_min == Decimal("5.5")
    assert fetched.created_at is not None
    assert fetched.updated_at is not None


async def test_style_slug_is_unique(db_session: AsyncSession) -> None:
    db_session.add(Style(name="IPA One", slug="ipa"))
    await db_session.commit()

    db_session.add(Style(name="IPA Two", slug="ipa"))
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_beer_links_brewery_and_style(db_session: AsyncSession) -> None:
    brewery = Brewery(name="Test Brewing Co.", slug="test-brewing-co")
    style = Style(name="India Pale Ale", slug="ipa")
    db_session.add_all([brewery, style])
    await db_session.flush()

    beer = Beer(
        name="Citra Bomb",
        slug="citra-bomb",
        brewery_id=brewery.id,
        style_id=style.id,
        abv=Decimal("6.5"),
        ibu=55,
    )
    db_session.add(beer)
    await db_session.commit()

    stmt = (
        select(Beer)
        .where(Beer.slug == "citra-bomb")
        .options(selectinload(Beer.brewery), selectinload(Beer.style))
    )
    fetched = (await db_session.execute(stmt)).scalar_one()
    assert fetched.brewery is not None and fetched.brewery.name == "Test Brewing Co."
    assert fetched.style is not None and fetched.style.slug == "ipa"


async def test_deleting_brewery_nulls_beer_foreign_key(db_session: AsyncSession) -> None:
    brewery = Brewery(name="Doomed Brewery", slug="doomed-brewery")
    db_session.add(brewery)
    await db_session.flush()

    beer = Beer(name="Survivor IPA", slug="survivor-ipa", brewery_id=brewery.id)
    db_session.add(beer)
    await db_session.commit()

    await db_session.delete(brewery)
    await db_session.commit()

    fetched = (
        await db_session.execute(select(Beer).where(Beer.slug == "survivor-ipa"))
    ).scalar_one()
    # ON DELETE SET NULL means the beer row survives without a brewery.
    assert fetched.brewery_id is None


async def test_tasting_profile_is_one_to_one(db_session: AsyncSession) -> None:
    beer = Beer(name="Amber One", slug="amber-one")
    db_session.add(beer)
    await db_session.flush()

    db_session.add(
        TastingProfile(
            beer_id=beer.id,
            bitterness=3,
            sweetness=2,
            body=3,
            carbonation=3,
            aroma="Caramel, toasted bread.",
        )
    )
    await db_session.commit()

    db_session.add(TastingProfile(beer_id=beer.id, bitterness=4))
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_beer_ingredients_composite_primary_key(db_session: AsyncSession) -> None:
    beer = Beer(name="Hop Bomb", slug="hop-bomb")
    hop = Ingredient(name="Citra", category="hop")
    malt = Ingredient(name="Pale Ale Malt", category="malt")
    db_session.add_all([beer, hop, malt])
    await db_session.flush()

    db_session.add_all(
        [
            BeerIngredient(beer_id=beer.id, ingredient_id=hop.id, usage_phase="dry_hop"),
            BeerIngredient(beer_id=beer.id, ingredient_id=malt.id, usage_phase="mash"),
        ]
    )
    await db_session.commit()

    # A second row with the same (beer, ingredient) pair violates the PK.
    db_session.add(BeerIngredient(beer_id=beer.id, ingredient_id=hop.id, amount="30g"))
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_media_rejects_no_parent(db_session: AsyncSession) -> None:
    """XOR parent check — media with neither beer nor brewery is rejected."""

    db_session.add(
        Media(
            beer_id=None,
            brewery_id=None,
            media_type="label_photo",
            url="https://example.com/orphan.jpg",
        )
    )
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_media_rejects_both_parents(db_session: AsyncSession) -> None:
    """XOR parent check — media cannot belong to both a beer and a brewery."""

    brewery = Brewery(name="Dual Owner Brewing", slug="dual-owner-brewing")
    beer = Beer(name="Dual Owner IPA", slug="dual-owner-ipa")
    db_session.add_all([brewery, beer])
    await db_session.flush()

    db_session.add(
        Media(
            beer_id=beer.id,
            brewery_id=brewery.id,
            media_type="label_photo",
            url="https://example.com/both.jpg",
        )
    )
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_media_accepts_single_parent(db_session: AsyncSession) -> None:
    """XOR parent check — media with exactly one parent is accepted."""

    brewery = Brewery(name="Solo Brewing", slug="solo-brewing")
    beer = Beer(name="Solo IPA", slug="solo-ipa")
    db_session.add_all([brewery, beer])
    await db_session.flush()

    db_session.add_all(
        [
            Media(beer_id=beer.id, media_type="label_photo", url="https://x/1.jpg"),
            Media(brewery_id=brewery.id, media_type="logo", url="https://x/2.jpg"),
        ]
    )
    await db_session.commit()
    # No IntegrityError — both rows commit cleanly.


async def test_entity_sources_triplet_is_unique(db_session: AsyncSession) -> None:
    source = Source(name="open_brewery_db", source_type="api")
    db_session.add(source)
    await db_session.flush()

    brewery_uuid = uuid.uuid4()
    db_session.add(
        EntitySource(
            source_id=source.id,
            entity_type="brewery",
            entity_id=brewery_uuid,
            external_id="obdb-123",
        )
    )
    await db_session.commit()

    db_session.add(
        EntitySource(
            source_id=source.id,
            entity_type="brewery",
            entity_id=uuid.uuid4(),  # different target, same external_id
            external_id="obdb-123",
        )
    )
    with pytest.raises(IntegrityError):
        await db_session.commit()


async def test_community_correction_defaults_to_pending(
    db_session: AsyncSession,
) -> None:
    correction = CommunityCorrection(
        entity_type="brewery",
        entity_id=uuid.uuid4(),
        field_name="website_url",
        new_value="https://new.example.com",
    )
    db_session.add(correction)
    await db_session.commit()

    fetched = (await db_session.execute(select(CommunityCorrection))).scalar_one()
    assert fetched.status == "pending"
    assert fetched.created_at is not None


async def test_deleting_beer_cascades_to_tasting_profile_and_ingredients(
    db_session: AsyncSession,
) -> None:
    beer = Beer(name="Ephemeral", slug="ephemeral")
    hop = Ingredient(name="Amarillo", category="hop")
    db_session.add_all([beer, hop])
    await db_session.flush()

    db_session.add_all(
        [
            TastingProfile(beer_id=beer.id, overall="Short-lived."),
            BeerIngredient(beer_id=beer.id, ingredient_id=hop.id),
        ]
    )
    await db_session.commit()

    await db_session.delete(beer)
    await db_session.commit()

    profiles = (await db_session.execute(select(TastingProfile))).scalars().all()
    links = (await db_session.execute(select(BeerIngredient))).scalars().all()
    assert profiles == []
    assert links == []
    # The ingredient itself survives — it's shared across beers.
    assert (await db_session.execute(select(Ingredient))).scalar_one().name == "Amarillo"


async def test_deleting_beer_cascades_to_media(db_session: AsyncSession) -> None:
    """Regression test for PR #550: without cascade on Beer.media, deleting a
    beer with attached media would leave (NULL, NULL) rows that violate the
    XOR parent check. With passive_deletes + delete-orphan, the media rows
    are removed via ON DELETE CASCADE without touching the session state."""

    beer = Beer(name="Short-Lived IPA", slug="short-lived-ipa")
    db_session.add(beer)
    await db_session.flush()

    db_session.add_all(
        [
            Media(beer_id=beer.id, media_type="label_photo", url="https://x/a.jpg"),
            Media(beer_id=beer.id, media_type="bottle_photo", url="https://x/b.jpg"),
        ]
    )
    await db_session.commit()

    await db_session.delete(beer)
    await db_session.commit()

    remaining = (await db_session.execute(select(Media))).scalars().all()
    assert remaining == []


async def test_deleting_brewery_cascades_to_media(db_session: AsyncSession) -> None:
    """Symmetric regression test for Brewery.media cascade."""

    brewery = Brewery(name="Short-Lived Brewery", slug="short-lived-brewery")
    db_session.add(brewery)
    await db_session.flush()

    db_session.add(
        Media(brewery_id=brewery.id, media_type="logo", url="https://x/logo.jpg")
    )
    await db_session.commit()

    await db_session.delete(brewery)
    await db_session.commit()

    remaining = (await db_session.execute(select(Media))).scalars().all()
    assert remaining == []
