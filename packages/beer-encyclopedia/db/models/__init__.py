"""SQLAlchemy ORM models for the beer-encyclopedia database.

Importing this package registers every model class with ``Base.metadata``,
which Alembic reads for autogenerate support.
"""

from db.models.base import Base, TimestampMixin, UUIDMixin
from db.models.beer import Beer
from db.models.brewery import Brewery
from db.models.correction import CommunityCorrection
from db.models.ingredient import BeerIngredient, Ingredient
from db.models.media import Media
from db.models.source import EntitySource, Source
from db.models.style import Style
from db.models.tasting_profile import TastingProfile

__all__ = [
    "Base",
    "Beer",
    "BeerIngredient",
    "Brewery",
    "CommunityCorrection",
    "EntitySource",
    "Ingredient",
    "Media",
    "Source",
    "Style",
    "TastingProfile",
    "TimestampMixin",
    "UUIDMixin",
]
