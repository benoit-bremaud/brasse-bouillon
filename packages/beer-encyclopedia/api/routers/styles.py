"""Read-only /styles endpoints.

The style catalog is operator-curated (seeded by ``scripts/seed_styles.py``).
The API exposes list + detail only; writes go through the seed script.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.dependencies import get_db
from api.schemas.common import DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, PaginationMeta
from api.schemas.style import StyleList, StyleRead
from db.models import Style

router = APIRouter(prefix="/styles", tags=["styles"])


@router.get("", response_model=StyleList)
async def list_styles(
    session: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    per_page: int = Query(DEFAULT_PAGE_SIZE, ge=1, le=MAX_PAGE_SIZE),
) -> StyleList:
    total = (
        await session.execute(select(func.count()).select_from(Style))
    ).scalar_one()
    stmt = (
        select(Style)
        .order_by(Style.name)
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    items = (await session.execute(stmt)).scalars().all()
    return StyleList(
        items=[StyleRead.model_validate(s) for s in items],
        meta=PaginationMeta(total=total, page=page, per_page=per_page),
    )


@router.get("/{style_id}", response_model=StyleRead)
async def get_style(
    style_id: uuid.UUID,
    session: AsyncSession = Depends(get_db),
) -> StyleRead:
    style = (
        await session.execute(select(Style).where(Style.id == style_id))
    ).scalar_one_or_none()
    if style is None:
        raise HTTPException(status_code=404, detail="Style not found.")
    return StyleRead.model_validate(style)
