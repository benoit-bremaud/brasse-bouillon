"""Pydantic schemas for the /beers endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from api.schemas.common import PaginationMeta


def _validate_intervals(
    ibu_min: int | None,
    ibu_max: int | None,
    srm_min: int | None,
    srm_max: int | None,
) -> None:
    """Reject inverted IBU/SRM intervals at the API edge (422, not a DB 500).

    Mirrors the ``ck_beers_{ibu,srm}_range`` CHECK constraints so an inverted
    payload surfaces as a 422 before reaching the database (where it would
    raise IntegrityError and trigger a needless slug retry). Only ordering is
    checked here; per-bound bounds stay on the Field validators.
    """

    if ibu_min is not None and ibu_max is not None and ibu_min > ibu_max:
        raise ValueError("ibu_min must be less than or equal to ibu_max")
    if srm_min is not None and srm_max is not None and srm_min > srm_max:
        raise ValueError("srm_min must be less than or equal to srm_max")

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
    # IBU / SRM as min/max intervals (ADR-0017): min == max is a known value,
    # min < max a genuine range, both None unknown.
    ibu_min: int | None = Field(default=None, ge=0, le=1000)
    ibu_max: int | None = Field(default=None, ge=0, le=1000)
    srm_min: int | None = Field(default=None, ge=0, le=100)
    srm_max: int | None = Field(default=None, ge=0, le=100)
    description: str | None = None
    is_active: bool = True

    @model_validator(mode="after")
    def _check_intervals(self) -> BeerBase:
        _validate_intervals(self.ibu_min, self.ibu_max, self.srm_min, self.srm_max)
        return self


class BeerCreate(BeerBase):
    """Body payload for ``POST /beers``."""


class BeerUpdate(BaseModel):
    """Body payload for ``PATCH /beers/{id}`` — every field optional."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    brewery_id: uuid.UUID | None = None
    style_id: uuid.UUID | None = None
    abv: Decimal | None = Field(default=None, ge=0, le=100)
    ibu_min: int | None = Field(default=None, ge=0, le=1000)
    ibu_max: int | None = Field(default=None, ge=0, le=1000)
    srm_min: int | None = Field(default=None, ge=0, le=100)
    srm_max: int | None = Field(default=None, ge=0, le=100)
    description: str | None = None
    is_active: bool | None = None
    is_verified: bool | None = None

    @model_validator(mode="after")
    def _check_intervals(self) -> BeerUpdate:
        # Validates ordering within the payload. A partial PATCH that supplies
        # only one bound is checked against the stored value by the DB CHECK.
        _validate_intervals(self.ibu_min, self.ibu_max, self.srm_min, self.srm_max)
        return self


class BeerRead(BeerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    # Denormalised names resolved from the brewery_id / style_id FKs so
    # clients (the mobile scan fiche) can display "BrewDog" / "IPA" without a
    # second round-trip. Read-only projections of the Beer→Brewery / Beer→Style
    # relations (07-class-api-contract); null when the FK or the relation is
    # unresolved. Only endpoints that resolve them populate these.
    brewery_name: str | None = None
    style_name: str | None = None
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
