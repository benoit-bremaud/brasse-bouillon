"""Pydantic schemas for the /beers endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from api.schemas.common import PaginationMeta

# EAN-8, UPC-A (12), EAN-13, EAN-14 — the four formats commonly found
# on beverage packaging. The pattern matches what the ORM validator
# accepts so a 422 from the API surfaces the same error message a CLI
# caller would see.
_EAN_PATTERN: str = r"^\d{8}(?:\d{4}|\d{5}|\d{6})?$"


class BeerBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    brewery_id: uuid.UUID | None = None
    style_id: uuid.UUID | None = None
    abv: Decimal | None = Field(default=None, ge=0, le=100)
    ibu: int | None = Field(default=None, ge=0, le=1000)
    srm: int | None = Field(default=None, ge=0, le=100)
    description: str | None = None
    is_active: bool = True


class BeerCreate(BeerBase):
    """Body payload for ``POST /beers``."""


class BeerUpdate(BaseModel):
    """Body payload for ``PATCH /beers/{id}`` — every field optional."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    brewery_id: uuid.UUID | None = None
    style_id: uuid.UUID | None = None
    abv: Decimal | None = Field(default=None, ge=0, le=100)
    ibu: int | None = Field(default=None, ge=0, le=1000)
    srm: int | None = Field(default=None, ge=0, le=100)
    description: str | None = None
    is_active: bool | None = None
    is_verified: bool | None = None


class BeerRead(BeerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    is_verified: bool
    source: str
    ean_code: str | None = None
    legal_denomination: str | None = None
    country_of_origin: str | None = None
    allergens: list[str] | None = None
    alcohol_group: int | None = None
    created_at: datetime
    updated_at: datetime


class BeerList(BaseModel):
    items: list[BeerRead] = Field(default_factory=list)
    meta: PaginationMeta


class BeerImportByEanRequest(BaseModel):
    """Body payload for ``POST /beers/import-by-ean``.

    Stand-alone schema — the import flow only needs the EAN, the rest
    of the beer payload is derived from the external source. Length
    range covers EAN-8, UPC-A (12), EAN-13 and EAN-14; the regex
    pattern blocks non-digit input at the API edge with the same rule
    the ORM validator applies.
    """

    ean: str = Field(
        min_length=8,
        max_length=14,
        pattern=_EAN_PATTERN,
        description="EAN-8 / UPC-A / EAN-13 / EAN-14 product barcode.",
    )
