"""Pagination and search primitives shared across CRUD schemas."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
SEARCH_SIMILARITY_THRESHOLD = 0.3


class PaginationMeta(BaseModel):
    """Meta envelope returned with every paginated list response."""

    model_config = ConfigDict(from_attributes=True)

    total: int = Field(ge=0, description="Total rows matching the query.")
    page: int = Field(ge=1, description="1-based page index.")
    per_page: int = Field(ge=1, le=MAX_PAGE_SIZE)
