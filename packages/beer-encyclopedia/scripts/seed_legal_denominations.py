"""Seed the ``legal_denominations`` table with the French regulatory catalog.

The ten denominations seeded here implement the controlled vocabulary
defined by decree 92-307 of 31 March 1992, modified by decree 2016-1531
of 15 November 2016 (composition and labelling of beers in France).

Each row carries the discriminating criterion that defines the
denomination, plus a pointer back to the source text. The ``label`` and
``description`` columns are written in French because this is the
French-locale reference table; the column names themselves remain in
English, in line with the package conventions.

This script is idempotent: running it multiple times updates existing
rows in place (matched by ``code``) and inserts only what is missing.
"""

from __future__ import annotations

import asyncio
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from db.engine import create_engine, create_session_factory, get_database_url
from db.models import LegalDenomination

# code, label, description, legal_reference,
# min_aging_days, max_alcohol_pct
DenominationSeed = tuple[
    str, str, str, str,
    int | None, Decimal | None,
]

DECREE_REF: str = (
    "Décret n°92-307 du 31 mars 1992 modifié par le décret n°2016-1531 "
    "du 15 novembre 2016"
)

# Order mirrors LEGAL_DENOMINATION_VALUES (db/models/legal_denomination.py)
# which itself follows the structure of decree 92-307: generic definition,
# then alcohol content, composition, process, additives, derived product,
# producer-qualifying mention.
DENOMINATIONS: list[DenominationSeed] = [
    # Generic definition (Art. 1)
    (
        "biere",
        "Bière",
        "Boisson obtenue par fermentation alcoolique d'un moût préparé "
        "à partir de malt de céréales (au moins 50 % du poids des "
        "matières amylacées), de matières premières céréalières, de "
        "sucres alimentaires, de houblon et d'eau potable.",
        DECREE_REF,
        None,
        None,
    ),
    # By alcohol content
    (
        "biere_sans_alcool",
        "Bière sans alcool",
        "Bière dont le titre alcoométrique acquis est inférieur ou égal "
        "à 1,2 %vol.",
        DECREE_REF,
        None,
        Decimal("1.20"),
    ),
    (
        "biere_forte",
        "Bière forte",
        "Bière dont la densité primitive du moût et le titre "
        "alcoométrique dépassent les seuils définis par le décret "
        "92-307. Catégorie réservée aux bières à degré élevé.",
        DECREE_REF,
        None,
        None,
    ),
    # By composition
    (
        "pur_malt",
        "Pur malt",
        "Bière dont la fermentation est obtenue exclusivement à "
        "partir de malt de céréales, sans ajout de sucres ni de "
        "matières amylacées non maltées.",
        DECREE_REF,
        None,
        None,
    ),
    # By process
    (
        "biere_de_garde",
        "Bière de garde",
        "Bière soumise à une période de garde minimale de 21 jours "
        "après la fermentation principale, permettant la maturation "
        "des arômes.",
        DECREE_REF,
        21,
        None,
    ),
    (
        "biere_fermentation_lactique",
        "Bière de fermentation lactique",
        "Bière ayant subi une fermentation lactique au cours de son "
        "élaboration. Inclut notamment la gueuze et les bières acides "
        "traditionnelles.",
        DECREE_REF,
        None,
        None,
    ),
    # By additives
    (
        "biere_a_ingredient",
        "Bière à [ingrédient]",
        "Bière obtenue par addition ou macération de matières "
        "végétales (fruits, plantes, épices) représentant au maximum "
        "10 % du volume du moût initial.",
        DECREE_REF,
        None,
        None,
    ),
    (
        "biere_aromatisee",
        "Bière aromatisée",
        "Bière à laquelle ont été ajoutés des arômes, naturels ou non, "
        "sans modification substantielle de la base brassicole.",
        DECREE_REF,
        None,
        None,
    ),
    # Derived product
    (
        "panache",
        "Panaché",
        "Mélange de bière et de boisson gazeuse sans alcool dont le "
        "titre alcoométrique acquis est inférieur ou égal à 1,2 %vol.",
        DECREE_REF,
        None,
        Decimal("1.20"),
    ),
    # Producer-qualifying mention
    (
        "biere_artisanale",
        "Bière artisanale",
        "Bière brassée par un opérateur immatriculé en tant que "
        "brasseur et disposant de la qualification professionnelle "
        "correspondante. Mention valorisante encadrée par la DGCCRF.",
        DECREE_REF,
        None,
        None,
    ),
]


async def seed_legal_denominations(
    session: AsyncSession,
) -> tuple[int, int]:
    """Upsert the legal denomination catalog. Returns (created, updated)."""

    created = 0
    updated = 0

    for (
        code,
        label,
        description,
        legal_reference,
        min_aging_days,
        max_alcohol_pct,
    ) in DENOMINATIONS:
        existing = (
            await session.execute(
                select(LegalDenomination).where(LegalDenomination.code == code)
            )
        ).scalar_one_or_none()

        if existing is None:
            session.add(
                LegalDenomination(
                    code=code,
                    label=label,
                    description=description,
                    legal_reference=legal_reference,
                    min_aging_days=min_aging_days,
                    max_alcohol_pct=max_alcohol_pct,
                )
            )
            created += 1
        else:
            existing.label = label
            existing.description = description
            existing.legal_reference = legal_reference
            existing.min_aging_days = min_aging_days
            existing.max_alcohol_pct = max_alcohol_pct
            updated += 1

    await session.commit()
    return created, updated


async def main() -> None:
    engine = create_engine(get_database_url())
    factory = create_session_factory(engine)
    try:
        async with factory() as session:
            created, updated = await seed_legal_denominations(session)
            print(
                f"Legal denominations seeded: {created} created, "
                f"{updated} updated."
            )
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
