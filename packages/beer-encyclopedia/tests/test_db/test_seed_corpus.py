"""Behavior tests for the corpus seeders.

Covers ``scripts/seed_breweries.py``, ``scripts/seed_beers.py`` and
``scripts/seed_ingredients.py``: full creation on a blank DB (happy path),
idempotent re-runs (edge), and a missing foreign-key raise (sad path).
"""

from __future__ import annotations

import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Beer, BeerIngredient, Brewery, Ingredient, TastingProfile
from scripts.seed_beers import BEERS, seed_beers
from scripts.seed_breweries import BREWERIES, seed_breweries
from scripts.seed_ingredients import INGREDIENTS, LINKS, seed_ingredients
from scripts.seed_styles import seed_styles

_EXPECTED_LINKS = sum(len(items) for items in LINKS.values())


async def _count(session: AsyncSession, model: type) -> int:
    return (await session.execute(select(func.count()).select_from(model))).scalar_one()


async def _seed_prerequisites(session: AsyncSession) -> None:
    await seed_breweries(session)
    await seed_styles(session)
    await seed_beers(session)


# -- breweries --------------------------------------------------------------


async def test_seed_breweries_creates_full_catalog(db_session: AsyncSession) -> None:
    created, updated = await seed_breweries(db_session)

    assert created == len(BREWERIES)
    assert updated == 0
    assert await _count(db_session, Brewery) == len(BREWERIES)


async def test_seed_breweries_is_idempotent(db_session: AsyncSession) -> None:
    await seed_breweries(db_session)

    created, updated = await seed_breweries(db_session)
    assert created == 0
    assert updated == len(BREWERIES)
    assert await _count(db_session, Brewery) == len(BREWERIES)


# -- beers (+ tasting profiles) ---------------------------------------------


async def test_seed_beers_creates_corpus_and_profiles(db_session: AsyncSession) -> None:
    await seed_breweries(db_session)
    await seed_styles(db_session)

    created, updated = await seed_beers(db_session)

    assert created == len(BEERS)
    assert updated == 0
    assert await _count(db_session, Beer) == len(BEERS)
    assert await _count(db_session, TastingProfile) == len(BEERS)


async def test_seed_beers_is_idempotent(db_session: AsyncSession) -> None:
    await _seed_prerequisites(db_session)

    created, updated = await seed_beers(db_session)
    assert created == 0
    assert updated == len(BEERS)
    assert await _count(db_session, Beer) == len(BEERS)
    assert await _count(db_session, TastingProfile) == len(BEERS)


async def test_seed_beers_intervals_and_fk_resolved(db_session: AsyncSession) -> None:
    await _seed_prerequisites(db_session)

    chouffe = (await db_session.execute(select(Beer).where(Beer.slug == "la-chouffe"))).scalar_one()
    assert chouffe.ibu_min == 20
    assert chouffe.ibu_max == 28
    assert chouffe.brewery_id is not None
    assert chouffe.style_id is not None
    assert chouffe.ean_code == "5410769100081"


async def test_seed_beers_publishes_corpus_as_verified(db_session: AsyncSession) -> None:
    # The curated seed is the founder-vouched baseline → published
    # (is_verified=True, ADR-0015 D1), so it surfaces in the public catalogue.
    # No seeded row stays in staging.
    await _seed_prerequisites(db_session)

    unverified = (
        await db_session.execute(
            select(func.count()).select_from(Beer).where(Beer.is_verified.is_(False))
        )
    ).scalar_one()
    assert unverified == 0


async def test_reseed_preserves_depublication(db_session: AsyncSession) -> None:
    # Depublication (moderation) toggles is_active, not is_verified. A re-seed
    # re-publishes is_verified but must NOT resurrect a depublished beer:
    # is_active stays False across re-runs (ADR-0018 reversible depublish).
    await _seed_prerequisites(db_session)
    orval = (await db_session.execute(select(Beer).where(Beer.slug == "orval"))).scalar_one()
    orval.is_active = False
    await db_session.commit()

    await seed_beers(db_session)

    orval = (await db_session.execute(select(Beer).where(Beer.slug == "orval"))).scalar_one()
    assert orval.is_active is False  # depublication survives the re-seed
    assert orval.is_verified is True  # corpus stays published


