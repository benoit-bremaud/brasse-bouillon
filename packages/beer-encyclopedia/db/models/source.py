"""Data source registry and polymorphic provenance link."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from db.models.base import Base, TimestampMixin, UUIDMixin

# Use JSONB on PostgreSQL (indexable, faster) but fall back to JSON on other
# dialects (e.g. SQLite in tests) so the metadata is still portable.
_JsonType = JSON().with_variant(JSONB(), "postgresql")


class Source(Base, UUIDMixin, TimestampMixin):
    """Authoritative registry of every external data source we ingest from."""

    __tablename__ = "sources"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String(30), nullable=False)
    base_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    entity_links: Mapped[list[EntitySource]] = relationship(back_populates="source")


class EntitySource(Base, UUIDMixin):
    """Polymorphic link between a Source and any tracked entity.

    ``entity_type`` is the discriminator ('brewery' | 'beer'); ``entity_id``
    is the UUID of the target row. ``external_id`` is the id on the source
    system, used for idempotent re-imports. ``raw_data`` keeps the original
    payload (JSONB on PG) so the transform can be re-run without a re-fetch.
    """

    __tablename__ = "entity_sources"
    __table_args__ = (
        UniqueConstraint(
            "source_id", "entity_type", "external_id", name="uq_entity_sources_triplet"
        ),
    )

    source_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sources.id", ondelete="CASCADE"),
        nullable=False,
    )
    entity_type: Mapped[str] = mapped_column(String(30), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_synced_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    raw_data: Mapped[dict | None] = mapped_column(_JsonType, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    source: Mapped[Source] = relationship(back_populates="entity_links")
