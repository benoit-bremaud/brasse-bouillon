"""Ingredient model and beer↔ingredient junction."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from db.models.beer import Beer


class Ingredient(Base, UUIDMixin, TimestampMixin):
    """A single ingredient (malt, hop, yeast, adjunct, etc.)."""

    __tablename__ = "ingredients"

    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    beer_links: Mapped[list[BeerIngredient]] = relationship(back_populates="ingredient")


class BeerIngredient(Base):
    """Composite-keyed junction between ``beers`` and ``ingredients``."""

    __tablename__ = "beer_ingredients"

    beer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("beers.id", ondelete="CASCADE"),
        primary_key=True,
    )
    ingredient_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("ingredients.id", ondelete="CASCADE"),
        primary_key=True,
    )
    amount: Mapped[str | None] = mapped_column(String(50), nullable=True)
    usage_phase: Mapped[str | None] = mapped_column(String(30), nullable=True)

    beer: Mapped[Beer] = relationship(back_populates="ingredients")
    ingredient: Mapped[Ingredient] = relationship(back_populates="beer_links")
