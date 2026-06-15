"""CRUD + fuzzy-search endpoints for /beers.

Same shape as /breweries, plus extra list filters (style, brewery, ABV
range) and FK validation on create/update so a client cannot attach a
beer to a non-existent brewery or style.

Adds ``POST /beers/import-by-ean`` (PR2): a one-shot bridge to Open
Food Facts that converts a scanned barcode into an enriched beer row,
backed by the polymorphic ``EntitySource`` audit trail.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.db_utils import is_postgres
from api.dependencies import get_db
from api.schemas.beer import (
    BeerCreate,
    BeerImportByEanRequest,
    BeerList,
    BeerRead,
    BeerUpdate,
)
from api.schemas.common import (
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    PaginationMeta,
)
from api.slug import create_with_unique_slug
from db.models import Beer, Brewery, Style
from importers import (
    OpenFoodFactsClient,
    OpenFoodFactsError,
    SourceNotSeededError,
    upsert_beer_from_snapshot,
)

router = APIRouter(prefix="/beers", tags=["beers"])


async def get_openfoodfacts_client() -> AsyncIterator[OpenFoodFactsClient]:
    """Provide an :class:`OpenFoodFactsClient` to a request handler.

    Exposed as a FastAPI dependency so tests can override it via
    ``app.dependency_overrides`` and inject a stub that never touches
    the network. The default factory builds a short-lived client whose
    underlying ``httpx.AsyncClient`` is closed by ``aclose`` on exit.
    Mirrors the ``get_db`` pattern in ``db/engine.py``.
    """

    client = OpenFoodFactsClient()
    try:
        yield client
    finally:
        await client.aclose()


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


async def _beer_read_with_names(session: AsyncSession, beer: Beer) -> BeerRead:
    """Serialise a ``Beer`` to ``BeerRead`` with the denormalised
    ``brewery_name`` / ``style_name`` resolved from the FKs
    (see ``07-class-api-contract``).

    Resolves via ``session.get`` (identity-map first, no extra query when the
    row is already loaded) rather than touching ``beer.brewery`` /
    ``beer.style`` relationship attributes — the engine is async, where a
    lazy-load on an unloaded relationship raises. Names are ``None`` when the
    FK is null or points to a missing row.
    """

    dto = BeerRead.model_validate(beer)
    brewery_name: str | None = None
    style_name: str | None = None
    if beer.brewery_id is not None:
        brewery = await session.get(Brewery, beer.brewery_id)
        brewery_name = brewery.name if brewery is not None else None
    if beer.style_id is not None:
        style = await session.get(Style, beer.style_id)
        style_name = style.name if style is not None else None
    return dto.model_copy(update={"brewery_name": brewery_name, "style_name": style_name})


@router.post(
    "/import-by-ean",
    response_model=BeerRead,
    responses={
        200: {
            "description": (
                "Beer already known to the encyclopedia. Returned either "
                "from a direct DB hit on `Beer.ean_code` (no Open Food "
                "Facts call) or after Open Food Facts refreshed an "
                "existing row matched downstream by EAN."
            )
        },
        201: {
            "description": (
                "Beer was unknown to the encyclopedia and has been "
                "created from the Open Food Facts payload."
            )
        },
        404: {"description": ("EAN is unknown both to the local database and to Open Food Facts.")},
        503: {
            "description": (
                "Open Food Facts is unavailable or returned an unexpected "
                "payload, and the EAN was not in the local database. "
                "Try again later."
            )
        },
    },
)
async def import_beer_by_ean(
    payload: BeerImportByEanRequest,
    response: Response,
    session: AsyncSession = Depends(get_db),
    off_client: OpenFoodFactsClient = Depends(get_openfoodfacts_client),
) -> BeerRead:
    """Bootstrap or refresh a beer row from an Open Food Facts lookup.

    **DB-first.** When the EAN is already known in the encyclopedia the
    handler returns the existing row immediately with HTTP 200 and
    never calls OFF — saving a network round-trip (~200–500 ms) and
    keeping the endpoint usable when OFF is down for an EAN we already
    have. The Open Food Facts call only fires on a database miss.

    Status semantics:

    - ``200 OK`` — the EAN matched an existing ``Beer`` row (no OFF
      call) **or** OFF returned a payload that refreshed an existing
      row matched by ``ean_code`` inside ``upsert_beer_from_snapshot``.
    - ``201 Created`` — the EAN was unknown to the encyclopedia, OFF
      returned a payload, and a new row was inserted.
    - ``404 Not Found`` — the EAN is unknown both to the DB and to OFF.
    - ``503 Service Unavailable`` — OFF transport / payload / seed-state
      failure. Distinct from 404 so a client can branch on "unknown
      product" vs "service hiccup".
    """

    # DB-first: skip OFF entirely when the encyclopedia already has the
    # row. Two upsides: (1) zero network call on the warm path, (2) the
    # endpoint stays available even when OFF is degraded for a code we
    # have on file. The cold path (DB miss) preserves the original
    # OFF → upsert flow below.
    existing = (
        await session.execute(select(Beer).where(Beer.ean_code == payload.ean))
    ).scalar_one_or_none()
    if existing is not None:
        response.status_code = status.HTTP_200_OK
        return await _beer_read_with_names(session, existing)

    try:
        snapshot = await off_client.fetch_by_ean(payload.ean)
    except OpenFoodFactsError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Open Food Facts unavailable: {exc}",
        ) from exc

    if snapshot is None:
        raise HTTPException(
            status_code=404,
            detail=f"Open Food Facts has no product for EAN {payload.ean}.",
        )

    try:
        result = await upsert_beer_from_snapshot(
            session,
            snapshot=snapshot,
            source_name="openfoodfacts",
        )
    except SourceNotSeededError as exc:
        # Surface the missing-source failure as a 503 rather than a 500
        # so the operator gets an actionable message: the fix is to run
        # the seed script, not to debug the import code.
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    response.status_code = status.HTTP_201_CREATED if result.created else status.HTTP_200_OK
    return await _beer_read_with_names(session, result.beer)


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

    # Eager-load brewery + style so `_beer_read_with_names` resolves the
    # denormalised names from the identity map (no per-row query / N+1).
    base_stmt = select(Beer).options(selectinload(Beer.brewery), selectinload(Beer.style))
    count_stmt = select(func.count()).select_from(Beer)
    for flt in filters:
        base_stmt = base_stmt.where(flt)
        count_stmt = count_stmt.where(flt)

    total = (await session.execute(count_stmt)).scalar_one()
    stmt = base_stmt.order_by(Beer.name).offset((page - 1) * per_page).limit(per_page)
    items = (await session.execute(stmt)).scalars().all()
    return BeerList(
        items=[await _beer_read_with_names(session, b) for b in items],
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
        .options(selectinload(Beer.brewery), selectinload(Beer.style))
        .where(where_clause)
        .order_by(order_clause)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    items = (await session.execute(stmt)).scalars().all()
    return BeerList(
        items=[await _beer_read_with_names(session, b) for b in items],
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
    return await _beer_read_with_names(session, beer)


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
