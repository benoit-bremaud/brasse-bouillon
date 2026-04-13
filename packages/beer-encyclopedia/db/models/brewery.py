"""Brewery model."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Numeric, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from db.models.beer import Beer
    from db.models.media import Media


class Brewery(Base, UUIDMixin, TimestampMixin):
    """Brewery entity — the producer of one or more beers."""

    __tablename__ = "breweries"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    brewery_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address_1: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address_2: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address_3: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state_province: Mapped[str | None] = mapped_column(String(100), nullable=True)
    postal_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(11, 8), nullable=True)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(10, 8), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    website_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    founded_year: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    beers: Mapped[list[Beer]] = relationship(back_populates="brewery")
    media: Mapped[list[Media]] = relationship(
        back_populates="brewery",
        primaryjoin="Brewery.id == Media.brewery_id",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
