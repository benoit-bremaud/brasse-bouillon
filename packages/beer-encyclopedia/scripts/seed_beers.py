"""Seed the ``beers`` table (+ tasting profiles) with the curated corpus.

44 mainstream/iconic beers researched and consolidated against public sources
(official brewery pages, BeerAdvocate, Untappd, BJCP). Each beer links to its
``Brewery`` and ``Style`` by slug (run ``seed_breweries.py`` and
``seed_styles.py`` first), carries IBU/colour as min/max intervals (ADR-0017,
SRM canonical — EBC estimates converted with SRM = round(EBC / 1.97) and
rounded outward), and a 1–5 ``TastingProfile``.

Newly inserted rows get ``is_verified=False`` (maintainer validation pending,
ADR-0015); re-seeding preserves the verification state of existing rows.
``source='openfoodfacts'`` for the three EAN-confirmed beers, ``'internal'``
otherwise. OpenFoodFacts category errors are NOT propagated: every abbey/blonde
mis-tagged "lager" by OFF is seeded with its true ale style (scan spec §8.5).

Idempotent: matched by ``ean_code`` first when present, then by beer ``slug``;
tasting profiles matched by ``beer_id``.
"""

from __future__ import annotations

import asyncio
import uuid
from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import create_engine, create_session_factory, get_database_url
from db.models import Beer, Brewery, Style, TastingProfile


@dataclass(frozen=True)
class BeerSeed:
    name: str
    slug: str
    brewery_slug: str
    style_slug: str | None
    abv: Decimal | None
    ibu: tuple[int | None, int | None]
    srm: tuple[int | None, int | None]
    country: str | None  # ISO 3166-1 alpha-2
    ean: str | None
    source: str
    taste: tuple[int, int, int, int]  # bitterness, sweetness, body, carbonation
    aroma: str
    flavor: str


_OFF = "openfoodfacts"
_INT = "internal"


def _d(value: str) -> Decimal:
    return Decimal(value)


