"""Pydantic schemas for the /beers endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from api.schemas.common import PaginationMeta


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
    created_at: datetime
    updated_at: datetime


class BeerList(BaseModel):
    items: list[BeerRead] = Field(default_factory=list)
    meta: PaginationMeta
