"""Tasting profile model (one-to-one with Beer)."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, SmallInteger, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from db.models.beer import Beer


class TastingProfile(Base, UUIDMixin, TimestampMixin):
    """Qualitative + quantitative tasting notes for a single beer."""

    __tablename__ = "tasting_profiles"
    __table_args__ = (
        CheckConstraint(
            "bitterness IS NULL OR bitterness BETWEEN 1 AND 5",
            name="ck_tasting_bitterness_range",
        ),
        CheckConstraint(
            "sweetness IS NULL OR sweetness BETWEEN 1 AND 5",
            name="ck_tasting_sweetness_range",
        ),
        CheckConstraint(
            "body IS NULL OR body BETWEEN 1 AND 5",
            name="ck_tasting_body_range",
        ),
        CheckConstraint(
            "carbonation IS NULL OR carbonation BETWEEN 1 AND 5",
            name="ck_tasting_carbonation_range",
        ),
    )

    beer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("beers.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    aroma: Mapped[str | None] = mapped_column(Text, nullable=True)
    appearance: Mapped[str | None] = mapped_column(Text, nullable=True)
    flavor: Mapped[str | None] = mapped_column(Text, nullable=True)
    mouthfeel: Mapped[str | None] = mapped_column(Text, nullable=True)
    overall: Mapped[str | None] = mapped_column(Text, nullable=True)
    bitterness: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    sweetness: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    body: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    carbonation: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    beer: Mapped[Beer] = relationship(back_populates="tasting_profile")