BEERS: list[BeerSeed] = [
    BeerSeed(
        "Stella Artois",
        "stella-artois",
        "brouwerij-artois",
        "international_pale_lager",
        _d("5.2"),
        (20, 33),
        (3, 5),
        "BE",
        None,
        _INT,
        (3, 2, 2, 4),
        "floral noble hops",
        "crisp, dry, light malt",
    ),
    BeerSeed(
        "Pilsner Urquell",
        "pilsner-urquell",
        "plzensky-prazdroj",
        "pilsner",
        _d("4.4"),
        (38, 40),
        (3, 7),
        "CZ",
        None,
        _INT,
        (4, 2, 3, 4),
        "Saaz, bready malt",
        "bready malt, firm bitterness",
    ),
    BeerSeed(
        "Jupiler",
        "jupiler",
        "brasserie-piedboeuf",
        "international_pale_lager",
        _d("5.2"),
        (25, 25),
        (3, 5),
        "BE",
        None,
        _INT,
        (2, 2, 2, 4),
        "light grain",
        "crisp, dry",
    ),
    BeerSeed(
        "Corona Extra",
        "corona-extra",
        "grupo-modelo",
        "international_pale_lager",
        _d("4.6"),
        (18, 18),
        (2, 3),
        "MX",
        None,
        _INT,
        (1, 2, 1, 4),
        "light, neutral",
        "very light, subtle sweetness",
    ),
    BeerSeed(
        "Asahi Super Dry",
        "asahi-super-dry",
        "asahi-breweries",
        "international_pale_lager",
        _d("5.2"),
        (20, 20),
        (3, 4),
        "JP",
        None,
        _INT,
        (2, 1, 2, 4),
        "clean, faint grain",
        "bone-dry, crisp",
    ),
    BeerSeed(
        "Tsingtao",
        "tsingtao",
        "tsingtao-brewery",
        "international_pale_lager",
        _d("4.7"),
        (10, 25),
        (3, 4),
        "CN",
        None,
        _INT,
        (2, 2, 2, 4),
        "light malt",
        "light, balanced",
    ),
    BeerSeed(
        "Augustiner Helles",
        "augustiner-helles",
        "augustiner-brau",
        "munich_helles",
        _d("5.2"),
        (18, 20),
        (3, 5),
        "DE",
        None,
        _INT,
        (2, 2, 3, 3),
        "fresh bread, floral hops",
        "balanced, soft malt, citrus zest",
    ),
    BeerSeed(
        "Ayinger Celebrator",
        "ayinger-celebrator",
        "ayinger-privatbrauerei",
        "doppelbock",
        _d("6.7"),
        (22, 26),
        (20, 35),
        "DE",
        None,
        _INT,
        (3, 4, 5, 2),
        "toffee, dark malt",
        "caramel, coffee, port-like",
    ),
    BeerSeed(
        "Negra Modelo",
        "negra-modelo",
        "grupo-modelo",
        "munich_dunkel",
        _d("5.4"),
        (16, 16),
        (15, 21),
        "MX",
        None,
        _INT,
        (2, 3, 3, 3),
        "dark malt, caramel",
        "caramel, delicate, balanced",
    ),
    BeerSeed(
        "Schlenkerla Rauchbier Märzen",
        "schlenkerla-rauchbier-marzen",
        "heller-brau-trum",
        "rauchbier",
        _d("5.1"),
        (30, 30),
        (15, 26),
        "DE",
        None,
        _INT,
        (3, 2, 3, 3),
        "intense beechwood smoke",
        "smoke, bacon, malty",
    ),
    BeerSeed(
        "Reissdorf Kölsch",
        "reissdorf-kolsch",
        "brauerei-heinrich-reissdorf",
        "kolsch",
        _d("4.8"),
        (27, 27),
        (3, 5),
        "DE",
        None,
        _INT,
        (3, 2, 2, 4),
        "crackery malt, pear",
        "crisp, dry, cedary finish",
    ),
    BeerSeed(
        "Uerige Alt",
        "uerige-alt",
        "uerige",
        "altbier",
        _d("4.7"),
        (45, 50),
        (20, 20),
        "DE",
        None,
        _INT,
        (5, 2, 3, 3),
        "honey, biscuit",
        "firmly bitter, malty, dry",
    ),
    BeerSeed(
        "Hoegaarden",
        "hoegaarden",
        "brouwerij-hoegaarden",
        "witbier",
        _d("4.9"),
        (13, 15),
        (2, 4),
        "BE",
        None,
        _INT,
        (2, 3, 2, 4),
        "orange peel, coriander",
        "citrus, herbal, creamy wheat",
    ),
    BeerSeed(
        "Paulaner Hefe-Weißbier",
        "paulaner-hefe-weissbier",
        "paulaner",
        "hefeweizen",
        _d("5.5"),
        (12, 12),
        (6, 10),
        "DE",
        None,
        _INT,
        (2, 3, 3, 4),
        "banana, clove",
        "banana, clove, creamy",
    ),
    BeerSeed(
        "Schneider Aventinus",
        "schneider-aventinus",
        "g-schneider-und-sohn",
        "weizenbock",
        _d("8.2"),
        (16, 16),
        (22, 22),
        "DE",
        None,
        _INT,
        (3, 4, 4, 4),
        "banana, dark fruit",
        "caramel, raisin, clove, cocoa",
    ),
    BeerSeed(
        "Schneider Aventinus Eisbock",
        "schneider-aventinus-eisbock",
        "g-schneider-und-sohn",
        "eisbock",
        _d("12.0"),
        (15, 15),
        (23, 30),
        "DE",
        None,
        _INT,
        (3, 5, 5, 2),
        "ripe plum, marzipan",
        "concentrated, plum, bitter almond",
    ),
    BeerSeed(
        "Sierra Nevada Pale Ale",
        "sierra-nevada-pale-ale",
        "sierra-nevada-brewing",
        "american_pale_ale",
        _d("5.6"),
        (38, 38),
        (10, 10),
        "US",
        None,
        _INT,
        (4, 2, 3, 3),
        "Cascade pine, citrus",
        "grapefruit, pine, caramel malt",
    ),
    BeerSeed(
        "Pliny the Elder",
        "pliny-the-elder",
        "russian-river-brewing",
        "double_ipa",
        _d("8.0"),
        (100, 100),
        (6, 9),
        "US",
        None,
        _INT,
        (5, 2, 3, 3),
        "citrus, pine, floral",
        "resinous, dry, balanced",
    ),
    BeerSeed(
        "Heady Topper",
        "heady-topper",
        "the-alchemist",
        "neipa",
        _d("8.0"),
        (60, 100),
        (6, 10),
        "US",
        None,
        _INT,
        (4, 2, 3, 3),
        "tropical fruit, citrus",
        "juicy, pine, low astringency",
    ),
    BeerSeed(
        "Leffe Blonde",
        "leffe-blonde",
        "abbaye-de-leffe",
        "blonde_ale",
        _d("6.6"),
        (20, 20),
        (5, 5),
        "BE",
        "5410228142218",
        _OFF,
        (2, 3, 3, 4),
        "spice, clove",
        "malty, fruity, spicy finish",
    ),
    BeerSeed(
        "Grimbergen Blonde",
        "grimbergen-blonde",
        "brasseries-kronenbourg",
        "blonde_ale",
        _d("6.7"),
        (25, 25),
        (5, 5),
        "FR",
        "3080216049632",
        _OFF,
        (2, 3, 3, 4),
        "ripe yellow fruit, banana",
        "honeyed malt, clove, gentle bitterness",
    ),
    BeerSeed(
        "La Chouffe",
        "la-chouffe",
        "brasserie-d-achouffe",
        "belgian_golden_strong",
        _d("8.0"),
        (20, 28),
        (4, 5),
        "BE",
        "5410769100081",
        _OFF,
        (3, 3, 3, 4),
        "coriander, citrus",
        "fruity, spiced, hoppy",
    ),
    BeerSeed(
        "Delirium Tremens",
        "delirium-tremens",
        "brouwerij-huyghe",
        "belgian_golden_strong",
        _d("8.5"),
        (24, 24),
        (4, 6),
        "BE",
        None,
        _INT,
        (3, 3, 3, 4),
        "citrus, pear, honey",
        "lemon, apricot, clove, white pepper",
    ),
    BeerSeed(
        "Orval",
        "orval",
        "brasserie-d-orval",
        "belgian_pale_ale",
        _d("6.2"),
        (32, 32),
        (6, 10),
        "BE",
        None,
        _INT,
        (4, 2, 3, 4),
        "Brett, leather, hops",
        "fruity, dry, long bitter finish",
    ),
    BeerSeed(
        "Saison Dupont",
        "saison-dupont",
        "brasserie-dupont",
        "saison",
        _d("6.5"),
        (30, 30),
        (3, 6),
        "BE",
        None,
        _INT,
        (3, 2, 2, 5),
        "fresh bread, citrus",
        "peppery, zesty hop, dry",
    ),
    BeerSeed(
        "Chimay Bleue (Grande Réserve)",
        "chimay-bleue",
        "bieres-de-chimay",
        "quadrupel",
        _d("9.0"),
        (35, 35),
        (20, 22),
        "BE",
        None,
        _INT,
        (3, 4, 4, 3),
        "dates, fig, dark bread",
        "plum, raisin, nutmeg, peppery",
    ),
    BeerSeed(
        "Westmalle Dubbel",
        "westmalle-dubbel",
        "brouwerij-westmalle",
        "dubbel",
        _d("7.0"),
        (24, 24),
        (15, 21),
        "BE",
        None,
        _INT,
        (2, 4, 4, 3),
        "caramel, ripe banana",
        "malt, herby, fruity, dry finish",
    ),
    BeerSeed(
        "Westvleteren 12",
        "westvleteren-12",
        "brouwerij-westvleteren",
        "quadrupel",
        _d("10.2"),
        (38, 38),
        (20, 24),
        "BE",
        None,
        _INT,
        (3, 4, 5, 3),
        "caramel, chocolate",
        "raisin, nutty, warming",
    ),
    BeerSeed(
        "Fuller's London Pride",
        "fullers-london-pride",
        "fullers-griffin-brewery",
        "best_bitter",
        _d("4.7"),
        (29, 29),
        (10, 16),
        "GB",
        None,
        _INT,
        (3, 3, 3, 2),
        "caramel, toffee",
        "biscuit, balanced bitterness",
    ),
    BeerSeed(
        "Newcastle Brown Ale",
        "newcastle-brown-ale",
        "newcastle-brewery",
        "british_brown_ale",
        _d("4.7"),
        (18, 18),
        (13, 18),
        "GB",
        None,
        _INT,
        (2, 3, 3, 2),
        "caramel, toffee",
        "dried fruit, smooth",
    ),
    BeerSeed(
        "Fuller's London Porter",
        "fullers-london-porter",
        "fullers-griffin-brewery",
        "porter",
        _d("5.4"),
        (30, 30),
        (46, 46),
        "GB",
        None,
        _INT,
        (3, 3, 4, 2),
        "chocolate, coffee",
        "creamy, roasty, caramel",
    ),
    BeerSeed(
        "Traquair House Ale",
        "traquair-house-ale",
        "traquair-house-brewery",
        "wee_heavy",
        _d("7.2"),
        (28, 37),
        (20, 25),
        "GB",
        None,
        _INT,
        (3, 4, 4, 2),
        "malt, caramel, oak",
        "toffee, dark fruit, rich",
    ),
    BeerSeed(
        "Sierra Nevada Bigfoot",
        "sierra-nevada-bigfoot",
        "sierra-nevada-brewing",
        "barleywine",
        _d("9.6"),
        (90, 100),
        (11, 14),
        "US",
        None,
        _INT,
        (5, 4, 5, 2),
        "caramel, raisin, pine",
        "toffee, plum, resinous hops",
    ),
    BeerSeed(
        "Guinness Draught",
        "guinness-draught",
        "guinness",
        "irish_stout",
        _d("4.2"),
        (40, 45),
        (40, 50),
        "IE",
        None,
        _INT,
        (3, 2, 3, 2),
        "roasted barley, coffee",
        "coffee, dark chocolate, creamy",
    ),
    BeerSeed(
        "North Coast Old Rasputin",
        "old-rasputin",
        "north-coast-brewing",
        "imperial_stout",
        _d("9.0"),
        (75, 75),
        (40, 45),
        "US",
        None,
        _INT,
        (4, 4, 5, 2),
        "coffee, dark chocolate",
        "chicory, roast, warming",
    ),
    BeerSeed(
        "Goose Island Bourbon County Brand Stout",
        "bourbon-county-brand-stout",
        "goose-island",
        "imperial_stout",
        _d("14.10"),
        (60, 60),
        (40, 50),
        "US",
        None,
        _INT,
        (3, 5, 5, 2),
        "bourbon, charred oak",
        "fudge, vanilla, caramel, smoke",
    ),
    BeerSeed(
        "Founders Breakfast Stout",
        "founders-breakfast-stout",
        "founders-brewing",
        "imperial_stout",
        _d("8.3"),
        (60, 60),
        (38, 45),
        "US",
        None,
        _INT,
        (4, 4, 5, 2),
        "fresh-roasted coffee",
        "chocolate, burnt grain, oatmeal",
    ),
    BeerSeed(
        "Rodenbach Classic",
        "rodenbach-classic",
        "brouwerij-rodenbach",
        "flanders_red",
        _d("5.2"),
        (7, 15),
        (8, 16),
        "BE",
        None,
        _INT,
        (2, 3, 2, 3),
        "cherry, balsamic",
        "sour, red fruit, oak",
    ),
    BeerSeed(
        "Lindemans Kriek",
        "lindemans-kriek",
        "brouwerij-lindemans",
        "fruit_lambic",
        _d("3.5"),
        (None, None),
        (None, None),
        "BE",
        None,
        _INT,
        (1, 4, 2, 3),
        "cherry",
        "sweet-tart cherry",
    ),
    BeerSeed(
        "Cantillon Gueuze",
        "cantillon-gueuze",
        "brasserie-cantillon",
        "gueuze",
        _d("5.5"),
        (None, None),
        (3, 6),
        "BE",
        None,
        _INT,
        (2, 1, 2, 4),
        "acidic, funky, oak",
        "tart, fruity, dry",
    ),
    BeerSeed(
        "Cantillon Rosé de Gambrinus",
        "cantillon-rose-de-gambrinus",
        "brasserie-cantillon",
        "fruit_lambic",
        _d("5.0"),
        (None, None),
        (None, None),
        "BE",
        None,
        _INT,
        (1, 2, 2, 4),
        "raspberry",
        "sour raspberry, complex, dry",
    ),
    BeerSeed(
        "Ritterguts Gose",
        "ritterguts-gose",
        "ritterguts-gose",
        "gose",
        _d("4.7"),
        (10, 10),
        (3, 5),
        "DE",
        None,
        _INT,
        (2, 2, 2, 4),
        "lemon, salt, coriander",
        "tart wheat, saline, citrus",
    ),
    BeerSeed(
        "Berliner Kindl Weisse",
        "berliner-kindl-weisse",
        "berliner-kindl",
        "berliner_weisse",
        _d("3.0"),
        (3, 8),
        (2, 3),
        "DE",
        None,
        _INT,
        (1, 1, 1, 4),
        "lemon, green apple",
        "sharp sour, tart wheat",
    ),
    BeerSeed(
        "Samuel Adams Utopias",
        "samuel-adams-utopias",
        "boston-beer-samuel-adams",
        None,
        _d("28.00"),
        (45, 45),
        (40, 50),
        "US",
        None,
        _INT,
        (3, 5, 5, 1),
        "caramel, oak, dried fruit",
        "port-like, cognac, sherry, smoke",
    ),
]