async def test_seed_beers_missing_brewery_raises(db_session: AsyncSession) -> None:
    # No breweries seeded → the first beer's brewery slug cannot resolve.
    with pytest.raises(ValueError, match="Brewery slug"):
        await seed_beers(db_session)


async def test_seed_beers_matches_existing_by_ean(db_session: AsyncSession) -> None:
    # Simulate a prior OpenFoodFacts import: a beer holding La Chouffe's EAN
    # under a *different* slug. The seeder must match it by EAN (not blindly
    # insert and trip uq_beers_ean_code) and normalize its slug. (Codex P2)
    await seed_breweries(db_session)
    await seed_styles(db_session)
    db_session.add(
        Beer(
            name="Imported draft",
            slug="off-import-chouffe",
            ean_code="5410769100081",
            source="openfoodfacts",
        )
    )
    await db_session.commit()

    created, updated = await seed_beers(db_session)

    assert created == len(BEERS) - 1  # La Chouffe matched the pre-existing row
    assert updated == 1
    matches = (
        (await db_session.execute(select(Beer).where(Beer.ean_code == "5410769100081")))
        .scalars()
        .all()
    )
    assert len(matches) == 1  # no duplicate, no constraint violation
    assert matches[0].slug == "la-chouffe"  # slug normalized to the curated one
    assert matches[0].name == "La Chouffe"
    assert matches[0].is_verified is True  # a matched staged import is published by the seed


# -- ingredients (+ links) --------------------------------------------------


async def test_seed_ingredients_creates_catalog_and_links(
    db_session: AsyncSession,
) -> None:
    await _seed_prerequisites(db_session)

    ingredients_created, links_created = await seed_ingredients(db_session)

    assert ingredients_created == len(INGREDIENTS)
    assert links_created == _EXPECTED_LINKS
    assert await _count(db_session, Ingredient) == len(INGREDIENTS)
    assert await _count(db_session, BeerIngredient) == _EXPECTED_LINKS


async def test_seed_ingredients_is_idempotent(db_session: AsyncSession) -> None:
    await _seed_prerequisites(db_session)
    await seed_ingredients(db_session)

    ingredients_created, links_created = await seed_ingredients(db_session)
    assert ingredients_created == 0
    assert links_created == 0
    assert await _count(db_session, Ingredient) == len(INGREDIENTS)
    assert await _count(db_session, BeerIngredient) == _EXPECTED_LINKS


async def test_seed_beers_conflicting_ean_and_slug_raises(
    db_session: AsyncSession,
) -> None:
    # Split-key drift: La Chouffe's EAN on one row, its curated slug on another.
    # The seeder must fail fast rather than overwrite a slug into a uniqueness
    # violation. (CodeRabbit)
    await seed_breweries(db_session)
    await seed_styles(db_session)
    db_session.add(
        Beer(
            name="EAN holder",
            slug="off-import-chouffe",
            ean_code="5410769100081",
            source="openfoodfacts",
        )
    )
    db_session.add(Beer(name="Slug holder", slug="la-chouffe", source="internal"))
    await db_session.commit()

    with pytest.raises(ValueError, match="Conflicting beer matches"):
        await seed_beers(db_session)

    # Atomic: the partial batch flushed before the conflict is rolled back,
    # leaving only the two pre-seeded rows.
    count = (await db_session.execute(select(func.count()).select_from(Beer))).scalar_one()
    assert count == 2


async def test_seed_ingredients_missing_beer_raises(db_session: AsyncSession) -> None:
    # Catalog can be created, but links cannot resolve without seeded beers.
    with pytest.raises(ValueError, match="Beer slug"):
        await seed_ingredients(db_session)


async def test_seed_ingredients_refreshes_drifted_category(
    db_session: AsyncSession,
) -> None:
    # The catalog upsert must restore a drifted category on re-run. (Copilot)
    await _seed_prerequisites(db_session)
    await seed_ingredients(db_session)

    saaz = (
        await db_session.execute(select(Ingredient).where(Ingredient.name == "Saaz"))
    ).scalar_one()
    assert saaz.category == "hop"
    saaz.category = "wrong"
    await db_session.commit()

    await seed_ingredients(db_session)
    refreshed = (
        await db_session.execute(select(Ingredient).where(Ingredient.name == "Saaz"))
    ).scalar_one()
    assert refreshed.category == "hop"
