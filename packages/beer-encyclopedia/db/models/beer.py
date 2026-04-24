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
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from db.models.base import Base, TimestampMixin, UUIDMixin

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
