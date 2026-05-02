"""Common types shared by external data source importers.

The ``ExternalBeerSnapshot`` dataclass is the lingua franca between the
importers (which know about external schemas) and the upsert logic
(which only knows about the encyclopedia models). Adding a new source
means writing a client that returns this dataclass — nothing else in
the codebase has to change.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal


@dataclass(slots=True)
class ExternalBeerSnapshot:
    """Normalised view of a beer fetched from an external source.

    All optional fields default to ``None`` (or empty list for
    ``allergens``) so an importer can populate only what the source
    actually provides without padding the rest. ``raw_payload`` keeps
    the original JSON for the ``EntitySource.raw_data`` audit trail —
    consumers should never rely on it for business logic, only for
    re-transform when the mapping evolves.
    """

    external_id: str
    """The id used by the source system (typically the EAN code)."""

    name: str
    """Human-readable beer name (used as `Beer.name`)."""

    brand: str | None = None
    """Producer / brewery name as advertised on the label."""

    abv: Decimal | None = None
    """Alcohol by volume in ``%vol``. ``None`` when the source omits it."""

    country_of_origin: str | None = None
    """ISO 3166-1 alpha-2 code (uppercase). ``None`` when unknown."""

    allergens: list[str] = field(default_factory=list)
    """Normalised allergen tokens (e.g. ``["gluten", "sulfites"]``)."""

    image_url: str | None = None
    """URL of the front-label image, when the source publishes one."""

    raw_payload: dict = field(default_factory=dict)
    """Original payload kept for the ``EntitySource.raw_data`` audit trail."""
