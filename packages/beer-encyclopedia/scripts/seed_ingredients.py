"""Seed the ``ingredients`` catalog and ``beer_ingredients`` links.

Builds a normalized ingredient catalog (hops, malts, adjuncts, yeasts, spices,
fruit) and links each curated beer to its defining ingredients. Sourced from
the same research as ``seed_beers.py`` (official pages, OFF, BJCP); only
documented / strongly-characteristic ingredients are linked — this is not an
exhaustive grain bill. ``usage_phase`` uses canonical values — ``boil``
(spices), ``whirlpool`` (aroma hops), ``dry-hop``, ``maturation``
(fruit/Brett), ``fermentation`` (souring cultures) — otherwise left NULL.

Run after ``seed_beers.py`` (links resolve beers by slug). Idempotent:
ingredients matched by unique ``name``, links by ``(beer_id, ingredient_id)``.
"""

from __future__ import annotations

import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import create_engine, create_session_factory, get_database_url
from db.models import Beer, BeerIngredient, Ingredient

# name -> category
INGREDIENTS: dict[str, str] = {
    # hops
    "Saaz": "hop",
    "Hallertau": "hop",
    "Styrian Golding": "hop",
    "East Kent Golding": "hop",
    "Fuggles": "hop",
    "Cascade": "hop",
    "Centennial": "hop",
    "Chinook": "hop",
    "Simcoe": "hop",
    "Amarillo": "hop",
    "Tettnang": "hop",
    "Spalt": "hop",
    "Hops": "hop",
    # malts
    "Pilsner malt": "malt",
    "Pale ale malt": "malt",
    "Munich malt": "malt",
    "Caramel malt": "malt",
    "Chocolate malt": "malt",
    "Roasted barley": "malt",
    "Black malt": "malt",
    "Smoked malt": "malt",
    "Torrefied wheat": "malt",
    "Wheat malt": "malt",
    "Barley malt": "malt",
    "Oats": "malt",
    "Caramunich malt": "malt",
    "Carafa Special malt": "malt",
    # adjuncts / sugars
    "Maize": "adjunct",
    "Rice": "adjunct",
    "Glucose syrup": "adjunct",
    "Light candi sugar": "adjunct",
    "Dark candi sugar": "adjunct",
    "Coffee": "adjunct",
    # yeast / cultures
    "Ale yeast": "yeast",
    "Lager yeast": "yeast",
    "Weizen yeast": "yeast",
    "Brettanomyces": "yeast",
    "Lactobacillus": "yeast",
    "Wild yeast": "yeast",
    # spices
    "Coriander": "spice",
    "Curaçao orange peel": "spice",
    "Salt": "spice",
    # fruit
    "Cherries": "fruit",
    "Raspberries": "fruit",
    # other
    "Water": "other",
}

