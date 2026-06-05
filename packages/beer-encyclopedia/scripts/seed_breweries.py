"""Seed the ``breweries`` table with the curated brewery catalog.

The 39 breweries seeded here are the producers of the curated beer corpus
(see ``seed_beers.py``). Founding years were verified against public sources;
where a brand's abbey predates its brewery, the *brewery* date is used
(e.g. Orval 1931, not the 1132 abbey). ``latitude``/``longitude`` are left
NULL for now (geocoded from city later).

This script is idempotent: running it multiple times updates existing rows
in place (matched by ``slug``) and inserts only what is missing. Newly created
rows get ``is_verified=False`` (maintainer validation pending, ADR-0015);
re-seeding preserves the verification state of existing rows.
"""

from __future__ import annotations

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import create_engine, create_session_factory, get_database_url
from db.models import Brewery

# name, slug, brewery_type, city, country, founded_year
BrewerySeed = tuple[str, str, str, str, str, int | None]

BREWERIES: list[BrewerySeed] = [
    # -- Belgium -------------------------------------------------------------
    ("Brouwerij Artois", "brouwerij-artois", "macro", "Leuven", "Belgium", 1366),
    ("Brasserie Piedbœuf", "brasserie-piedboeuf", "macro", "Jupille-sur-Meuse", "Belgium", 1853),
    ("Abbaye de Leffe", "abbaye-de-leffe", "abbey", "Dinant", "Belgium", 1240),
    ("Brasserie d'Achouffe", "brasserie-d-achouffe", "craft", "Achouffe", "Belgium", 1982),
    ("Brouwerij Huyghe", "brouwerij-huyghe", "independent", "Melle", "Belgium", 1906),
    ("Brasserie d'Orval", "brasserie-d-orval", "trappist", "Villers-devant-Orval", "Belgium", 1931),
    ("Brasserie Dupont", "brasserie-dupont", "independent", "Tourpes", "Belgium", 1844),
    ("Bières de Chimay", "bieres-de-chimay", "trappist", "Chimay", "Belgium", 1862),
    ("Brouwerij Westmalle", "brouwerij-westmalle", "trappist", "Westmalle", "Belgium", 1836),
    (
        "Brouwerij Westvleteren",
        "brouwerij-westvleteren",
        "trappist",
        "Westvleteren",
        "Belgium",
        1838,
    ),
    ("Brouwerij Rodenbach", "brouwerij-rodenbach", "independent", "Roeselare", "Belgium", 1821),
    ("Brouwerij Lindemans", "brouwerij-lindemans", "independent", "Vlezenbeek", "Belgium", 1822),
    ("Brasserie Cantillon", "brasserie-cantillon", "independent", "Brussels", "Belgium", 1900),
    ("Brouwerij Hoegaarden", "brouwerij-hoegaarden", "macro", "Hoegaarden", "Belgium", 1966),
    # -- Germany -------------------------------------------------------------
    ("Augustiner-Bräu", "augustiner-brau", "independent", "Munich", "Germany", 1328),
    ("Ayinger Privatbrauerei", "ayinger-privatbrauerei", "independent", "Aying", "Germany", 1878),
    (
        "Heller-Bräu Trum (Schlenkerla)",
        "heller-brau-trum",
        "independent",
        "Bamberg",
        "Germany",
        1678,
    ),
    (
        "Brauerei Heinrich Reissdorf",
        "brauerei-heinrich-reissdorf",
        "independent",
        "Cologne",
        "Germany",
        1894,
    ),
    ("Uerige", "uerige", "brewpub", "Düsseldorf", "Germany", 1862),
    ("Paulaner", "paulaner", "macro", "Munich", "Germany", 1634),
    ("G. Schneider & Sohn", "g-schneider-und-sohn", "independent", "Kelheim", "Germany", 1872),
    ("Berliner Kindl", "berliner-kindl", "macro", "Berlin", "Germany", 1872),
    ("Ritterguts Gose", "ritterguts-gose", "independent", "Leipzig", "Germany", 1824),
    # -- France / UK / Ireland ----------------------------------------------
    ("Brasseries Kronenbourg", "brasseries-kronenbourg", "macro", "Obernai", "France", 1664),
    (
        "Fuller's (Griffin Brewery)",
        "fullers-griffin-brewery",
        "independent",
        "London",
        "United Kingdom",
        1845,
    ),
    ("Newcastle Brewery", "newcastle-brewery", "macro", "Tadcaster", "United Kingdom", 1927),
    (
        "Traquair House Brewery",
        "traquair-house-brewery",
        "craft",
        "Innerleithen",
        "United Kingdom",
        1965,
    ),
    ("Guinness", "guinness", "macro", "Dublin", "Ireland", 1759),
    # -- Rest of the world ---------------------------------------------------
    ("Plzeňský Prazdroj", "plzensky-prazdroj", "macro", "Plzeň", "Czech Republic", 1842),
    ("Grupo Modelo", "grupo-modelo", "macro", "Mexico City", "Mexico", 1925),
    ("Asahi Breweries", "asahi-breweries", "macro", "Tokyo", "Japan", 1889),
    ("Tsingtao Brewery", "tsingtao-brewery", "macro", "Qingdao", "China", 1903),
    # -- United States -------------------------------------------------------
    ("Sierra Nevada Brewing Co.", "sierra-nevada-brewing", "craft", "Chico", "United States", 1980),
    (
        "Russian River Brewing Company",
        "russian-river-brewing",
        "craft",
        "Santa Rosa",
        "United States",
        1997,
    ),
    ("The Alchemist", "the-alchemist", "craft", "Stowe", "United States", 2003),
    (
        "North Coast Brewing Company",
        "north-coast-brewing",
        "craft",
        "Fort Bragg",
        "United States",
        1988,
    ),
    ("Goose Island Beer Co.", "goose-island", "craft", "Chicago", "United States", 1988),
    ("Founders Brewing Co.", "founders-brewing", "craft", "Grand Rapids", "United States", 1997),
    (
        "Boston Beer Company (Samuel Adams)",
        "boston-beer-samuel-adams",
        "craft",
        "Boston",
        "United States",
        1984,
    ),
]


async def seed_breweries(session: AsyncSession) -> tuple[int, int]:
    """Upsert the brewery catalog. Returns (created, updated) counts."""

    created = 0
    updated = 0

    for name, slug, brewery_type, city, country, founded_year in BREWERIES:
        existing = (
            await session.execute(select(Brewery).where(Brewery.slug == slug))
        ).scalar_one_or_none()

        if existing is None:
            session.add(
                Brewery(
                    name=name,
                    slug=slug,
                    brewery_type=brewery_type,
                    city=city,
                    country=country,
                    founded_year=founded_year,
                )
            )
            created += 1
        else:
            existing.name = name
            existing.brewery_type = brewery_type
            existing.city = city
            existing.country = country
            existing.founded_year = founded_year
            updated += 1

    await session.commit()
    return created, updated


async def main() -> None:
    engine = create_engine(get_database_url())
    factory = create_session_factory(engine)
    try:
        async with factory() as session:
            created, updated = await seed_breweries(session)
            print(f"Breweries seeded: {created} created, {updated} updated.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
