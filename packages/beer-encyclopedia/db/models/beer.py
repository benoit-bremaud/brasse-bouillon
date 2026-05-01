"""Beer model."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from sqlalchemy.types import JSON

from db.models.base import Base, TimestampMixin, UUIDMixin
from db.models.legal_denomination import LEGAL_DENOMINATION_VALUES

if TYPE_CHECKING:
    from db.models.brewery import Brewery
    from db.models.ingredient import BeerIngredient
    from db.models.media import Media
    from db.models.style import Style
    from db.models.tasting_profile import TastingProfile


# The three canonical provenance values a Beer row can carry. Kept as a
# module-level constant so migration and validation logic reference a
# single source of truth.
BEER_SOURCE_VALUES = ("openfoodfacts", "internal", "community")

# Valid alcohol groups under article L-3321-1 of the French Code de la
# santé publique. Group 2 was historically merged into group 3, so the
# current legal nomenclature exposes only {1, 3, 4, 5} — beer falls in
# group 3 (fermented non-distilled drinks alongside wine, cider, mead).
ALCOHOL_GROUP_VALUES: tuple[int, ...] = (1, 3, 4, 5)

# JSONB on PostgreSQL (indexable, queryable), JSON on other dialects
# (SQLite under tests). Mirrors the pattern in db/models/source.py so the
# allergens column is portable across environments.
_AllergensType = JSON().with_variant(JSONB(), "postgresql")


class Beer(Base, UUIDMixin, TimestampMixin):
    """Individual beer — a named product from a brewery.

    A beer may outlive its brewery (``ON DELETE SET NULL``) because the
    encyclopedia keeps historical records of defunct breweries.

    Provenance fields (``source`` + ``contributed_by`` / ``contributed_at`` /
    ``approved_at``) anticipate the v0.2 community contribution flow per
    ADR-0001. In v0.1 every beer row carries ``source = 'internal'`` (for
    seeded entries) or ``source = 'openfoodfacts'`` (when imported by the
    scan proxy). ``community`` is reserved for v0.2+ user-submitted beers
    and ``contributed_*`` fields stay ``NULL`` everywhere until then.

    The ``source`` discriminant coexists with the polymorphic
    ``EntitySource`` tracking table: ``Beer.source`` is a shorthand for
    downstream consumers (mobile app, matching algo) that need to branch
    on provenance without joining, while ``EntitySource`` retains
    per-import audit trail with ``raw_data``.
    """

    __tablename__ = "beers"
    __table_args__ = (
        # Constraint expression is derived from BEER_SOURCE_VALUES so the
        # Python tuple and the DDL WHERE-clause can never drift.
        CheckConstraint(
            "source IN ({})".format(
                ", ".join(f"'{v}'" for v in BEER_SOURCE_VALUES)
            ),
            name="ck_beers_source_valid",
        ),
        CheckConstraint(
            "legal_denomination IS NULL OR legal_denomination IN ({})".format(
                ", ".join(f"'{v}'" for v in LEGAL_DENOMINATION_VALUES)
            ),
            name="ck_beers_legal_denomination_valid",
        ),
        CheckConstraint(
            "alcohol_group IS NULL OR alcohol_group IN ({})".format(
                ", ".join(str(v) for v in ALCOHOL_GROUP_VALUES)
            ),
            name="ck_beers_alcohol_group_valid",
        ),
        CheckConstraint(
            "country_of_origin IS NULL OR length(country_of_origin) = 2",
            name="ck_beers_country_of_origin_iso2",
        ),
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    brewery_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("breweries.id", ondelete="SET NULL"),
        nullable=True,
    )
    style_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("styles.id", ondelete="SET NULL"),
        nullable=True,
    )
    abv: Mapped[Decimal | None] = mapped_column(Numeric(4, 2), nullable=True)
    ibu: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    srm: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Provenance fields (ADR-0001 clause 2: shapes anticipate evolution).
    # ``server_default`` uses ``text("'internal'")`` so the emitted DDL is
    # ``DEFAULT 'internal'`` with the quotes — a bare ``"internal"`` would
    # be interpreted as a raw SQL expression and fail on PostgreSQL/SQLite.
    source: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="internal",
        server_default=text("'internal'"),
    )
    # ``contributed_by`` is a loose UUID link to the users table in
    # packages/api (NestJS). No FK because the two services run against
    # separate databases in some deployment topologies — the link is by
    # convention. NULL for every row before the community feature ships.
    contributed_by: Mapped[uuid.UUID | None] = mapped_column(nullable=True)
    contributed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # French regulatory fields (decree 92-307 modified by 2016-1531,
    # regulation EU 1169/2011, article L-3321-1 of the Code de la santé
    # publique). All four are nullable: pre-existing rows and rows
    # imported from non-FR sources may legitimately leave them blank.
    legal_denomination: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )
    country_of_origin: Mapped[str | None] = mapped_column(String(2), nullable=True)
    allergens: Mapped[list[str] | None] = mapped_column(_AllergensType, nullable=True)
    alcohol_group: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    brewery: Mapped[Brewery | None] = relationship(back_populates="beers")
    style: Mapped[Style | None] = relationship(back_populates="beers")
    tasting_profile: Mapped[TastingProfile | None] = relationship(
        back_populates="beer",
        uselist=False,
        cascade="all, delete-orphan",
    )
    ingredients: Mapped[list[BeerIngredient]] = relationship(
        back_populates="beer",
        cascade="all, delete-orphan",
    )
    media: Mapped[list[Media]] = relationship(
        back_populates="beer",
        primaryjoin="Beer.id == Media.beer_id",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    @validates("source")
    def _validate_source(self, _key: str, value: str) -> str:
        """Reject invalid ``source`` values at the ORM layer.

        The DB CHECK constraint catches raw-SQL inserts, but without this
        validator an ORM assignment like ``beer.source = "typo"`` would
        travel silently to flush time and then raise an
        ``IntegrityError``. Validating here surfaces the error at the
        point of assignment with a readable message.
        """
        if value not in BEER_SOURCE_VALUES:
            valid = ", ".join(BEER_SOURCE_VALUES)
            raise ValueError(
                f"Beer.source must be one of ({valid}), got {value!r}"
            )
        return value

    @validates("legal_denomination")
    def _validate_legal_denomination(
        self, _key: str, value: str | None
    ) -> str | None:
        """Reject invalid ``legal_denomination`` values at the ORM layer.

        Same rationale as ``_validate_source``: surface the error at
        assignment time rather than at flush time. ``None`` is allowed
        because the field is optional (only meaningful for FR beers).
        """
        if value is None:
            return value
        if value not in LEGAL_DENOMINATION_VALUES:
            valid = ", ".join(LEGAL_DENOMINATION_VALUES)
            raise ValueError(
                f"Beer.legal_denomination must be one of ({valid}) or None, "
                f"got {value!r}"
            )
        return value

    @validates("alcohol_group")
    def _validate_alcohol_group(
        self, _key: str, value: int | None
    ) -> int | None:
        """Reject invalid ``alcohol_group`` values at the ORM layer.

        Article L-3321-1 of the French Code de la santé publique exposes
        only groups {1, 3, 4, 5} — group 2 was merged into group 3.
        ``None`` is allowed for non-FR beers.
        """
        if value is None:
            return value
        if value not in ALCOHOL_GROUP_VALUES:
            valid = ", ".join(str(v) for v in ALCOHOL_GROUP_VALUES)
            raise ValueError(
                f"Beer.alcohol_group must be one of ({valid}) or None, "
                f"got {value!r}"
            )
        return value

    @validates("country_of_origin")
    def _validate_country_of_origin(
        self, _key: str, value: str | None
    ) -> str | None:
        """Normalize ``country_of_origin`` to uppercase ISO 3166-1 alpha-2.

        Accepts mixed case input ("fr", "Fr", "FR") and stores uppercase.
        Rejects non-letter characters at the ORM layer so junk like
        ``"!!"`` or ``"12"`` cannot reach the DB even though it would
        pass the length-only CHECK constraint. ``isascii()`` is required
        in addition to ``isalpha()`` because Python treats Latin-extended
        letters such as ``"Å"`` as alphabetical, but ISO 3166-1 alpha-2
        codes are always two ASCII letters by specification — accepting
        ``"ÅB"`` would persist invalid data.
        """
        if value is None:
            return value
        if len(value) != 2 or not value.isalpha() or not value.isascii():
            raise ValueError(
                f"Beer.country_of_origin must be a 2-letter ASCII ISO "
                f"code, got {value!r}"
            )
        return value.upper()
