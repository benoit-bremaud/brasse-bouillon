"""External data source importers.

Each module under this package wraps a third-party API or dataset and
returns an ``ExternalBeerSnapshot`` that the upsert logic in the beers
router can consume uniformly. The encyclopedia stays unaware of the
shape of each remote schema — translation happens here, persistence
happens in the router.
"""

from importers.base import ExternalBeerSnapshot
from importers.openfoodfacts import OpenFoodFactsClient, OpenFoodFactsError
from importers.persistence import (
    SourceNotSeededError,
    UpsertResult,
    upsert_beer_from_snapshot,
)

__all__ = [
    "ExternalBeerSnapshot",
    "OpenFoodFactsClient",
    "OpenFoodFactsError",
    "SourceNotSeededError",
    "UpsertResult",
    "upsert_beer_from_snapshot",
]
