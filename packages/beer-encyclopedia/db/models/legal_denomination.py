"""French legal denomination reference model.

Backed by the French regulatory framework on beer composition and
labelling — primarily decree 92-307 of 31 March 1992, modified by decree
2016-1531 of 15 November 2016. Each row maps a controlled vocabulary
code (snake_case) to its canonical label, the discriminating criterion
that defines the denomination, and a pointer to the source text. Used
to populate UI dropdowns and to validate ``Beer.legal_denomination``
against an authoritative whitelist.

The ``label`` column stores the French wording because this is the
French-locale reference table. Internationalisation (German, English,
…) will be handled by a future ``LegalDenominationLabel(locale, label)``
sibling table rather than by suffixing column names.

Scope is intentionally France-only for v0.2; other locales (Belgium,
Germany, etc.) will get sibling rows or sibling tables in later iterations.
"""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import CheckConstraint, Numeric, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from db.models.base import Base, TimestampMixin, UUIDMixin

# The ten canonical legal denominations defined by the French decree
# 92-307 modified by 2016-1531. Kept as a module-level constant so the
# migration CHECK constraint, the seed script, and the validator stay in
# sync. Codes use the original French snake_case form because there is
# no English equivalent in the French regulation.
#
# Order mirrors the structure of the decree itself: the generic
# definition first, then categorisation by alcohol content, then by
# composition, then by process, then by additives, then derived
# products, and finally the producer-qualifying mention. Keeping the
# list in this order helps any reader cross-reference with the decree.
LEGAL_DENOMINATION_VALUES: tuple[str, ...] = (
    # Generic definition (Art. 1)
    "biere",
    # By alcohol content
    "biere_sans_alcool",
    "biere_forte",
    # By composition
    "pur_malt",
    # By process
    "biere_de_garde",
    "biere_fermentation_lactique",
    # By additives
    "biere_a_ingredient",
    "biere_aromatisee",
    # Derived product
    "panache",
    # Producer-qualifying mention
    "biere_artisanale",
)


class LegalDenomination(Base, UUIDMixin, TimestampMixin):
    """Reference entry for a French legal beer denomination.

    Each row maps a canonical snake_case ``code`` (e.g. ``biere_de_garde``)
    to its French ``label`` and the discriminating criterion that the
    decree attaches to it. Consumed by:

    - the ``Beer.legal_denomination`` CHECK constraint (whitelist
      enforcement at the DB level)
    - the mobile UI dropdowns and explanatory tooltips (queries the
      ``label`` and ``description`` columns)
    - the future PR3 community-validation flow (uses ``min_aging_days``
      and ``max_alcohol_pct`` to flag inconsistent claims)

    See ADR-0002 for the rationale (dedicated table vs. enum, no FK to
    keep the reference re-seedable, French snake_case for traceability
    with the regulation).
    """

    __tablename__ = "legal_denominations"
    __table_args__ = (
        CheckConstraint(
            "code IN ({})".format(
                ", ".join(f"'{v}'" for v in LEGAL_DENOMINATION_VALUES)
            ),
            name="ck_legal_denominations_code_valid",
        ),
        CheckConstraint(
            "min_aging_days IS NULL OR min_aging_days >= 0",
            name="ck_legal_denominations_min_aging_positive",
        ),
        CheckConstraint(
            "max_alcohol_pct IS NULL OR max_alcohol_pct >= 0",
            name="ck_legal_denominations_max_alcohol_positive",
        ),
    )

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    legal_reference: Mapped[str] = mapped_column(String(255), nullable=False)
    min_aging_days: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    max_alcohol_pct: Mapped[Decimal | None] = mapped_column(
        Numeric(4, 2), nullable=True
    )
