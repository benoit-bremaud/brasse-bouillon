"""Pydantic schemas for the /styles endpoints (read-only)."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from api.schemas.common import PaginationMeta


class StyleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    category: str | None
    description: str | None
    abv_min: Decimal | None
    abv_max: Decimal | None
    ibu_min: int | None
    ibu_max: int | None
    srm_min: int | None
    srm_max: int | None
    created_at: datetime
    updated_at: datetime


class StyleList(BaseModel):
    items: list[StyleRead] = Field(default_factory=list)
    meta: PaginationMeta