async def _slug_to_id(
    session: AsyncSession, model: type[Beer | Brewery | Style]
) -> dict[str, uuid.UUID]:
    rows = (await session.execute(select(model.slug, model.id))).all()
    return dict(rows)


def _resolve_fks(
    b: BeerSeed,
    breweries: dict[str, uuid.UUID],
    styles: dict[str, uuid.UUID],
) -> tuple[uuid.UUID, uuid.UUID | None]:
    """Resolve the brewery/style foreign keys for a beer, or raise."""

    brewery_id = breweries.get(b.brewery_slug)
    if brewery_id is None:
        raise ValueError(f"Brewery slug '{b.brewery_slug}' not found — run seed_breweries.py first")
    style_id = styles.get(b.style_slug) if b.style_slug else None
    if b.style_slug and style_id is None:
        raise ValueError(f"Style slug '{b.style_slug}' not found — run seed_styles.py first")
    return brewery_id, style_id


async def _find_existing_beer(session: AsyncSession, b: BeerSeed) -> Beer | None:
    """Match an existing row by EAN first (when present), then by slug.

    An OpenFoodFacts import (/beers/import-by-ean) may already hold this
    product under a different slug; matching the unique ``ean_code`` first
    avoids a constraint violation on a blind slug-keyed insert. When the EAN
    and the slug resolve to two *different* rows, fail fast rather than
    silently overwrite a slug into a uniqueness violation.
    """

    by_ean = None
    if b.ean is not None:
        by_ean = (
            await session.execute(select(Beer).where(Beer.ean_code == b.ean))
        ).scalar_one_or_none()

    by_slug = (await session.execute(select(Beer).where(Beer.slug == b.slug))).scalar_one_or_none()

    if by_ean is not None and by_slug is not None and by_ean.id != by_slug.id:
        raise ValueError(
            f"Conflicting beer matches: EAN '{b.ean}' and slug '{b.slug}' resolve to different rows"
        )

    return by_ean or by_slug


