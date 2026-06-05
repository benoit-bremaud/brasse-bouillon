"""Beer style reference model."""

from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Numeric, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from db.models.beer import Beer


class Style(Base, UUIDMixin, TimestampMixin):
    """Beer style taxonomy entry.

    The ``slug`` column bridges to the keys used by the ML field extractor
    (``ml/extract.py``) so the scan pipeline can look up enriched metadata.
    """

    __tablename__ = "styles"
    __table_args__ = (
        CheckConstraint("abv_min IS NULL OR abv_min >= 0", name="ck_styles_abv_min_positive"),
        CheckConstraint("abv_max IS NULL OR abv_max >= 0", name="ck_styles_abv_max_positive"),
        CheckConstraint(
            "abv_min IS NULL OR abv_max IS NULL OR abv_min <= abv_max",
            name="ck_styles_abv_range",
        ),
    )

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Canonical BJCP style family (e.g. "Pale Ale", "Pale Lager", "IPA"),
    # supporting the family-graded style similarity of recipe-matching v2
    # (ADR-0016 D2). ``category`` is the fermentation class (Ale/Lager);
    # ``family`` is the finer BJCP grouping used to score "same family"
    # equivalence. Nullable: free-text / unseeded styles may have none.
    family: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    abv_min: Mapped[Decimal | None] = mapped_column(Numeric(4, 2), nullable=True)
    abv_max: Mapped[Decimal | None] = mapped_column(Numeric(4, 2), nullable=True)
    ibu_min: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    ibu_max: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    srm_min: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    srm_max: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    beers: Mapped[list[Beer]] = relationship(back_populates="style")
