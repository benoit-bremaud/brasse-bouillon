"""Media attachments (label photos, logos, bottle shots)."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from db.models.beer import Beer
    from db.models.brewery import Brewery


class Media(Base, UUIDMixin, TimestampMixin):
    """Image or asset attached to a beer or brewery.

    Exactly one of ``beer_id`` / ``brewery_id`` must be set (enforced by a
    CHECK constraint). Polymorphic parent avoids a separate media table per
    entity type while keeping referential integrity.
    """

    __tablename__ = "media"
    __table_args__ = (
        CheckConstraint(
            "beer_id IS NOT NULL OR brewery_id IS NOT NULL",
            name="ck_media_parent_required",
        ),
    )

    beer_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("beers.id", ondelete="CASCADE"),
        nullable=True,
    )
    brewery_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("breweries.id", ondelete="CASCADE"),
        nullable=True,
    )
    media_type: Mapped[str] = mapped_column(String(30), nullable=False)
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    uploaded_by: Mapped[str | None] = mapped_column(String(100), nullable=True)

    beer: Mapped[Beer | None] = relationship(back_populates="media", foreign_keys=[beer_id])
    brewery: Mapped[Brewery | None] = relationship(
        back_populates="media", foreign_keys=[brewery_id]
    )