def _apply_beer_fields(
    beer: Beer, b: BeerSeed, brewery_id: uuid.UUID, style_id: uuid.UUID | None
) -> None:
    """Copy the seed values onto a (new or existing) Beer instance."""

    beer.name = b.name
    beer.slug = b.slug
    beer.brewery_id = brewery_id
    beer.style_id = style_id
    beer.abv = b.abv
    beer.ibu_min, beer.ibu_max = b.ibu
    beer.srm_min, beer.srm_max = b.srm
    beer.country_of_origin = b.country
    beer.ean_code = b.ean
    beer.source = b.source


async def _upsert_tasting_profile(session: AsyncSession, beer_id: uuid.UUID, b: BeerSeed) -> None:
    """Create or refresh the one-to-one tasting profile of a beer."""

    bitterness, sweetness, body, carbonation = b.taste
    profile = (
        await session.execute(select(TastingProfile).where(TastingProfile.beer_id == beer_id))
    ).scalar_one_or_none()
    if profile is None:
        session.add(
            TastingProfile(
                beer_id=beer_id,
                aroma=b.aroma,
                flavor=b.flavor,
                bitterness=bitterness,
                sweetness=sweetness,
                body=body,
                carbonation=carbonation,
            )
        )
        return
    profile.aroma = b.aroma
    profile.flavor = b.flavor
    profile.bitterness = bitterness
    profile.sweetness = sweetness
    profile.body = body
    profile.carbonation = carbonation


async def seed_beers(session: AsyncSession) -> tuple[int, int]:
    """Upsert the beer corpus + tasting profiles. Returns (created, updated)."""

    breweries = await _slug_to_id(session, Brewery)
    styles = await _slug_to_id(session, Style)

    created = 0
    updated = 0
    # All-or-nothing: per-beer flushes share one transaction, so roll back the
    # whole batch if any beer raises (FK missing, split-key conflict) — a caller
    # that catches the error must not be able to commit a partial corpus.
    try:
        for b in BEERS:
            brewery_id, style_id = _resolve_fks(b, breweries, styles)
            beer = await _find_existing_beer(session, b)
            if beer is None:
                beer = Beer(slug=b.slug)
                session.add(beer)
                created += 1
            else:
                updated += 1
            _apply_beer_fields(beer, b, brewery_id, style_id)
            await session.flush()
            await _upsert_tasting_profile(session, beer.id, b)
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    return created, updated


async def main() -> None:
    engine = create_engine(get_database_url())
    factory = create_session_factory(engine)
    try:
        async with factory() as session:
            created, updated = await seed_beers(session)
            print(f"Beers seeded: {created} created, {updated} updated.")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