# beer slug -> list of ingredient names, or (name, usage_phase) tuples
Link = str | tuple[str, str]
LINKS: dict[str, list[Link]] = {
    "stella-artois": ["Water", "Barley malt", "Maize", "Saaz"],
    "pilsner-urquell": ["Water", "Pilsner malt", "Saaz", "Lager yeast"],
    "jupiler": ["Water", "Barley malt", "Maize", "Hops", "Lager yeast"],
    "corona-extra": ["Water", "Barley malt", "Maize", "Hops", "Lager yeast"],
    "asahi-super-dry": ["Water", "Barley malt", "Rice", "Maize", "Hops", "Lager yeast"],
    "tsingtao": ["Water", "Barley malt", "Rice", "Hops", "Lager yeast"],
    "augustiner-helles": ["Water", "Barley malt", "Hops", "Lager yeast"],
    "ayinger-celebrator": ["Water", "Munich malt", "Caramel malt", "Hops", "Lager yeast"],
    "negra-modelo": [
        "Water",
        "Barley malt",
        "Caramel malt",
        "Black malt",
        "Maize",
        "Hops",
        "Lager yeast",
    ],
    "schlenkerla-rauchbier-marzen": ["Water", "Smoked malt", "Hops", "Lager yeast"],
    "reissdorf-kolsch": ["Water", "Pilsner malt", "Spalt", "Ale yeast"],
    "uerige-alt": ["Water", "Barley malt", "Caramel malt", "Roasted barley", "Hops", "Ale yeast"],
    "hoegaarden": [
        "Water",
        "Wheat malt",
        "Barley malt",
        ("Coriander", "boil"),
        ("Curaçao orange peel", "boil"),
        "Hops",
        "Ale yeast",
    ],
    "paulaner-hefe-weissbier": ["Water", "Wheat malt", "Barley malt", "Hops", "Weizen yeast"],
    "schneider-aventinus": [
        "Water",
        "Wheat malt",
        "Pilsner malt",
        "Caramunich malt",
        "Carafa Special malt",
        "Hallertau",
        "Weizen yeast",
    ],
    "schneider-aventinus-eisbock": [
        "Water",
        "Wheat malt",
        "Barley malt",
        "Hallertau",
        "Weizen yeast",
    ],
    "sierra-nevada-pale-ale": [
        "Water",
        "Pale ale malt",
        "Caramel malt",
        "Hops",
        ("Cascade", "whirlpool"),
        "Ale yeast",
    ],
    "pliny-the-elder": [
        "Water",
        "Pale ale malt",
        "Centennial",
        ("Simcoe", "dry-hop"),
        ("Amarillo", "dry-hop"),
        "Chinook",
        "Ale yeast",
    ],
    "heady-topper": ["Water", "Pale ale malt", "Oats", ("Hops", "dry-hop"), "Ale yeast"],
    "leffe-blonde": ["Water", "Barley malt", "Maize", "Glucose syrup", "Hops", "Ale yeast"],
    "grimbergen-blonde": [
        "Water",
        "Barley malt",
        "Wheat malt",
        "Glucose syrup",
        "Caramel malt",
        "Hops",
        "Ale yeast",
    ],
    "la-chouffe": [
        "Water",
        "Barley malt",
        ("Coriander", "boil"),
        "Glucose syrup",
        "Hops",
        "Ale yeast",
    ],
    "delirium-tremens": [
        "Water",
        "Pale ale malt",
        "Styrian Golding",
        "Saaz",
        "Light candi sugar",
        "Ale yeast",
    ],
    "orval": [
        "Water",
        "Barley malt",
        "Light candi sugar",
        "Hallertau",
        ("Styrian Golding", "dry-hop"),
        "Ale yeast",
        ("Brettanomyces", "maturation"),
    ],
    "saison-dupont": ["Water", "Pilsner malt", "East Kent Golding", "Ale yeast"],
    "chimay-bleue": [
        "Water",
        "Pilsner malt",
        "Caramel malt",
        "Torrefied wheat",
        "Dark candi sugar",
        "Saaz",
        "Hallertau",
        "Ale yeast",
    ],
    "westmalle-dubbel": [
        "Water",
        "Pilsner malt",
        "Caramel malt",
        "Dark candi sugar",
        "Tettnang",
        "Styrian Golding",
        "Saaz",
        "Ale yeast",
    ],
    "westvleteren-12": ["Water", "Pilsner malt", "Dark candi sugar", "Hops", "Ale yeast"],
    "fullers-london-pride": [
        "Water",
        "Pale ale malt",
        "Caramel malt",
        "Fuggles",
        "East Kent Golding",
        "Ale yeast",
    ],
    "newcastle-brown-ale": [
        "Water",
        "Pale ale malt",
        "Caramel malt",
        "Chocolate malt",
        "East Kent Golding",
        "Ale yeast",
    ],
    "fullers-london-porter": [
        "Water",
        "Pale ale malt",
        "Caramel malt",
        "Chocolate malt",
        "Fuggles",
        "Ale yeast",
    ],
    "traquair-house-ale": [
        "Water",
        "Pale ale malt",
        "Roasted barley",
        "East Kent Golding",
        "Ale yeast",
    ],
    "sierra-nevada-bigfoot": [
        "Water",
        "Pale ale malt",
        "Caramel malt",
        "Chinook",
        "Cascade",
        "Centennial",
        "Ale yeast",
    ],
    "guinness-draught": ["Water", "Barley malt", "Roasted barley", "Hops", "Ale yeast"],
    "old-rasputin": [
        "Water",
        "Pale ale malt",
        "Roasted barley",
        "Chocolate malt",
        "Black malt",
        "Hops",
        "Ale yeast",
    ],
    "bourbon-county-brand-stout": [
        "Water",
        "Pale ale malt",
        "Roasted barley",
        "Chocolate malt",
        "Caramel malt",
        "Munich malt",
        "Black malt",
        "Hops",
        "Ale yeast",
    ],
    "founders-breakfast-stout": [
        "Water",
        "Pale ale malt",
        "Oats",
        "Chocolate malt",
        "Roasted barley",
        ("Coffee", "maturation"),
        "Hops",
        "Ale yeast",
    ],
    "rodenbach-classic": [
        "Water",
        "Barley malt",
        "Maize",
        "Hops",
        "Ale yeast",
        ("Lactobacillus", "fermentation"),
    ],
    "lindemans-kriek": [
        "Water",
        "Barley malt",
        "Wheat malt",
        "Hops",
        "Wild yeast",
        ("Cherries", "maturation"),
    ],
    "cantillon-gueuze": ["Water", "Barley malt", "Wheat malt", "Hops", "Wild yeast"],
    "cantillon-rose-de-gambrinus": [
        "Water",
        "Barley malt",
        "Wheat malt",
        "Hops",
        "Wild yeast",
        ("Raspberries", "maturation"),
    ],
    "ritterguts-gose": [
        "Water",
        "Barley malt",
        "Wheat malt",
        ("Coriander", "boil"),
        ("Salt", "boil"),
        "Hops",
        "Ale yeast",
        ("Lactobacillus", "fermentation"),
    ],
    "berliner-kindl-weisse": [
        "Water",
        "Wheat malt",
        "Pilsner malt",
        "Hops",
        "Ale yeast",
        ("Lactobacillus", "fermentation"),
    ],
    "samuel-adams-utopias": ["Water", "Pale ale malt", "Caramel malt", "Hops", "Ale yeast"],
}


