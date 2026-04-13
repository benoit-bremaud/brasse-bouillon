"""Scan endpoint API schemas.

Currently re-exports the ML-internal schemas verbatim — the contract has
not diverged yet. Keeping the indirection makes a future split painless:
when the API needs a pagination wrapper or wants to hide ML internals,
only this module changes, not every route handler.
"""

from __future__ import annotations

from ml.schemas import (
    DetectionRegion,
    ExtractedFields,
    Recipe,
    RecipeSuggestion,
    ScanExtraction,
    ScanResponse,
)

__all__ = [
    "DetectionRegion",
    "ExtractedFields",
    "Recipe",
    "RecipeSuggestion",
    "ScanExtraction",
    "ScanResponse",
]
