"""CRUD + fuzzy-search endpoints for /breweries.

Full-text search uses PostgreSQL's ``pg_trgm`` ``similarity()`` function
when available (see the migration 001 which creates both the extension
and the GIN trigram index on ``breweries.name``). On SQLite (tests) we
fall back to a case-insensitive substring match so the endpoint stays
testable without a live PostgreSQL.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db_utils import is_postgres
from api.dependencies import get_db
from api.schemas.brewery import (
    BreweryCreate,
    BreweryList,
    BreweryRead,
    BreweryUpdate,
)
from api.schemas.common import (
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    PaginationMeta,
)
from api.slug import create_with_unique_slug
from db.models import Brewery

router = APIRouter(prefix="/breweries", tags=["breweries"])


@router.get("", response_model=BreweryList)
async def list_breweries(
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    country: str | None = Query(None, max_length=100),
    city: str | None = Query(None, max_length=100),
    brewery_type: str | None = Query(None, max_length=50),
) -> BreweryList:
    filters = []
    if country is not None:
        filters.append(Brewery.country == country)
    if city is not None:
        filters.append(Brewery.city == city)
    if brewery_type is not None:
        filters.append(Brewery.brewery_type == brewery_type)

    base_stmt = select(Brewery)
    count_stmt = select(func.count()).select_from(Brewery)
    for flt in filters:
        base_stmt = base_stmt.where(flt)
        count_stmt = count_stmt.where(flt)

    total = (await session.execute(count_stmt)).scalar_one()
    stmt = (
        base_stmt.order_by(Brewery.name)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    items = (await session.execute(stmt)).scalars().all()
    return BreweryList(
        items=[BreweryRead.model_validate(b) for b in items],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/search", response_model=BreweryList)
async def search_breweries(
    q: str = Query(..., min_length=1, max_length=100),
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
) -> BreweryList:
    if is_postgres(session):
        # `%` uses the GIN trigram index (pg_trgm.similarity_threshold gate),
        # `similarity()` only ranks; avoids a full table scan on large data.
        where_clause = Brewery.name.op("%")(q)
        order_clause = func.similarity(Brewery.name, q).desc()
    else:
        # SQLite fallback: case-insensitive substring match, alphabetical order.
        where_clause = func.lower(Brewery.name).contains(q.lower())
        order_clause = Brewery.name

    count_stmt = select(func.count()).select_from(Brewery).where(where_clause)
    total = (await session.execute(count_stmt)).scalar_one()

    stmt = (
        select(Brewery)
        .where(where_clause)
        .order_by(order_clause)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    items = (await session.execute(stmt)).scalars().all()
    return BreweryList(
        items=[BreweryRead.model_validate(b) for b in items],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/{brewery_id}", response_model=BreweryRead)
async def get_brewery(
    brewery_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
) -> BreweryRead:
    brewery = await session.get(Brewery, brewery_id)
    if brewery is None:
        raise HTTPException(status_code=404, detail="Brewery not found.")
    return BreweryRead.model_validate(brewery)


@router.post("", response_model=BreweryRead, status_code=status.HTTP_201_CREATED)
async def create_brewery(
    payload: BreweryCreate,
    session: AsyncSession = Depends(get_db),
) -> BreweryRead:
    brewery = await create_with_unique_slug(
        session,
        model_cls=Brewery,
        slug_column=Brewery.slug,
        name=payload.name,
        attributes=payload.model_dump(),
    )
    return BreweryRead.model_validate(brewery)


@router.patch("/{brewery_id}", response_model=BreweryRead)
async def update_brewery(
    brewery_id: uuid.UUID,
    payload: BreweryUpdate,
    session: AsyncSession = Depends(get_db),
) -> BreweryRead:
    brewery = await session.get(Brewery, brewery_id)
    if brewery is None:
        raise HTTPException(status_code=404, detail="Brewery not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(brewery, field, value)
    await session.commit()
    await session.refresh(brewery)
    return BreweryRead.model_validate(brewery)


@router.delete("/{brewery_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_brewery(
    brewery_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
) -> None:
    brewery = await session.get(Brewery, brewery_id)
    if brewery is None:
        raise HTTPException(status_code=404, detail="Brewery not found.")
    await session.delete(brewery)
    await session.commit()
