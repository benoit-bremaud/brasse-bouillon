"""CRUD + fuzzy-search endpoints for /beers.

Same shape as /breweries, plus extra list filters (style, brewery, ABV
range) and FK validation on create/update so a client cannot attach a
beer to a non-existent brewery or style.
"""

from __future__ import annotations

import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.db_utils import is_postgres
from api.dependencies import get_db
from api.schemas.beer import BeerCreate, BeerList, BeerRead, BeerUpdate
from api.schemas.common import (
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    PaginationMeta,
)
from api.slug import create_with_unique_slug
from db.models import Beer, Brewery, Style

router = APIRouter(prefix="/beers", tags=["beers"])


async def _validate_fks(
    session: AsyncSession,
    *,
    brewery_id: uuid.UUID | None,
    style_id: uuid.UUID | None,
) -> None:
    """Reject up-front FKs that point to missing rows.

    Without this check the DB would still reject the insert/update, but
    with a less actionable 500-level error. Validating at the edge keeps
    the 4xx message precise and avoids wasted round-trips.
    """

    if brewery_id is not None and await session.get(Brewery, brewery_id) is None:
        raise HTTPException(status_code=422, detail="brewery_id does not exist.")
    if style_id is not None and await session.get(Style, style_id) is None:
        raise HTTPException(status_code=422, detail="style_id does not exist.")


@router.get("", response_model=BeerList)
async def list_beers(
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
    style_id: uuid.UUID | None = None,
    brewery_id: uuid.UUID | None = None,
    abv_min: Decimal | None = Query(None, ge=0, le=100),
    abv_max: Decimal | None = Query(None, ge=0, le=100),
) -> BeerList:
    filters = []
    if style_id is not None:
        filters.append(Beer.style_id == style_id)
    if brewery_id is not None:
        filters.append(Beer.brewery_id == brewery_id)
    if abv_min is not None:
        filters.append(Beer.abv >= abv_min)
    if abv_max is not None:
        filters.append(Beer.abv <= abv_max)

    base_stmt = select(Beer)
    count_stmt = select(func.count()).select_from(Beer)
    for flt in filters:
        base_stmt = base_stmt.where(flt)
        count_stmt = count_stmt.where(flt)

    total = (await session.execute(count_stmt)).scalar_one()
    stmt = (
        base_stmt.order_by(Beer.name)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    items = (await session.execute(stmt)).scalars().all()
    return BeerList(
        items=[BeerRead.model_validate(b) for b in items],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/search", response_model=BeerList)
async def search_beers(
    q: str = Query(..., min_length=1, max_length=100),
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
) -> BeerList:
    if is_postgres(session):
        # `%` uses the GIN trigram index (pg_trgm.similarity_threshold gate),
        # `similarity()` only ranks; avoids a full table scan on large data.
        where_clause = Beer.name.op("%")(q)
        order_clause = func.similarity(Beer.name, q).desc()
    else:
        where_clause = func.lower(Beer.name).contains(q.lower())
        order_clause = Beer.name

    count_stmt = select(func.count()).select_from(Beer).where(where_clause)
    total = (await session.execute(count_stmt)).scalar_one()

    stmt = (
        select(Beer)
        .where(where_clause)
        .order_by(order_clause)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    items = (await session.execute(stmt)).scalars().all()
    return BeerList(
        items=[BeerRead.model_validate(b) for b in items],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/{beer_id}", response_model=BeerRead)
async def get_beer(
    beer_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
) -> BeerRead:
    beer = await session.get(Beer, beer_id)
    if beer is None:
        raise HTTPException(status_code=404, detail="Beer not found.")
    return BeerRead.model_validate(beer)


@router.post("", response_model=BeerRead, status_code=status.HTTP_201_CREATED)
async def create_beer(
    payload: BeerCreate,
    session: AsyncSession = Depends(get_db),
) -> BeerRead:
    await _validate_fks(session, brewery_id=payload.brewery_id, style_id=payload.style_id)
    beer = await create_with_unique_slug(
        session,
        model_cls=Beer,
        slug_column=Beer.slug,
        name=payload.name,
        attributes=payload.model_dump(),
    )
    return BeerRead.model_validate(beer)


@router.patch("/{beer_id}", response_model=BeerRead)
async def update_beer(
    beer_id: uuid.UUID,
    payload: BeerUpdate,
    session: AsyncSession = Depends(get_db),
) -> BeerRead:
    beer = await session.get(Beer, beer_id)
    if beer is None:
        raise HTTPException(status_code=404, detail="Beer not found.")

    updates = payload.model_dump(exclude_unset=True)
    await _validate_fks(
        session,
        brewery_id=updates.get("brewery_id"),
        style_id=updates.get("style_id"),
    )
    for field, value in updates.items():
        setattr(beer, field, value)
    await session.commit()
    await session.refresh(beer)
    return BeerRead.model_validate(beer)


@router.delete("/{beer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_beer(
    beer_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
) -> None:
    beer = await session.get(Beer, beer_id)
    if beer is None:
        raise HTTPException(status_code=404, detail="Beer not found.")
    await session.delete(beer)
    await session.commit()