async def _ensure_ingredients(
    session: AsyncSession,
) -> tuple[dict[str, uuid.UUID], int]:
    """Upsert the ingredient catalog; return (name -> id map, created count).

    Mirrors the other seeders: existing rows have their ``category`` refreshed
    so a drifted catalog is restored on re-run.
    """

    by_name = {
        ing.name: ing
        for ing in (await session.execute(select(Ingredient))).scalars().all()
    }
    created = 0
    for name, category in INGREDIENTS.items():
        existing = by_name.get(name)
        if existing is None:
            session.add(Ingredient(name=name, category=category))
            created += 1
        else:
            existing.category = category
    await session.flush()
    name_to_id = dict(
        (await session.execute(select(Ingredient.name, Ingredient.id))).all()
    )
    return name_to_id, created


async def seed_ingredients(session: AsyncSession) -> tuple[int, int]:
    """Upsert ingredients + beer links. Returns (ingredients_created, links_created)."""

    name_to_id, ingredients_created = await _ensure_ingredients(session)

    beers = dict((await session.execute(select(Beer.slug, Beer.id))).all())

    links_created = 0
    # All-or-nothing: the catalog upsert and links share one transaction, so
    # roll the whole batch back if a link cannot resolve its beer, rather than
    # leaving a caller able to commit a partially-seeded catalog.
    try:
        for beer_slug, items in LINKS.items():
            beer_id = beers.get(beer_slug)
            if beer_id is None:
                raise ValueError(f"Beer slug '{beer_slug}' not found — run seed_beers.py first")
            for item in items:
                name, phase = item if isinstance(item, tuple) else (item, None)
                ingredient_id = name_to_id[name]
                existing_link = (
                    await session.execute(
                        select(BeerIngredient).where(
                            BeerIngredient.beer_id == beer_id,
                            BeerIngredient.ingredient_id == ingredient_id,
                        )
                    )
                ).scalar_one_or_none()
                if existing_link is None:
                    session.add(
                        BeerIngredient(
                            beer_id=beer_id,
                            ingredient_id=ingredient_id,
                            usage_phase=phase,
                        )
                    )
                    links_created += 1
                else:
                    existing_link.usage_phase = phase
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    return ingredients_created, links_created


async def main() -> None:
    engine = create_engine(get_database_url())
    factory = create_session_factory(engine)
    try:
        async with factory() as session:
            ing, links = await seed_ingredients(session)
            print(f"Ingredients seeded: {ing} created; beer links: {links} created.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
