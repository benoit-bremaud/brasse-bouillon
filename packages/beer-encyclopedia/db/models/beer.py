"""Beer model."""

from __future__ import annotations

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Numeric, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from db.models.brewery import Brewery
    from db.models.ingredient import BeerIngredient
    from db.models.media import Media
    from db.models.style import Style
    from db.models.tasting_profile import TastingProfile


class Beer(Base, UUIDMixin, TimestampMixin):
    """Individual beer — a named product from a brewery.

    A beer may outlive its brewery (``ON DELETE SET NULL``) because the
    encyclopedia keeps historical records of defunct breweries.
    """

    __tablename__ = "beers"

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
    )
