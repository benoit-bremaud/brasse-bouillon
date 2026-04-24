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
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

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
        CheckConstraint(
            "source IN ('openfoodfacts', 'internal', 'community')",
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
    source: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="internal",
        server_default="internal",
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
