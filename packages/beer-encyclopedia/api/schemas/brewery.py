"""Pydantic schemas for the /breweries endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from api.schemas.common import PaginationMeta


class BreweryBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    brewery_type: str | None = Field(default=None, max_length=50)
    address_1: str | None = Field(default=None, max_length=255)
    address_2: str | None = Field(default=None, max_length=255)
    address_3: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state_province: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    phone: str | None = Field(default=None, max_length=30)
    website_url: str | None = Field(default=None, max_length=512)
    description: str | None = None
    founded_year: int | None = Field(default=None, ge=1000, le=2100)


class BreweryCreate(BreweryBase):
    """Body payload for ``POST /breweries``."""


class BreweryUpdate(BaseModel):
    """Body payload for ``PATCH /breweries/{id}`` — every field optional."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    brewery_type: str | None = Field(default=None, max_length=50)
    address_1: str | None = Field(default=None, max_length=255)
    address_2: str | None = Field(default=None, max_length=255)
    address_3: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=100)
    state_province: str | None = Field(default=None, max_length=100)
    postal_code: str | None = Field(default=None, max_length=20)
    country: str | None = Field(default=None, max_length=100)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    phone: str | None = Field(default=None, max_length=30)
    website_url: str | None = Field(default=None, max_length=512)
    description: str | None = None
    founded_year: int | None = Field(default=None, ge=1000, le=2100)
    is_verified: bool | None = None


class BreweryRead(BreweryBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    is_verified: bool
    created_at: datetime
    updated_at: datetime


class BreweryList(BaseModel):
    items: list[BreweryRead] = Field(default_factory=list)
    meta: PaginationMeta
